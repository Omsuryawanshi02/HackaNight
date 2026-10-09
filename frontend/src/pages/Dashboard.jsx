import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  ShieldAlert, 
  Camera, 
  ChevronRight,
  HardHat
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ 
  stats, 
  milestonesData, 
  materialsData, 
  recentAudits, 
  anomalies, 
  onNavigate,
  onSelectAuditForReview
}) {
  const pendingAudits = recentAudits.filter(a => a.status === 'Pending Review');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Objective */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
              Site Audit Command Center
            </span>
            <span className="text-xs text-[#8b8c8e]">• Live Session Synchronized</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
            Construction Progress & Material Verification
          </h1>
          <p className="text-xs text-[#8b8c8e] mt-1 max-w-2xl leading-relaxed">
            Assisting engineering auditors to verify physical progress claims, reconcile bulk supplier inventory, and flag anomalies with evidence-backed insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('photo-audit')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-fastshot-primary rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Camera className="w-4 h-4 stroke-[2.2]" />
            <span>Upload Photo Audit</span>
          </button>
          <button
            onClick={() => onNavigate('material-audit')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Reconcile Materials</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Milestones"
          value={stats.totalMilestones}
          subtitle="Active contract packages"
          icon={HardHat}
          trend="+3 this month"
          trendType="neutral"
        />
        <StatCard
          title="Verified Milestones"
          value={stats.verifiedMilestones}
          subtitle="65% completion certified"
          icon={CheckCircle2}
          trend="Auditor verified"
          trendType="positive"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          subtitle="Awaiting human sign-off"
          icon={Clock}
          trend={`${pendingAudits.length} urgent queue`}
          trendType="warning"
          onClick={() => onNavigate('auditor-review')}
        />
        <StatCard
          title="Material Discrepancies"
          value={stats.materialDiscrepancies}
          subtitle="Inventory variance flags"
          icon={AlertTriangle}
          trend="Requires verification"
          trendType="negative"
          onClick={() => onNavigate('inventory-anomalies')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Progress Comparison */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Milestone Progress: Claimed vs. Verified</h2>
              <p className="text-xs text-[#8b8c8e]">Comparing contractor claims against verified site evidence (%)</p>
            </div>
            <span className="text-xs font-medium text-[#FFE14F] bg-[#FFE14F]/10 border border-[#FFE14F]/20 px-2.5 py-0.5 rounded-full">
              Physical Audit Delta
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={milestonesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#8b8c8e' }} 
                  interval={0} 
                  angle={-25} 
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: '#8b8c8e' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(18,22,32,0.95)', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val, name) => [`${val}%`, name === 'claimed' ? 'Claimed by Contractor' : 'Verified by Auditor']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => value === 'claimed' ? 'Claimed Completion %' : 'Verified Evidence %'}
                />
                <Bar dataKey="claimed" fill="#64748b" radius={[4, 4, 0, 0]} barSize={16} name="claimed" />
                <Bar dataKey="verified" fill="#FFE14F" radius={[4, 4, 0, 0]} barSize={16} name="verified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Consumption Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Material Reconciliation: Planned vs. Reconciled</h2>
              <p className="text-xs text-[#8b8c8e]">Planned BoQ allowance vs. physical store consumption audit</p>
            </div>
            <span className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Variance Monitoring
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={materialsData}
                margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="material" 
                  tick={{ fontSize: 10, fill: '#8b8c8e' }} 
                  interval={0} 
                  angle={-20} 
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: '#8b8c8e' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(18,22,32,0.95)', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar dataKey="planned" fill="#475569" radius={[4, 4, 0, 0]} barSize={14} name="Planned BoQ" />
                <Bar dataKey="recorded" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={14} name="Site Recorded" />
                <Bar dataKey="reconciled" fill="#FFE14F" radius={[4, 4, 0, 0]} barSize={14} name="Physical Reconciled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pending Approvals & Risk Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Section (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Pending Auditor Approvals</h2>
              <p className="text-xs text-[#8b8c8e]">Submitted claims awaiting certified engineering sign-off</p>
            </div>
            <button
              onClick={() => onNavigate('auditor-review')}
              className="text-xs font-semibold text-[#FFE14F] hover:text-[#FFE14F] flex items-center gap-1 transition"
            >
              <span>View Review Queue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-white/6">
            {pendingAudits.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#8b8c8e]">All audit claims reviewed! Queue is clear.</p>
            ) : (
              pendingAudits.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                      <img src={item.evidenceImage} alt={item.milestone} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.milestone}</span>
                        <StatusBadge status={item.riskLevel} size="sm" />
                      </div>
                      <p className="text-[11px] text-[#8b8c8e] mt-0.5">
                        {item.project} • Claimed: <strong className="text-white">{item.claimedPercentage}%</strong>
                      </p>
                      <p className="text-[11px] text-[#c8c8cb] mt-1 line-clamp-1 italic">
                        "{item.aiSummary}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectAuditForReview ? onSelectAuditForReview(item) : onNavigate('auditor-review')}
                    className="shrink-0 px-3 py-1.5 glass-chip rounded-xl text-xs font-semibold hover:text-[#FFE14F] transition cursor-pointer"
                  >
                    Review Claim
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Risk Indicators / Anomalies (1 col) */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FFE14F]" />
              <h2 className="text-sm font-bold text-white tracking-tight">Material Risk Flags</h2>
            </div>
            <button
              onClick={() => onNavigate('inventory-anomalies')}
              className="text-xs font-semibold text-[#FFE14F] hover:underline"
            >
              See All ({anomalies.length})
            </button>
          </div>

          <div className="space-y-3">
            {anomalies.slice(0, 3).map((anom) => (
              <div 
                key={anom.id} 
                onClick={() => onNavigate('inventory-anomalies')}
                className="p-3.5 rounded-xl border border-white/6 bg-white/3 hover:bg-white/6 hover:border-white/12 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{anom.material}</span>
                  <StatusBadge status={anom.severity} size="sm" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[#8b8c8e]">{anom.project}</span>
                  <span className="font-semibold text-rose-400">{anom.variance}</span>
                </div>
                <p className="text-[11px] text-[#c8c8cb] mt-1.5 line-clamp-2">
                  {anom.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Activity Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Site Audit Activities</h2>
            <p className="text-xs text-[#8b8c8e]">Live feed of verified claims, photographic assessments, and material reconcile runs</p>
          </div>
          <button
            onClick={() => onNavigate('auditor-review')}
            className="text-xs font-semibold text-[#FFE14F] hover:text-[#FFE14F] transition"
          >
            Open Full Ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#c8c8cb]">
            <thead className="bg-white/3 border-b border-white/6 text-[#8b8c8e] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Audit ID</th>
                <th className="px-4 py-3">Project & Milestone</th>
                <th className="px-4 py-3">Audit Type</th>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {recentAudits.slice(0, 5).map((audit) => (
                <tr key={audit.id} className="hover:bg-white/4 transition">
                  <td className="px-4 py-3 font-mono font-medium text-white">{audit.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{audit.milestone}</p>
                    <p className="text-[11px] text-[#8b8c8e]">{audit.project}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-white/6 text-slate-300 font-medium border border-white/10">
                      {audit.auditType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{audit.claimedPercentage}%</td>
                  <td className="px-4 py-3 text-[#8b8c8e]">{audit.submissionDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={audit.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectAuditForReview ? onSelectAuditForReview(audit) : onNavigate('auditor-review')}
                      className="px-2.5 py-1 text-xs font-medium text-[#FFE14F] hover:text-white hover:bg-white/6 rounded-lg transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
