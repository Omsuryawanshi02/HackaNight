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
    <div className="space-y-6 font-sans text-[#29231D]">
      {/* Top Banner */}
      <div className="porcelain-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider font-['Outfit']">
              Main Supervisor Authority
            </span>
            <span className="text-xs text-[#6F7889] font-medium">• Global Governance Command</span>
          </div>
          <h1 className="text-2xl font-black text-[#29231D] mt-1.5 tracking-tight font-['Outfit']">
            Administrator Enterprise Overview
          </h1>
          <p className="text-xs text-[#6F7889] mt-1 max-w-2xl leading-relaxed font-medium">
            Centralized control over user credentials, project assignments, contractor milestone claims, shopkeeper deliveries, and engineering auditor sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('user-management')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-gold text-[#29231D] rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => onNavigate('activity-logs')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-secondary-sandstone text-xs font-bold cursor-pointer"
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
          className="porcelain-card p-5 cursor-pointer hover:border-[#D6B238] transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40">
              <HardHat className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#29231D] font-['Outfit']">Contractors</p>
              <p className="text-[11px] text-[#6F7889] font-medium">Progress submissions & photos</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6F7889]" />
        </div>

        <div
          onClick={() => onNavigate('user-management')}
          className="porcelain-card p-5 cursor-pointer hover:border-[#D6B238] transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#29231D] font-['Outfit']">Shopkeepers</p>
              <p className="text-[11px] text-[#6F7889] font-medium">Deliveries & store inventory</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6F7889]" />
        </div>

        <div
          onClick={() => onNavigate('user-management')}
          className="porcelain-card p-5 cursor-pointer hover:border-[#727C3E] transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#727C3E]/20 text-[#727C3E] border border-[#727C3E]/30">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#29231D] font-['Outfit']">Quality Auditors</p>
              <p className="text-[11px] text-[#6F7889] font-medium">Verification & certification</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6F7889]" />
        </div>
      </div>

      {/* Two Column Grid: Pending Review Ledger & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* All Audit Records Ledger */}
        <div className="lg:col-span-8 porcelain-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#29231D] tracking-tight font-['Outfit']">System-Wide Audit Submissions</h2>
              <p className="text-xs text-[#6F7889] font-medium">Live oversight across all project packages</p>
            </div>
            <button
              onClick={() => onNavigate('auditor-review')}
              className="text-xs font-bold text-[#8f7215] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#29231D]">
              <thead className="bg-[#EDE5D6] border-b border-[#E4D8BE] text-[#6F7889] uppercase text-[10px] font-['Outfit'] font-bold">
                <tr>
                  <th className="px-3.5 py-3">Audit ID</th>
                  <th className="px-3.5 py-3">Project & Milestone</th>
                  <th className="px-3.5 py-3">Submitted By</th>
                  <th className="px-3.5 py-3">Claim</th>
                  <th className="px-3.5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D8BE]">
                {recentAudits.slice(0, 4).map((audit) => (
                  <tr key={audit.id} className="hover:bg-[#EDE5D6]/40 transition">
                    <td className="px-3.5 py-3 font-mono font-bold text-[#29231D]">{audit.id}</td>
                    <td className="px-3.5 py-3">
                      <p className="font-bold text-[#29231D]">{audit.milestone}</p>
                      <p className="text-[10px] text-[#6F7889] font-medium">{audit.project}</p>
                    </td>
                    <td className="px-3.5 py-3 text-[#6F7889] font-medium">{audit.submittedBy}</td>
                    <td className="px-3.5 py-3 font-bold text-[#29231D]">{audit.claimedPercentage}%</td>
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
        <div className="lg:col-span-4 porcelain-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#8f7215]" />
              <h2 className="text-sm font-bold text-[#29231D] tracking-tight font-['Outfit']">Active Discrepancies</h2>
            </div>
            <button
              onClick={() => onNavigate('inventory-anomalies')}
              className="text-xs font-bold text-[#8f7215] hover:underline cursor-pointer"
            >
              Details
            </button>
          </div>

          <div className="space-y-3">
            {anomalies.slice(0, 3).map((anom) => (
              <div
                key={anom.id}
                onClick={() => onNavigate('inventory-anomalies')}
                className="p-3.5 rounded-xl border border-[#E4D8BE] bg-[#EDE5D6]/30 hover:bg-[#EDE5D6]/60 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#29231D] truncate font-['Outfit']">{anom.material}</span>
                  <StatusBadge status={anom.severity} size="sm" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[#6F7889] font-medium">{anom.project}</span>
                  <span className="font-bold text-rose-600">{anom.variance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
