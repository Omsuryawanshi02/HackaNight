import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Camera, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
  FileCheck2,
  MapPin,
  Calendar,
  Eye,
  Check,
  Package
} from 'lucide-react';

export default function Dashboard({ 
  stats, 
  milestonesData, 
  materialsData, 
  recentAudits, 
  anomalies, 
  projects = [],
  selectedProjectId,
  onSelectProject,
  onNavigate,
  onSelectAuditForReview
}) {
  const currentProject = (projects && projects.length > 0)
    ? (projects.find(p => p.id === selectedProjectId) || projects[0])
    : { name: 'Riverside Commercial Tower A', completionPercent: 76 };

  const currentProgressPct = currentProject.completionPercent || currentProject.actualProgress || 76;
  return (
    <div className="space-y-6">
      {/* KPI Cards Row (matching reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Verified Progress */}
        <div className="porcelain-card p-5 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#727C3E]/15 text-[#727C3E] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#727C3E] bg-[#727C3E]/15 px-2.5 py-1 rounded-full border border-[#727C3E]/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              ↑ 12% <span className="text-[#6F7889] font-normal">vs last month</span>
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Verified Progress</p>
            <p className="text-3xl font-black text-[#29231D] tracking-tight mt-1 font-['Outfit']">78%</p>
          </div>
          <div className="mt-3 w-full bg-[#EDE5D6] h-2 rounded-full overflow-hidden">
            <div className="bg-[#727C3E] h-full rounded-full w-[78%]"></div>
          </div>
        </div>

        {/* KPI 2: Evidence Pending */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#D6B238]/20 text-[#8f7215] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#8f7215] bg-[#D6B238]/20 px-2.5 py-1 rounded-full border border-[#D6B238]/40 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#8f7215]" />
              ↑ 5% <span className="text-[#6F7889] font-normal">vs last month</span>
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Evidence Pending</p>
            <p className="text-3xl font-black text-[#29231D] tracking-tight mt-1 font-['Outfit']">12</p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">Milestone claims awaiting review</p>
        </div>

        {/* KPI 3: Material Variance */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-rose-600" />
              ↑ 1.2% <span className="text-[#6F7889] font-normal">vs last month</span>
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Material Variance</p>
            <p className="text-3xl font-black text-rose-600 tracking-tight mt-1 font-['Outfit']">3.8%</p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">Discrepancy vs BoQ allowance</p>
        </div>

        {/* KPI 4: Open Audit Findings */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#D6B238]/20 text-[#29231D] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#8f7215]" />
            </div>
            <span className="text-[11px] font-bold text-[#727C3E] bg-[#727C3E]/15 px-2.5 py-1 rounded-full border border-[#727C3E]/30 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              ↓ 20% <span className="text-[#6F7889] font-normal">vs last month</span>
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Open Audit Findings</p>
            <p className="text-3xl font-black text-[#29231D] tracking-tight mt-1 font-['Outfit']">07</p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">Active quality & store flags</p>
        </div>
      </div>

      {/* Middle Grid: Project Progress & Evidence Verification (matching reference screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Progress (Dynamic & Functional) */}
        <div className="lg:col-span-5 porcelain-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4D8BE]">
              <div>
                <h2 className="text-base font-bold text-[#29231D] font-['Outfit']">Project Progress</h2>
                <p className="text-[10px] text-[#6F7889] font-medium truncate max-w-[200px]">{currentProject.name || 'Site Progress'}</p>
              </div>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-xs font-bold text-[#727C3E] bg-[#727C3E]/15 hover:bg-[#727C3E]/25 px-2.5 py-1 rounded-full border border-[#727C3E]/30 transition cursor-pointer"
                title="View full project details & milestones"
              >
                {currentProgressPct}% Overall Progress
              </button>
            </div>

            <div className="mt-4 w-full bg-[#EDE5D6] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#727C3E] h-full rounded-full transition-all duration-500" style={{ width: `${currentProgressPct}%` }}></div>
            </div>

            {/* Dynamic Milestone List */}
            <div className="mt-6 space-y-3.5">
              {[
                { name: 'Foundation', status: 'Verified', percent: 100, date: '12 Aug 2026' },
                { name: 'Structure', status: currentProgressPct >= 80 ? 'In Progress' : 'In Progress', percent: Math.min(100, Math.max(40, currentProgressPct)), date: '30 Oct 2026' },
                { name: 'Electrical', status: 'In Progress', percent: Math.round(currentProgressPct * 0.63), date: '20 Dec 2026' },
                { name: 'Finishing', status: currentProgressPct > 80 ? 'In Progress' : 'Pending', percent: Math.round(currentProgressPct * 0.24), date: '28 Feb 2027' }
              ].map((m, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigate('photo-audit')}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] hover:border-[#D6B238] transition cursor-pointer group shadow-xs"
                  title={`Click to capture evidence for ${m.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D6B238]/20 text-[#29231D] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Building2 className="w-4 h-4 text-[#29231D]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#29231D] group-hover:text-[#8f7215] transition">{m.name}</p>
                      {m.status === 'Verified' ? (
                        <span className="text-[10px] font-bold text-[#727C3E] bg-[#727C3E]/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-0.5">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      ) : m.status === 'In Progress' ? (
                        <span className="text-[10px] font-bold text-[#8f7215] bg-[#D6B238]/20 px-2 py-0.5 rounded-full w-fit mt-0.5 block">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#6F7889] bg-[#EDE5D6] px-2 py-0.5 rounded-full w-fit mt-0.5 block">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#EDE5D6] h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${m.percent === 100 ? 'bg-[#727C3E]' : 'bg-[#D6B238]'}`} 
                          style={{ width: `${m.percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-extrabold text-[#29231D]">{m.percent}%</span>
                    </div>
                    <p className="text-[10px] text-[#6F7889] mt-1 font-medium">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Verification */}
        <div className="lg:col-span-7 porcelain-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4D8BE]">
              <h2 className="text-base font-bold text-[#29231D] font-['Outfit']">Evidence Verification</h2>
              <button 
                onClick={() => onNavigate('photo-audit')}
                className="text-xs font-bold text-[#D6B238] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Evidence →
              </button>
            </div>

            {/* 3 Evidence Cards Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {/* Card 1 */}
              <div 
                onClick={() => onNavigate('photo-audit')}
                className="rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] overflow-hidden shadow-xs group hover:border-[#D6B238] transition cursor-pointer"
              >
                <div className="h-32 bg-slate-200 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80" 
                    alt="Foundation Zone A" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-[#29231D]">Foundation - Zone A</h3>
                  <div className="mt-1 space-y-0.5 text-[10px] text-[#6F7889]">
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D6B238]" /> 08 Oct, 2026 09:24 AM
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D6B238]" /> Lat 18.5205, Long 73.1692
                    </p>
                  </div>
                  <div className="mt-2.5">
                    <span className="badge-verified px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div 
                onClick={() => onNavigate('photo-audit')}
                className="rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] overflow-hidden shadow-xs group hover:border-[#D6B238] transition cursor-pointer"
              >
                <div className="h-32 bg-slate-200 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80" 
                    alt="Structure Level 3" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-[#29231D]">Structure - Level 3</h3>
                  <div className="mt-1 space-y-0.5 text-[10px] text-[#6F7889]">
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D6B238]" /> 08 Oct, 2026 04:11 PM
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D6B238]" /> Lat 18.5205, Long 73.1692
                    </p>
                  </div>
                  <div className="mt-2.5">
                    <span className="badge-verified px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div 
                onClick={() => onNavigate('photo-audit')}
                className="rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] overflow-hidden shadow-xs group hover:border-[#D6B238] transition cursor-pointer"
              >
                <div className="h-32 bg-slate-200 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80" 
                    alt="Electrical Block 8" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-[#29231D]">Electrical - Block 8</h3>
                  <div className="mt-1 space-y-0.5 text-[10px] text-[#6F7889]">
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D6B238]" /> 08 Oct, 2026 10:15 AM
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D6B238]" /> Lat 18.5205, Long 73.1692
                    </p>
                  </div>
                  <div className="mt-2.5">
                    <span className="badge-pending px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" /> Review Required
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Audit Activity (matching reference screenshot) */}
      <div className="porcelain-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4D8BE]">
          <div>
            <h2 className="text-base font-bold text-[#29231D] font-['Outfit']">Recent Audit Activity</h2>
            <p className="text-xs text-[#6F7889] mt-0.5">Live immutable record of milestone verifications and inventory checks</p>
          </div>
          <button 
            onClick={() => onNavigate('auditor-review')}
            className="text-xs font-bold text-[#D6B238] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Activity →
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EDE5D6] text-[#29231D] font-bold text-[11px] uppercase tracking-wider font-['Outfit']">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date & Time</th>
                <th className="px-4 py-3">Activity Type</th>
                <th className="px-4 py-3">Material / Task</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4D8BE]">
              <tr className="hover:bg-[#EDE5D6]/40 transition">
                <td className="px-4 py-3.5 text-[#6F7889] font-medium">Oct 09, 2026 09:24 AM</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#29231D]">
                    <Package className="w-4 h-4 text-[#D6B238]" /> Material Check
                  </span>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[#29231D]">Cement (50kg bags)</td>
                <td className="px-4 py-3.5 font-semibold text-[#29231D]">120 bags</td>
                <td className="px-4 py-3.5 font-bold text-[#727C3E]">-1.7%</td>
                <td className="px-4 py-3.5">
                  <span className="badge-verified px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-[#6F7889]">Site Supervisor</td>
              </tr>

              <tr className="hover:bg-[#EDE5D6]/40 transition">
                <td className="px-4 py-3.5 text-[#6F7889] font-medium">Oct 09, 2026 04:11 PM</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#29231D]">
                    <FileCheck2 className="w-4 h-4 text-[#D6B238]" /> Progress Verification
                  </span>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[#29231D]">Structure - Level 3</td>
                <td className="px-4 py-3.5 text-[#6F7889]">—</td>
                <td className="px-4 py-3.5 text-[#6F7889]">—</td>
                <td className="px-4 py-3.5">
                  <span className="badge-verified px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-[#6F7889]">Project Auditor</td>
              </tr>

              <tr className="hover:bg-[#EDE5D6]/40 transition">
                <td className="px-4 py-3.5 text-[#6F7889] font-medium">Oct 09, 2026 11:05 AM</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#29231D]">
                    <Camera className="w-4 h-4 text-[#D6B238]" /> Live Site Capture
                  </span>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[#29231D]">Electrical - Block 8</td>
                <td className="px-4 py-3.5 text-[#6F7889]">45 conduit runs</td>
                <td className="px-4 py-3.5 font-bold text-[#8f7215]">+3.2%</td>
                <td className="px-4 py-3.5">
                  <span className="badge-pending px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-[#6F7889]">Site Supervisor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

