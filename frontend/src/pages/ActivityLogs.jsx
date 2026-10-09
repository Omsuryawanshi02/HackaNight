import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Download, 
  Clock, 
  User, 
  Calendar 
} from 'lucide-react';
import { getAuditLogs } from '../services/api';

export default function ActivityLogs({ onShowToast }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await getAuditLogs();
    if (res.success) {
      setLogs(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.actor_name && l.actor_name.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      l.id.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const csvHeaders = 'Log ID,Timestamp,Actor,Actor ID,Action,Target Type,Target ID,Details\n';
    const csvRows = filteredLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.actor_name || ''}","${l.actor_user_id}","${l.action}","${l.target_type}","${l.target_id}","${(l.details || '').replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    onShowToast?.({ type: 'success', title: 'Logs Exported', message: 'Activity log records downloaded as CSV.' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
              Immutable Governance Trail
            </span>
            <span className="text-xs text-[#8b8c8e]">• ISO/IEC 27001 Compliance</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">System Activity & Audit Logs</h1>
          <p className="text-xs text-[#8b8c8e] mt-1">
            Tamper-evident chronological ledger tracking all authentication, user creation, milestone claims, and auditor verdicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor, or details..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#c8c8cb]">
            <thead className="bg-white/3 border-b border-white/6 text-[#8b8c8e] uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Log ID & Time</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Target</th>
                <th className="px-4 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading activity trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No activity logs recorded.</td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-white/4 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs font-bold text-white">{l.id}</div>
                      <div className="text-[11px] text-[#8b8c8e]">{l.timestamp}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{l.actor_name || 'System'}</div>
                      <div className="text-[10px] text-[#8b8c8e] font-mono">{l.actor_user_id}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-white/6 border border-white/8 text-[11px] font-mono font-medium text-[#FFE14F]">
                        {l.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                      {l.target_type}: {l.target_id}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 max-w-md">
                      {l.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
