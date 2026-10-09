import React from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  UserPlus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  HardHat,
  Layers,
  UserCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard({ 
  stats, 
  recentAudits, 
  anomalies, 
  onNavigate 
}) {
  const pendingCount = recentAudits.filter(a => a.status === 'Pending Review').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#9C86CE]/15 text-[#9C86CE] border border-[#9C86CE]/30 uppercase tracking-wider">
              Main Supervisor Authority
            </span>
            <span className="text-xs text-[#8b8c8e]">• Global Governance Command</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
            Administrator Enterprise Overview
          </h1>
          <p className="text-xs text-[#8b8c8e] mt-1 max-w-2xl leading-relaxed">
            Centralized control over user credentials, project assignments, contractor milestone claims, shopkeeper deliveries, and engineering auditor sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('user-management')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4 stroke-[2.2]" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => onNavigate('activity-logs')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>System Audit Logs</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects || 4}
          subtitle="4 enterprise sites active"
          icon={Building2}
          trend="All monitored"
          trendType="neutral"
          onClick={() => onNavigate('dashboard')}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers || 4}
          subtitle="Contractors, Stores, Auditors"
          icon={Users}
          trend="RBAC protected"
          trendType="positive"
          onClick={() => onNavigate('user-management')}
        />
        <StatCard
          title="Pending Milestone Reviews"
          value={stats.pendingReviews || pendingCount}
          subtitle="Awaiting auditor verdict"
          icon={Clock}
          trend="In queue"
          trendType="warning"
          onClick={() => onNavigate('auditor-review')}
        />
        <StatCard
          title="Material Discrepancies"
          value={stats.materialDiscrepancies || 4}
          subtitle="Inventory variance flags"
          icon={AlertTriangle}
          trend="Requires action"
          trendType="negative"
          onClick={() => onNavigate('inventory-anomalies')}
        />
      </div>

      {/* Role Breakdown Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('user-management')}
          className="glass-card p-5 cursor-pointer hover:border-[#FFE14F]/40 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#FFE14F] border border-[#FFE14F]/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Contractors</p>
              <p className="text-[11px] text-[#8b8c8e]">Progress submissions & photos</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8b8c8e]" />
        </div>

        <div 
          onClick={() => onNavigate('user-management')}
          className="glass-card p-5 cursor-pointer hover:border-cyan-400/40 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Shopkeepers</p>
              <p className="text-[11px] text-[#8b8c8e]">Deliveries & store inventory</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8b8c8e]" />
        </div>

        <div 
          onClick={() => onNavigate('user-management')}
          className="glass-card p-5 cursor-pointer hover:border-emerald-400/40 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Quality Auditors</p>
              <p className="text-[11px] text-[#8b8c8e]">Verification & certification</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8b8c8e]" />
        </div>
      </div>

      {/* Two Column Grid: Pending Review Ledger & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* All Audit Records Ledger */}
        <div className="lg:col-span-8 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">System-Wide Audit Submissions</h2>
              <p className="text-xs text-[#8b8c8e]">Live oversight across all project packages</p>
            </div>
            <button
              onClick={() => onNavigate('auditor-review')}
              className="text-xs font-semibold text-[#FFE14F] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#c8c8cb]">
              <thead className="bg-white/3 border-b border-white/6 text-[#8b8c8e] uppercase text-[11px]">
                <tr>
                  <th className="px-3.5 py-3">Audit ID</th>
                  <th className="px-3.5 py-3">Project & Milestone</th>
                  <th className="px-3.5 py-3">Submitted By</th>
                  <th className="px-3.5 py-3">Claim</th>
                  <th className="px-3.5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {recentAudits.slice(0, 4).map((audit) => (
                  <tr key={audit.id} className="hover:bg-white/4">
                    <td className="px-3.5 py-3 font-mono font-bold text-white">{audit.id}</td>
                    <td className="px-3.5 py-3">
                      <p className="font-bold text-white">{audit.milestone}</p>
                      <p className="text-[10px] text-[#8b8c8e]">{audit.project}</p>
                    </td>
                    <td className="px-3.5 py-3 text-slate-300">{audit.submittedBy}</td>
                    <td className="px-3.5 py-3 font-bold text-white">{audit.claimedPercentage}%</td>
                    <td className="px-3.5 py-3">
                      <StatusBadge status={audit.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="lg:col-span-4 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FFE14F]" />
              <h2 className="text-sm font-bold text-white tracking-tight">Active Discrepancies</h2>
            </div>
            <button
              onClick={() => onNavigate('inventory-anomalies')}
              className="text-xs font-semibold text-[#FFE14F] hover:underline"
            >
              Details
            </button>
          </div>

          <div className="space-y-3">
            {anomalies.slice(0, 3).map((anom) => (
              <div 
                key={anom.id} 
                onClick={() => onNavigate('inventory-anomalies')}
                className="p-3.5 rounded-xl border border-white/6 bg-white/3 hover:bg-white/6 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{anom.material}</span>
                  <StatusBadge status={anom.severity} size="sm" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[#8b8c8e]">{anom.project}</span>
                  <span className="font-semibold text-rose-400">{anom.variance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
