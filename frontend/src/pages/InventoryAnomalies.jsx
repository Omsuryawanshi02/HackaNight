import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Info
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function InventoryAnomalies({ 
  anomalies = [], 
  onUpdateAnomalyStatus, 
  onNavigateToAuditorReview,
  onShowToast 
}) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredAnomalies = anomalies.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      a.id.toLowerCase().includes(query) ||
      a.material.toLowerCase().includes(query) ||
      a.project.toLowerCase().includes(query) ||
      a.anomalyType.toLowerCase().includes(query) ||
      a.explanation.toLowerCase().includes(query)
    );
  });

  const highCount = anomalies.filter(a => a.severity === 'High').length;
  const mediumCount = anomalies.filter(a => a.severity === 'Medium').length;
  const lowCount = anomalies.filter(a => a.severity === 'Low').length;

  const handleStatusChange = (id, newStatus) => {
    onUpdateAnomalyStatus?.(id, newStatus);
    onShowToast?.({
      type: 'success',
      title: 'Status Updated',
      message: `Anomaly ${id} marked as ${newStatus}.`
    });
  };

  return (
    <div className="space-y-6 font-sans text-[#29231D]">
      {/* Top Banner */}
      <div className="porcelain-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider font-['Outfit']">
              Statistical Anomaly Detection
            </span>
            <span className="text-xs text-[#6F7889] font-medium">• Threshold & Heuristic Rule Engine</span>
          </div>
          <h1 className="text-2xl font-black text-[#29231D] mt-1.5 tracking-tight font-['Outfit']">Inventory & Delivery Anomaly Monitor</h1>
          <p className="text-xs text-[#6F7889] font-medium mt-1">
            Flags unusual material consumption spikes, recurring delivery tare shortages, and missing documentary compliance.
          </p>
        </div>

        {/* Severity Quick Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>High: {highCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Med: {mediumCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#EDE5D6] border border-[#E4D8BE] text-[#29231D] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6F7889]"></span>
            <span>Low: {lowCount}</span>
          </div>
        </div>
      </div>

      {/* Transparent Model & Rule Engine Disclaimer Box */}
      <div className="p-4 rounded-xl bg-[#EDE5D6]/50 border border-[#E4D8BE] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#8f7215] shrink-0 mt-0.5" />
        <div className="text-xs text-[#29231D] leading-relaxed font-medium">
          <span className="font-bold text-[#29231D]">Transparent Engineering Thresholds: </span>
          Current flags are calculated using transparent physical tolerances (±5% wastage threshold, consecutive tare deviation rules, and NABL test requirements). Architecture is structured for backend Isolation Forest anomaly modeling.
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="porcelain-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6F7889] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anomalies by ID, material, or project..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#EDE5D6] border border-[#E4D8BE] rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#6F7889]" />
            <span className="text-[#6F7889] font-bold">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-[#29231D] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#FFFDF8] text-[#29231D]">All Severities</option>
              <option value="High" className="bg-[#FFFDF8] text-[#29231D]">High Severity</option>
              <option value="Medium" className="bg-[#FFFDF8] text-[#29231D]">Medium Severity</option>
              <option value="Low" className="bg-[#FFFDF8] text-[#29231D]">Low Severity</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#EDE5D6] border border-[#E4D8BE] rounded-xl px-3 py-1.5 text-xs">
            <span className="text-[#6F7889] font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-[#29231D] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#FFFDF8] text-[#29231D]">All Statuses</option>
              <option value="Open" className="bg-[#FFFDF8] text-[#29231D]">Open</option>
              <option value="Under Investigation" className="bg-[#FFFDF8] text-[#29231D]">Under Investigation</option>
              <option value="Resolved" className="bg-[#FFFDF8] text-[#29231D]">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomalies Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnomalies.length === 0 ? (
          <div className="col-span-2 porcelain-card border-dashed p-8 text-center text-xs text-[#6F7889] font-medium">
            No inventory anomalies match your active filters.
          </div>
        ) : (
          filteredAnomalies.map((anom) => (
            <div
              key={anom.id}
              className={`porcelain-card p-6 transition-all hover:-translate-y-0.5 flex flex-col justify-between ${
                anom.severity === 'High' 
                  ? 'border-rose-300' 
                  : anom.severity === 'Medium' 
                  ? 'border-amber-300' 
                  : 'border-[#E4D8BE]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#29231D]">{anom.id}</span>
                      <StatusBadge status={anom.severity} size="sm" />
                      <span className="text-[10px] text-[#6F7889] font-semibold">• {anom.detectedAt}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#29231D] mt-1.5 tracking-tight font-['Outfit']">{anom.material}</h3>
                    <p className="text-xs text-[#6F7889] font-medium">{anom.project}</p>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-[#EDE5D6] text-[#29231D] border-[#E4D8BE]">
                    {anom.status}
                  </span>
                </div>

                {/* Variance Strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-[#EDE5D6]/40 rounded-xl text-center border border-[#E4D8BE]">
                  <div>
                    <span className="text-[10px] text-[#6F7889] font-bold block">Expected</span>
                    <span className="text-xs font-bold text-[#29231D] block truncate" title={anom.expectedValue}>
                      {anom.expectedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6F7889] font-bold block">Observed</span>
                    <span className="text-xs font-bold text-[#29231D] block truncate" title={anom.observedValue}>
                      {anom.observedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6F7889] font-bold block">Variance</span>
                    <span className={`text-xs font-bold block ${anom.severity === 'High' ? 'text-rose-600' : 'text-[#8f7215]'}`}>
                      {anom.variance}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-3.5">
                  <h4 className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">
                    {anom.anomalyType}
                  </h4>
                  <p className="text-xs text-[#29231D] mt-1 leading-relaxed font-medium">
                    {anom.explanation}
                  </p>
                </div>

                {/* Action */}
                <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-[#29231D]">
                  <span className="font-bold text-[#8f7215]">Recommended Action: </span>
                  {anom.recommendedAction}
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="mt-4 pt-3.5 border-t border-[#E4D8BE] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#6F7889] font-bold">Review Status:</span>
                  <select
                    value={anom.status}
                    onChange={(e) => handleStatusChange(anom.id, e.target.value)}
                    className="text-xs font-bold bg-[#FFFDF8] border border-[#E4D8BE] rounded-lg px-2.5 py-1 text-[#29231D] focus:outline-none cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {onNavigateToAuditorReview && (
                  <button
                    onClick={() => onNavigateToAuditorReview(anom)}
                    className="text-xs font-bold text-[#8f7215] hover:underline flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Escalate to Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
