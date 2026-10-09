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
    <div className="space-y-6 font-sans text-[#29231D]">
      {/* Top Banner */}
      <div className="porcelain-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider font-['Outfit']">
              Immutable Governance Trail
            </span>
            <span className="text-xs text-[#6F7889] font-medium">• ISO/IEC 27001 Compliance</span>
          </div>
          <h1 className="text-2xl font-black text-[#29231D] mt-1.5 tracking-tight font-['Outfit']">System Activity & Audit Logs</h1>
          <p className="text-xs text-[#6F7889] font-medium mt-1">
            Tamper-evident chronological ledger tracking all authentication, user creation, milestone claims, and auditor verdicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-3.5 py-2 btn-secondary-sandstone text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 btn-gold text-[#29231D] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="porcelain-card p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#6F7889] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor, or details..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] font-medium"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="porcelain-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#29231D]">
            <thead className="bg-[#EDE5D6] border-b border-[#E4D8BE] text-[#6F7889] uppercase text-[10px] font-['Outfit'] font-bold">
              <tr>
                <th className="px-4 py-3.5">Log ID & Time</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Target</th>
                <th className="px-4 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4D8BE]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6F7889]">Loading activity trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6F7889]">No activity logs recorded.</td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#EDE5D6]/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs font-bold text-[#29231D]">{l.id}</div>
                      <div className="text-[11px] text-[#6F7889] font-medium">{l.timestamp}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#29231D]">{l.actor_name || 'System'}</div>
                      <div className="text-[10px] text-[#6F7889] font-mono">{l.actor_user_id}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EDE5D6] border border-[#E4D8BE] text-[11px] font-mono font-bold text-[#8f7215]">
                        {l.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[#29231D] font-mono text-[11px] font-semibold">
                      {l.target_type}: {l.target_id}
                    </td>

                    <td className="px-4 py-3.5 text-[#29231D] font-medium max-w-md">
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
