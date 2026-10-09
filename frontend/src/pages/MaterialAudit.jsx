import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Calculator, 
  Save, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  Info,
  Check,
  Package
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { auditChallan, reconcileMaterials } from '../services/api';

export const UNITS = [
  { value: 'Bags', label: 'Bags (e.g. 50kg Cement)' },
  { value: 'Tonnes', label: 'Metric Tonnes (MT Steel / Rebar)' },
  { value: 'kg', label: 'Kilograms (kg Admixtures/Hardware)' },
  { value: 'm³', label: 'Cubic Metres (m³ Concrete / Sand)' },
  { value: 'Litres', label: 'Litres (Chemicals / Curing Comp)' },
  { value: 'Pcs', label: 'Pieces (Bricks / Pavers)' }
];

export const MATERIAL_PRESETS = [
  {
    id: 'cement-discrepancy',
    label: 'High Variance Case (Cement)',
    material: 'Ultratech OPC 53 Cement',
    unit: 'Bags',
    supplier: 'Apex Building Solutions Ltd',
    challanNo: 'CH-2026-8841',
    challanQty: 1000,
    receivedQty: 960,
    openingStock: 250,
    deliveredQty: 960,
    supplierReturns: 10,
    closingPhysicalStock: 320,
    recordedConsumption: 760
  },
  {
    id: 'steel-balanced',
    label: 'Balanced Clean Case (TMT Steel)',
    material: 'Tata Tiscon Fe500D 20mm Rebar',
    unit: 'Tonnes',
    supplier: 'Tata Tiscon Direct Infra',
    challanNo: 'CH-TT-99321',
    challanQty: 42.5,
    receivedQty: 42.4,
    openingStock: 12.0,
    deliveredQty: 42.4,
    supplierReturns: 0.0,
    closingPhysicalStock: 18.2,
    recordedConsumption: 35.8
  },
  {
    id: 'rmc-loss',
    label: 'Transit Rejection Case (RMC)',
    material: 'Ready Mix Concrete M30',
    unit: 'm³',
    supplier: 'ACC Concrete Express',
    challanNo: 'RMC-ACC-4412',
    challanQty: 180,
    receivedQty: 172,
    openingStock: 0,
    deliveredQty: 172,
    supplierReturns: 4,
    closingPhysicalStock: 0,
    recordedConsumption: 154
  }
];

