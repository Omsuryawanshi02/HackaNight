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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
              Statistical Anomaly Detection
            </span>
            <span className="text-xs text-[#8b8c8e]">• Threshold & Heuristic Rule Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">Inventory & Delivery Anomaly Monitor</h1>
          <p className="text-xs text-[#8b8c8e] mt-1">
            Flags unusual material consumption spikes, recurring delivery tare shortages, and missing documentary compliance.
          </p>
        </div>

        {/* Severity Quick Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>High: {highCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FFE14F]/15 border border-[#FFE14F]/30 text-[#FFE14F] text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFE14F]"></span>
            <span>Med: {mediumCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Low: {lowCount}</span>
          </div>
        </div>
      </div>

      {/* Transparent Model & Rule Engine Disclaimer Box */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 flex items-start gap-3 backdrop-blur-md">
        <Info className="w-5 h-5 text-[#FFE14F] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">Transparent Engineering Thresholds: </span>
          Current flags are calculated using transparent physical tolerances (±5% wastage threshold, consecutive tare deviation rules, and NABL test requirements). Architecture is structured for backend Isolation Forest anomaly modeling.
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anomalies by ID, material, or project..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 glass-chip rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#8b8c8e] font-medium">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#1e3264] text-white">All Severities</option>
              <option value="High" className="bg-[#1e3264] text-white">High Severity</option>
              <option value="Medium" className="bg-[#1e3264] text-white">Medium Severity</option>
              <option value="Low" className="bg-[#1e3264] text-white">Low Severity</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 glass-chip rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[#8b8c8e] font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#1e3264] text-white">All Statuses</option>
              <option value="Open" className="bg-[#1e3264] text-white">Open</option>
              <option value="Under Investigation" className="bg-[#1e3264] text-white">Under Investigation</option>
              <option value="Resolved" className="bg-[#1e3264] text-white">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomalies Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnomalies.length === 0 ? (
          <div className="col-span-2 glass-card border-dashed p-8 text-center text-xs text-[#8b8c8e]">
            No inventory anomalies match your active filters.
          </div>
        ) : (
          filteredAnomalies.map((anom) => (
            <div
              key={anom.id}
              className={`glass-card p-6 transition-all hover:-translate-y-0.5 flex flex-col justify-between ${
                anom.severity === 'High' 
                  ? 'border-rose-500/25 hover:border-rose-500/40' 
                  : anom.severity === 'Medium' 
                  ? 'border-[#FFE14F]/25 hover:border-[#FFE14F]/40' 
                  : 'border-white/8 hover:border-white/15'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{anom.id}</span>
                      <StatusBadge status={anom.severity} size="sm" />
                      <span className="text-[10px] text-[#8b8c8e]">• {anom.detectedAt}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 tracking-tight">{anom.material}</h3>
                    <p className="text-xs text-[#8b8c8e]">{anom.project}</p>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-white/4 text-slate-300 border-white/8">
                    {anom.status}
                  </span>
                </div>

                {/* Variance Strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-white/3 rounded-xl text-center border border-white/6">
                  <div>
                    <span className="text-[10px] text-[#8b8c8e] font-medium block">Expected</span>
                    <span className="text-xs font-bold text-white block truncate" title={anom.expectedValue}>
                      {anom.expectedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b8c8e] font-medium block">Observed</span>
                    <span className="text-xs font-bold text-white block truncate" title={anom.observedValue}>
                      {anom.observedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b8c8e] font-medium block">Variance</span>
                    <span className={`text-xs font-bold block ${anom.severity === 'High' ? 'text-rose-400' : 'text-[#FFE14F]'}`}>
                      {anom.variance}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-3.5">
                  <h4 className="text-[11px] font-bold text-[#c8c8cb] uppercase tracking-wider">
                    {anom.anomalyType}
                  </h4>
                  <p className="text-xs text-[#8b8c8e] mt-1 leading-relaxed">
                    {anom.explanation}
                  </p>
                </div>

                {/* Action */}
                <div className="mt-3.5 p-3 rounded-xl bg-white/3 border border-white/8 text-xs text-slate-200">
                  <span className="font-bold text-[#FFE14F]">Recommended Action: </span>
                  {anom.recommendedAction}
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="mt-4 pt-3.5 border-t border-white/6 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#8b8c8e] font-medium">Review Status:</span>
                  <select
                    value={anom.status}
                    onChange={(e) => handleStatusChange(anom.id, e.target.value)}
                    className="text-xs font-semibold bg-[#1e3264] border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {onNavigateToAuditorReview && (
                  <button
                    onClick={() => onNavigateToAuditorReview(anom)}
                    className="text-xs font-semibold text-[#FFE14F] hover:text-white flex items-center gap-1 transition cursor-pointer"
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