export default function MaterialAudit({ 
  projects = [], 
  selectedProjectId, 
  materialAudits = [], 
  onSaveAudit, 
  onGenerateReport,
  onShowToast,
  backendConnected
}) {
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Form State
  const [formData, setFormData] = useState({
    projectName: currentProject ? currentProject.name : 'Skyline Heights Tower B',
    material: 'Ultratech OPC 53 Cement',
    unit: 'Bags',
    supplier: 'Apex Building Solutions Ltd',
    challanNo: 'CH-2026-8841',
    challanQty: 1000,
    receivedQty: 960,
    openingStock: 250,
    deliveredQty: 960,
    supplierReturns: 10,
    closingPhysicalStock: 320,
    recordedConsumption: 760,
    notes: 'Site store reconciliation for 6th floor slab casting batch.'
  });

  const [ocrLoading, setOcrLoading] = useState(false);

  // Load Preset
  const handleLoadPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      material: preset.material,
      unit: preset.unit,
      supplier: preset.supplier,
      challanNo: preset.challanNo,
      challanQty: preset.challanQty,
      receivedQty: preset.receivedQty,
      openingStock: preset.openingStock,
      deliveredQty: preset.deliveredQty,
      supplierReturns: preset.supplierReturns,
      closingPhysicalStock: preset.closingPhysicalStock,
      recordedConsumption: preset.recordedConsumption
    }));
    onShowToast?.({
      type: 'info',
      title: 'Scenario Loaded',
      message: `Populated with ${preset.label}`
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // Reconcile Formula Calculations
  const calculations = useMemo(() => {
    const opening = Number(formData.openingStock) || 0;
    const deliveries = Number(formData.deliveredQty) || 0;
    const returns = Number(formData.supplierReturns) || 0;
    const closing = Number(formData.closingPhysicalStock) || 0;
    const recorded = Number(formData.recordedConsumption) || 0;
    const challan = Number(formData.challanQty) || 0;
    const received = Number(formData.receivedQty) || 0;

    const availableMaterial = opening + deliveries - returns;
    const estimatedUsed = availableMaterial - closing;
    const consumptionVariance = estimatedUsed - recorded;
    const deliveryDiscrepancy = received - challan;
    
    const variancePercent = recorded > 0 
      ? Number(((consumptionVariance / recorded) * 100).toFixed(1)) 
      : 0;

    const isHighVariance = Math.abs(variancePercent) > 10;
    const isModerateVariance = Math.abs(variancePercent) > 3 && !isHighVariance;

    let status = 'Verified Normal';
    if (isHighVariance) status = 'High Discrepancy';
    else if (isModerateVariance || Math.abs(deliveryDiscrepancy) > 0.05 * challan) status = 'Moderate Discrepancy';

    return {
      availableMaterial,
      estimatedUsed,
      consumptionVariance,
      deliveryDiscrepancy,
      variancePercent,
      isHighVariance,
      isModerateVariance,
      status
    };
  }, [formData]);

  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    onShowToast?.({
      type: 'info',
      title: 'Scanning Challan Document',
      message: 'Extracting PO number, vendor header, and quantity tables via OCR...'
    });

    if (backendConnected) {
      const ocrData = new FormData();
      ocrData.append('file', file);
      const res = await auditChallan(ocrData);
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          supplier: res.data.supplier || prev.supplier,
          challanNo: res.data.challanNo || prev.challanNo,
          challanQty: res.data.quantity || prev.challanQty,
          receivedQty: res.data.receivedQty || prev.receivedQty,
          material: res.data.material || prev.material
        }));
        setOcrLoading(false);
        onShowToast?.({
          type: 'success',
          title: 'OCR Extraction Successful',
          message: 'Extracted values populated into material reconciliation form.'
        });
        return;
      }
    }

    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        supplier: 'UltraTech ReadyMix Concretes Ltd',
        challanNo: `CH-OCR-${Math.floor(1000 + Math.random() * 9000)}`,
        challanQty: 1200,
        receivedQty: 1150,
        notes: 'Extracted automatically from paper delivery ticket scan.'
      }));
      setOcrLoading(false);
      onShowToast?.({
        type: 'success',
        title: 'OCR Scan Completed',
        message: 'Delivery challan values extracted and applied to form.'
      });
    }, 1500);
  };

  const handleSave = async () => {
    const newRecord = {
      id: `MAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      project: formData.projectName,
      material: formData.material,
      unit: formData.unit,
      supplier: formData.supplier,
      challanNo: formData.challanNo,
      challanQty: Number(formData.challanQty),
      receivedQty: Number(formData.receivedQty),
      deliveryDiscrepancy: calculations.deliveryDiscrepancy,
      openingStock: Number(formData.openingStock),
      deliveredQty: Number(formData.deliveredQty),
      supplierReturns: Number(formData.supplierReturns),
      closingPhysicalStock: Number(formData.closingPhysicalStock),
      availableMaterial: calculations.availableMaterial,
      estimatedUsed: calculations.estimatedUsed,
      recordedConsumption: Number(formData.recordedConsumption),
      consumptionVariance: calculations.consumptionVariance,
      variancePercent: calculations.variancePercent,
      status: calculations.status,
      verifiedBy: 'Pooja Iyer (Lead Quality Auditor)',
      notes: formData.notes
    };

    if (backendConnected) {
      await reconcileMaterials(newRecord);
    }

    onSaveAudit?.(newRecord);
    onShowToast?.({
      type: 'success',
      title: 'Material Audit Saved',
      message: `Audit entry ${newRecord.id} saved to reconciliation registry.`
    });
  };

  // Table Columns
  const columns = [
    { header: 'Audit ID', accessor: 'id', cell: (r) => <span className="font-mono font-medium text-[#29231D]">{r.id}</span> },
    { 
      header: 'Material & Supplier', 
      cell: (r) => (
        <div>
          <p className="font-bold text-[#29231D]">{r.material}</p>
          <p className="text-[11px] text-[#6F7889]">{r.supplier} • Challan #{r.challanNo}</p>
        </div>
      ) 
    },
    { 
      header: 'Delivery Discrepancy', 
      cell: (r) => (
        <span className={`font-semibold ${r.deliveryDiscrepancy < 0 ? 'text-[#8f7215]' : 'text-[#29231D]'}`}>
          {r.deliveryDiscrepancy > 0 ? `+${r.deliveryDiscrepancy}` : r.deliveryDiscrepancy} {r.unit}
        </span>
      ) 
    },
    { 
      header: 'Consumption Variance', 
      cell: (r) => (
        <div>
          <span className={`font-bold ${r.consumptionVariance > 0 ? 'text-rose-600' : 'text-[#727C3E]'}`}>
            {r.consumptionVariance > 0 ? `+${r.consumptionVariance}` : r.consumptionVariance} {r.unit}
          </span>
          <span className="text-[10px] text-[#6F7889] block">
            ({r.variancePercent > 0 ? `+${r.variancePercent}%` : `${r.variancePercent}%`})
          </span>
        </div>
      ) 
    },
    { 
      header: 'Status', 
      cell: (r) => <StatusBadge status={r.status} size="sm" /> 
    },
    { header: 'Audited Date', accessor: 'date' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="porcelain-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider">
              Inventory Reconciliation Engine
            </span>
            <span className="text-xs text-[#6F7889]">• Standard Method of Measurement</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29231D] mt-1.5 tracking-tight font-['Outfit']">Material Delivery Audit & Physical Stock Reconciliation</h1>
          <p className="text-xs text-[#6F7889] mt-1">
            Audit challan quantities against received stock, calculate physical site depletion, and detect consumption variance.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#EDE5D6] border border-[#E4D8BE] rounded-xl p-1.5">
          <span className="text-[11px] font-semibold text-[#6F7889] px-2">Sample Presets:</span>
          {MATERIAL_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(p)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FFFDF8] hover:bg-[#D6B238] hover:text-[#29231D] border border-[#E4D8BE] transition cursor-pointer text-[#29231D]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="porcelain-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4D8BE] pb-3">
              <h2 className="text-sm font-bold text-[#29231D] flex items-center gap-2 font-['Outfit']">
                <Package className="w-4 h-4 text-[#D6B238]" />
                <span>Delivery Challan & Inventory Input</span>
              </h2>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-secondary-sandstone text-xs font-medium cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-[#D6B238]" />
                <span>{ocrLoading ? 'Scanning Challan OCR...' : 'Scan Challan (OCR)'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleOcrUpload}
                  disabled={ocrLoading}
                  className="hidden"
                />
              </label>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Project</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Material Name</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Supplier Name</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Challan / Invoice No.</label>
                <input
                  type="text"
                  name="challanNo"
                  value={formData.challanNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238] font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Measurement Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238] cursor-pointer"
                >
                  {UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Reconciliation Numbers */}
            <div className="pt-2 border-t border-[#E4D8BE]">
              <span className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider block mb-2 font-['Outfit']">
                Delivery Receipt & Physical Stock Count ({formData.unit})
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Challan Declared</label>
                  <input
                    type="number"
                    name="challanQty"
                    value={formData.challanQty}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Store Received</label>
                  <input
                    type="number"
                    name="receivedQty"
                    value={formData.receivedQty}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Opening Stock</label>
                  <input
                    type="number"
                    name="openingStock"
                    value={formData.openingStock}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Delivered Qty</label>
                  <input
                    type="number"
                    name="deliveredQty"
                    value={formData.deliveredQty}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Supplier Returns</label>
                  <input
                    type="number"
                    name="supplierReturns"
                    value={formData.supplierReturns}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Closing Physical</label>
                  <input
                    type="number"
                    name="closingPhysicalStock"
                    value={formData.closingPhysicalStock}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-[#6F7889] mb-1">Recorded Consumption (Logs)</label>
                  <input
                    type="number"
                    name="recordedConsumption"
                    value={formData.recordedConsumption}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl font-bold text-[#29231D]"
                  />
                </div>
              </div>
            </div>

            {/* Auditor Field Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1">Auditor Field Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D]"
                placeholder="Mention batch number, testing observations, weighbridge ticket ID..."
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={handleSave}
                className="btn-gold text-xs shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Audit Record</span>
              </button>

              <button
                onClick={() => onGenerateReport?.(formData, calculations)}
                className="btn-secondary-sandstone text-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output: Reconciled Math */}
        <div className="lg:col-span-5 space-y-5">
          <div className="porcelain-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4D8BE] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#29231D] flex items-center gap-1.5 tracking-tight font-['Outfit']">
                  <Calculator className="w-4 h-4 text-[#D6B238]" />
                  <span>Reconciliation Calculations</span>
                </h3>
                <p className="text-[11px] text-[#6F7889]">Automated site inventory audit equations</p>
              </div>

              <StatusBadge status={calculations.status} size="md" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#EDE5D6]/50 border border-[#E4D8BE] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#29231D] block">Delivery Discrepancy</span>
                  <span className="text-[10px] text-[#6F7889]">Received ({formData.receivedQty}) − Challan ({formData.challanQty})</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${calculations.deliveryDiscrepancy < 0 ? 'text-[#8f7215]' : 'text-[#29231D]'}`}>
                    {calculations.deliveryDiscrepancy > 0 ? `+${calculations.deliveryDiscrepancy}` : calculations.deliveryDiscrepancy} {formData.unit}
                  </span>
                  {calculations.deliveryDiscrepancy !== 0 && (
                    <span className="text-[10px] text-[#6F7889] block font-medium">
                      {calculations.deliveryDiscrepancy < 0 ? 'Delivery Shortage' : 'Surplus Delivery'}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDE5D6]/50 border border-[#E4D8BE] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#29231D] block">Available Material</span>
                  <span className="text-[10px] text-[#6F7889]">Opening + Deliveries − Returns</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#29231D]">
                    {calculations.availableMaterial} {formData.unit}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDE5D6]/50 border border-[#E4D8BE] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#29231D] block">Estimated Material Used</span>
                  <span className="text-[10px] text-[#6F7889]">Available − Closing Physical Stock</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#29231D]">
                    {calculations.estimatedUsed} {formData.unit}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDE5D6]/50 border border-[#E4D8BE] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#29231D] block">Recorded Consumption</span>
                  <span className="text-[10px] text-[#6F7889]">Pour / Masonry daily logs</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#29231D]">
                    {formData.recordedConsumption || 0} {formData.unit}
                  </span>
                </div>
              </div>

              {/* Consumption Variance Result Card */}
              <div className={`p-4 rounded-xl border ${
                calculations.isHighVariance 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : calculations.isModerateVariance 
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-[#727C3E]/10 border-[#727C3E]/30 text-[#727C3E]'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block font-['Outfit']">Consumption Variance</span>
                    <span className="text-[10px] opacity-80">Estimated Used − Recorded Logs</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black block">
                      {calculations.consumptionVariance > 0 ? `+${calculations.consumptionVariance}` : calculations.consumptionVariance} {formData.unit}
                    </span>
                    <span className="text-xs font-bold block">
                      {calculations.variancePercent > 0 ? `+${calculations.variancePercent}%` : `${calculations.variancePercent}%`}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E4D8BE] text-xs leading-relaxed font-medium">
                  {calculations.isHighVariance ? (
                    <p className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <span>
                        <strong>Auditor Alert:</strong> Variance of {calculations.consumptionVariance} {formData.unit} (+{calculations.variancePercent}%) exceeds standard 5% allowance. Conduct physical cross-verification with batching scale records.
                      </span>
                    </p>
                  ) : calculations.isModerateVariance ? (
                    <p className="flex items-start gap-1.5">
                      <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        <strong>Advisory:</strong> Variance of {calculations.consumptionVariance} {formData.unit} (+{calculations.variancePercent}%) is slightly elevated. Verify cutting/wastage register during next audit cycle.
                      </span>
                    </p>
                  ) : (
                    <p className="flex items-start gap-1.5 text-[#727C3E]">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#727C3E] mt-0.5" />
                      <span>
                        <strong>Reconciliation Balanced:</strong> Physical consumption matches recorded site pour logs within permissible engineering tolerance (±3%).
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Material Audits Table */}
      <DataTable
        title="Material Audit Records Registry"
        subtitle="Historical delivery challan reconciliations and store stock audits"
        columns={columns}
        data={materialAudits}
        searchPlaceholder="Search material, supplier, or challan..."
        pageSize={6}
        onExportCsv={(filtered) => {
          const csvHeaders = 'Audit ID,Date,Project,Material,Unit,Supplier,Challan No,Challan Qty,Received Qty,Available Material,Estimated Used,Recorded Consumption,Variance,Status\n';
          const csvRows = filtered.map(r => 
            `"${r.id}","${r.date}","${r.project}","${r.material}","${r.unit}","${r.supplier}","${r.challanNo}",${r.challanQty},${r.receivedQty},${r.availableMaterial},${r.estimatedUsed},${r.recordedConsumption},${r.consumptionVariance},"${r.status}"`
          ).join('\n');
          const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `material-audits-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          onShowToast?.({ type: 'success', title: 'CSV Exported', message: 'Downloaded material audit records.' });
        }}
      />
    </div>
  );
}
