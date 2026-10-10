import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Camera, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  Grid,
  List,
  ArrowLeft,
  FileText,
  Check,
  Package,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  X,
  Plus,
  BarChart2,
  Activity,
  User,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../services/api';

// Helper to transform raw project records into the supervisor workspace structure
const mapProjectRecord = (p, defaultSupervisor) => ({
  id: p.id || (p.code ? `PRJ-${p.code}` : `PRJ-${Math.random().toString(36).substring(2, 7)}`),
  code: p.code || p.id || 'PRJ-SITE',
  name: p.name || 'Site Project',
  location: p.location || 'Site Location Not Specified',
  client: p.client || 'General Contractor',
  supervisor: p.supervisor || defaultSupervisor || 'Site Supervisor',
  phase: p.phase || 'Construction Phase',
  status: p.status || 'In Progress',
  actualProgress: p.completionPercent ?? p.actualProgress ?? p.actual_progress ?? 0,
  plannedProgress: p.plannedProgress ?? p.planned_progress ?? 0,
  scheduleVariance: (p.completionPercent ?? p.actualProgress ?? p.actual_progress ?? 0) - (p.plannedProgress ?? p.planned_progress ?? 0),
  startDate: p.start_date || p.startDate || '',
  targetDate: p.target_date || p.targetDate || '',
  lastUpdated: p.updated_at || p.lastUpdated || new Date().toISOString().replace('T', ' ').substring(0, 16),
  budget: p.budget || '$0',
  nextMilestone: p.next_milestone || p.nextMilestone || 'Pending Next Milestone',
  nextMilestoneDue: p.next_milestone_due || p.nextMilestoneDue || '',
  completedMilestones: p.completed_milestones ?? p.completedMilestones ?? 0,
  totalMilestones: p.total_milestones ?? p.totalMilestones ?? (p.milestones ? p.milestones.length : 0),
  pendingEvidenceCount: p.pending_evidence_count ?? p.pendingEvidenceCount ?? 0,
  openAnomaliesCount: p.open_anomalies_count ?? p.openAnomaliesCount ?? 0,
  materialDiscrepancyCount: p.material_discrepancy_count ?? p.materialDiscrepancyCount ?? 0,
  description: p.description || '',
  contractors: p.contractors || [],
  milestones: p.milestones || [],
  progressTrend: p.progress_trend || p.progressTrend || [],
  evidenceRecords: p.evidence_records || p.evidenceRecords || [],
  materialsBOQ: p.materials_boq || p.materialsBOQ || [],
  activities: p.activities || []
});

export default function Projects({
  projects: parentProjects,
  selectedProjectId: parentSelectedProjectId,
  onSelectProject: parentOnSelectProject,
  onNavigate,
  onShowToast,
  backendConnected
}) {
  const { user, role } = useAuth();

  // State Management
  const [projectsList, setProjectsList] = useState(() => {
    if (parentProjects && parentProjects.length > 0) {
      return parentProjects.map(p => mapProjectRecord(p, user?.full_name));
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search, Filter & View Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [sortOption, setSortOption] = useState('recently_updated');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Detailed Project Modal / Sub-view State
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState('overview'); // 'overview' | 'milestones' | 'progress' | 'evidence' | 'materials' | 'timeline'

  // Load Projects from Backend API
  const fetchAuthorizedProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects();
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      if (res.success && rawList.length > 0) {
        setProjectsList(rawList.map(p => mapProjectRecord(p, user?.full_name)));
      } else if (parentProjects && parentProjects.length > 0) {
        setProjectsList(parentProjects.map(p => mapProjectRecord(p, user?.full_name)));
      } else {
        setProjectsList([]);
      }
    } catch (err) {
      console.warn('Backend projects endpoint unavailable:', err);
      if (parentProjects && parentProjects.length > 0) {
        setProjectsList(parentProjects.map(p => mapProjectRecord(p, user?.full_name)));
      } else {
        setProjectsList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizedProjects();
  }, [backendConnected]);

  useEffect(() => {
    if (parentProjects && parentProjects.length > 0 && projectsList.length === 0) {
      setProjectsList(parentProjects.map(p => mapProjectRecord(p, user?.full_name)));
    }
  }, [parentProjects]);

  // Compute Live KPI Summary Row Metrics
  const kpis = useMemo(() => {
    const total = projectsList.length;
    const inProgress = projectsList.filter(p => p.status === 'In Progress' || p.status === 'Active').length;
    
    // Milestones due in next 14 days
    const dueSoon = projectsList.reduce((acc, p) => {
      const pendingMilestones = (p.milestones || []).filter(m => m.status === 'In Progress' || m.status === 'Under Review');
      return acc + pendingMilestones.length;
    }, 0);

    // Projects requiring attention (schedule variance < -4% OR open anomalies / evidence pending)
    const requiringAttention = projectsList.filter(p => 
      (p.scheduleVariance && p.scheduleVariance < -4) || 
      (p.openAnomaliesCount && p.openAnomaliesCount > 0) ||
      (p.pendingEvidenceCount && p.pendingEvidenceCount > 2)
    ).length;

    return { total, inProgress, dueSoon, requiringAttention };
  }, [projectsList]);

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    return projectsList.filter(project => {
      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        project.name.toLowerCase().includes(query) ||
        project.code.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        (project.client && project.client.toLowerCase().includes(query)) ||
        (project.phase && project.phase.toLowerCase().includes(query))
      );

      // Status filter
      const matchesStatus = statusFilter === 'All' || 
        (statusFilter === 'In Progress' && (project.status === 'In Progress' || project.status === 'Active')) ||
        (statusFilter === 'Completed' && project.status === 'Completed') ||
        (statusFilter === 'Under Review' && project.status === 'Under Review') ||
        (statusFilter === 'Delayed' && (project.scheduleVariance && project.scheduleVariance < -5));

      // Phase filter
      const matchesPhase = phaseFilter === 'All' || 
        (project.phase && project.phase.toLowerCase().includes(phaseFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesPhase;
    }).sort((a, b) => {
      if (sortOption === 'progress_desc') return b.actualProgress - a.actualProgress;
      if (sortOption === 'progress_asc') return a.actualProgress - b.actualProgress;
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      if (sortOption === 'deadline') return new Date(a.nextMilestoneDue || a.targetDate) - new Date(b.nextMilestoneDue || b.targetDate);
      // default: recently_updated
      return new Date(b.lastUpdated || b.createdAt || Date.now()) - new Date(a.lastUpdated || a.createdAt || Date.now());
    });
  }, [projectsList, searchQuery, statusFilter, phaseFilter, sortOption]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPhaseFilter('All');
    setSortOption('recently_updated');
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status, variance) => {
    if (status === 'Completed' || status === 'Verified') {
      return (
        <span className="badge-verified px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 w-fit">
          <Check className="w-3 h-3 stroke-[2.5]" /> Verified / Completed
        </span>
      );
    }
    if (variance && variance < -5) {
      return (
        <span className="bg-rose-500/15 text-rose-600 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 w-fit">
          <AlertCircle className="w-3 h-3 stroke-[2.5]" /> Delayed ({variance}% variance)
        </span>
      );
    }
    if (status === 'Under Review') {
      return (
        <span className="bg-[#D6B238]/20 text-[#8f7215] border border-[#D6B238]/40 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3 stroke-[2.5]" /> Under Review
        </span>
      );
    }
    return (
      <span className="bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 w-fit">
        <Building2 className="w-3 h-3 text-[#29231D]" /> In Progress
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DETAILED PROJECT VIEW (DRILL-DOWN SUB-VIEW)
  // ─────────────────────────────────────────────────────────────────────────
  if (selectedProjectForDetails) {
    const prj = selectedProjectForDetails;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header Bar with Back Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4D8BE]">
          <div>
            <button 
              onClick={() => setSelectedProjectForDetails(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#D6B238] hover:text-[#29231D] transition cursor-pointer mb-2 font-['Outfit']"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Projects
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#29231D] font-['Outfit'] tracking-tight">{prj.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDE5D6] text-[#29231D] font-bold border border-[#E4D8BE]">
                {prj.code}
              </span>
            </div>
            <p className="text-xs text-[#6F7889] font-medium flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#D6B238]" /> {prj.location}
              <span className="text-[#E4D8BE]">|</span>
              <Building2 className="w-3.5 h-3.5 text-[#D6B238]" /> {prj.phase}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (parentOnSelectProject) parentOnSelectProject(prj.id);
                onNavigate('photo-audit');
              }}
              className="px-4 py-2 rounded-xl bg-[#D6B238] text-[#29231D] font-bold text-xs shadow-md hover:bg-[#c4a12e] transition flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Capture Evidence
            </button>
            <button
              onClick={() => onNavigate('auditor-review')}
              className="px-4 py-2 rounded-xl bg-[#EDE5D6] text-[#29231D] font-bold text-xs border border-[#E4D8BE] hover:bg-[#E4D8BE] transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D6B238]" /> View Submissions
            </button>
          </div>
        </div>

        {/* Project Overview KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="porcelain-card p-4">
            <p className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Actual Progress</p>
            <p className="text-2xl font-black text-[#727C3E] font-['Outfit'] mt-1">{prj.actualProgress}%</p>
            <div className="mt-2 w-full bg-[#EDE5D6] h-2 rounded-full overflow-hidden">
              <div className="bg-[#727C3E] h-full" style={{ width: `${prj.actualProgress}%` }}></div>
            </div>
          </div>

          <div className="porcelain-card p-4">
            <p className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Planned Progress</p>
            <p className="text-2xl font-black text-[#29231D] font-['Outfit'] mt-1">{prj.plannedProgress}%</p>
            <div className="mt-2 w-full bg-[#EDE5D6] h-2 rounded-full overflow-hidden">
              <div className="bg-[#D6B238] h-full" style={{ width: `${prj.plannedProgress}%` }}></div>
            </div>
          </div>

          <div className="porcelain-card p-4">
            <p className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Schedule Variance</p>
            <p className={`text-2xl font-black font-['Outfit'] mt-1 ${prj.scheduleVariance < 0 ? 'text-rose-600' : 'text-[#727C3E]'}`}>
              {prj.scheduleVariance > 0 ? `+${prj.scheduleVariance}%` : `${prj.scheduleVariance}%`}
            </p>
            <p className="text-[10px] text-[#6F7889] mt-1.5 font-medium">
              {prj.scheduleVariance < 0 ? 'Behind planned schedule' : 'Ahead of target schedule'}
            </p>
          </div>

          <div className="porcelain-card p-4">
            <p className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Milestones Status</p>
            <p className="text-2xl font-black text-[#29231D] font-['Outfit'] mt-1">
              {prj.completedMilestones || 0} <span className="text-sm font-bold text-[#6F7889]">/ {prj.totalMilestones || 0}</span>
            </p>
            <p className="text-[10px] text-[#727C3E] mt-1.5 font-extrabold flex items-center gap-1">
              <Check className="w-3 h-3" /> {prj.totalMilestones ? Math.round(((prj.completedMilestones || 0) / prj.totalMilestones) * 100) : 0}% Completed
            </p>
          </div>
        </div>

        {/* Navigation Tabs within Project Details */}
        <div className="flex border-b border-[#E4D8BE] gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Metadata', icon: Building2 },
            { id: 'milestones', label: `Milestones (${prj.milestones?.length || 0})`, icon: Layers },
            { id: 'progress', label: 'Progress Curves', icon: BarChart2 },
            { id: 'evidence', label: `Site Evidence (${prj.evidenceRecords?.length || 0})`, icon: Camera },
            { id: 'materials', label: 'Material Reconciliation', icon: Package },
            { id: 'timeline', label: 'Audit Timeline', icon: Activity }
          ].map(t => {
            const Icon = t.icon;
            const active = activeDetailsTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveDetailsTab(t.id)}
                className={`
                  px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer shrink-0 font-['Outfit']
                  ${active 
                    ? 'border-[#D6B238] text-[#29231D] bg-[#D6B238]/10 rounded-t-xl' 
                    : 'border-transparent text-[#6F7889] hover:text-[#29231D] hover:bg-[#EDE5D6]/30'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#D6B238]' : 'text-[#6F7889]'}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Metadata */}
        {activeDetailsTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 porcelain-card p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-[#29231D] uppercase tracking-wider font-['Outfit']">Project Overview</h3>
              <p className="text-xs text-[#29231D] leading-relaxed font-medium">{prj.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E4D8BE]">
                <div>
                  <p className="text-[11px] font-bold text-[#6F7889] uppercase">Client / General Contractor</p>
                  <p className="text-xs font-extrabold text-[#29231D] mt-1">{prj.client}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#6F7889] uppercase">Assigned Supervisor</p>
                  <p className="text-xs font-extrabold text-[#29231D] mt-1">{prj.supervisor}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#6F7889] uppercase">Start Date</p>
                  <p className="text-xs font-extrabold text-[#29231D] mt-1">{prj.startDate}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#6F7889] uppercase">Target Completion Date</p>
                  <p className="text-xs font-extrabold text-[#29231D] mt-1">{prj.targetDate}</p>
                </div>
              </div>
            </div>

            <div className="porcelain-card p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-[#29231D] uppercase tracking-wider font-['Outfit']">Authorized Subcontractors</h3>
              <div className="space-y-2.5">
                {(prj.contractors || []).map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#29231D]">{c}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#727C3E]/20 text-[#727C3E] font-bold">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Milestone Tracking Table */}
        {activeDetailsTab === 'milestones' && (
          <div className="porcelain-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Project Milestones & Progress Claims</h3>
                <p className="text-xs text-[#6F7889] mt-0.5">Track planned vs verified completion status for all work packages</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40">
                Supervisor Role: View & Claim Only (No Self-Approval)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#EDE5D6] text-[#29231D] font-bold text-[11px] uppercase tracking-wider font-['Outfit']">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Milestone Name</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Planned Dates</th>
                    <th className="px-4 py-3">Progress (Claimed / Verified)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4D8BE]">
                  {(prj.milestones && prj.milestones.length > 0) ? (
                    prj.milestones.map((m) => (
                      <tr key={m.id} className="hover:bg-[#EDE5D6]/40 transition">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-[#29231D]">{m.name}</p>
                          <p className="text-[10px] text-[#6F7889]">{m.contractor}</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#29231D]">{m.stage}</td>
                        <td className="px-4 py-3.5 text-[#6F7889] font-medium">
                          {m.plannedStart} → {m.plannedEnd}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-[#EDE5D6] h-2 rounded-full overflow-hidden">
                              <div className="bg-[#727C3E] h-full" style={{ width: `${m.verifiedProgress}%` }}></div>
                            </div>
                            <span className="font-extrabold text-[#29231D]">{m.reportedProgress}% / {m.verifiedProgress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {getStatusBadge(m.status)}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => {
                              if (parentOnSelectProject) parentOnSelectProject(prj.id);
                              onNavigate('photo-audit');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#D6B238]/20 text-[#29231D] hover:bg-[#D6B238] font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" /> Submit Evidence
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-[#6F7889] font-medium">
                        No milestones recorded for this project yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Construction Progress Tracking Charts */}
        {activeDetailsTab === 'progress' && (
          <div className="porcelain-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Planned vs Reported vs Verified Progress Curve</h3>
            <p className="text-xs text-[#6F7889]">Historical verification trend calculated over monthly audit cycles</p>
            
            {(prj.progressTrend && prj.progressTrend.length > 0) ? (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prj.progressTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4D8BE" />
                    <XAxis dataKey="month" stroke="#6F7889" fontSize={12} />
                    <YAxis stroke="#6F7889" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E4D8BE', borderRadius: '12px', fontSize: '12px', color: '#29231D' }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="planned" name="Planned Progress (%)" stroke="#D6B238" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="reported" name="Reported Claim (%)" stroke="#6F7889" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="verified" name="Verified AI Audit (%)" stroke="#727C3E" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-[#6F7889] text-xs font-medium">
                No progress curve data available for this project.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Site Evidence Gallery */}
        {activeDetailsTab === 'evidence' && (
          <div className="porcelain-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Captured Site Evidence & AI Vision Audits</h3>
              <button
                onClick={() => {
                  if (parentOnSelectProject) parentOnSelectProject(prj.id);
                  onNavigate('photo-audit');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#D6B238] text-[#29231D] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" /> Capture New Evidence
              </button>
            </div>

            {(prj.evidenceRecords && prj.evidenceRecords.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {prj.evidenceRecords.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] overflow-hidden shadow-xs">
                    <div className="h-36 bg-slate-200 relative">
                      <img src={ev.imageUrl} alt={ev.milestone} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        AI Score: {ev.aiScore}%
                      </span>
                    </div>
                    <div className="p-3.5">
                      <p className="text-xs font-bold text-[#29231D]">{ev.milestone}</p>
                      <p className="text-[10px] text-[#6F7889] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D6B238]" /> {ev.timestamp}
                      </p>
                      <p className="text-[11px] text-[#29231D] mt-2 font-medium">{ev.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#6F7889] text-xs font-medium">
                No site evidence captures logged for this project yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Material Status */}
        {activeDetailsTab === 'materials' && (
          <div className="porcelain-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Project Material BOQ & Consumption Statement</h3>
              <button
                onClick={() => onNavigate('material-audit')}
                className="px-3.5 py-1.5 rounded-xl bg-[#EDE5D6] text-[#29231D] font-bold text-xs border border-[#E4D8BE] flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-[#D6B238]" /> Material Reconciliation Page
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#EDE5D6] text-[#29231D] font-bold text-[11px] uppercase tracking-wider font-['Outfit']">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Material Name</th>
                    <th className="px-4 py-3">Total BOQ</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Physical Stock</th>
                    <th className="px-4 py-3">Variance</th>
                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4D8BE]">
                  {(prj.materialsBOQ && prj.materialsBOQ.length > 0) ? (
                    prj.materialsBOQ.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#EDE5D6]/40 transition">
                        <td className="px-4 py-3.5 font-bold text-[#29231D]">{m.material}</td>
                        <td className="px-4 py-3.5 font-semibold text-[#29231D]">{m.totalBOQ}</td>
                        <td className="px-4 py-3.5 text-[#6F7889] font-medium">{m.received}</td>
                        <td className="px-4 py-3.5 text-[#29231D] font-semibold">{m.physicalStock}</td>
                        <td className={`px-4 py-3.5 font-extrabold ${m.variance?.includes('+4') ? 'text-rose-600' : 'text-[#727C3E]'}`}>
                          {m.variance}
                        </td>
                        <td className="px-4 py-3.5">
                          {m.variance?.includes('+4') ? (
                            <span className="bg-rose-500/15 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-500/30">High Discrepancy</span>
                          ) : (
                            <span className="badge-verified px-2 py-0.5 rounded-full text-[10px]">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-[#6F7889] font-medium">
                        No material BOQ records found for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Activity Timeline */}
        {activeDetailsTab === 'timeline' && (
          <div className="porcelain-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Immutable Project Audit Trail</h3>
            {(prj.activities && prj.activities.length > 0) ? (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E4D8BE]">
                {prj.activities.map((a) => (
                  <div key={a.id} className="relative pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#D6B238] border-2 border-[#FFFDF8]"></div>
                    <div className="p-3 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#29231D]">{a.title}</p>
                        <span className="text-[10px] text-[#6F7889] font-medium">{a.time}</span>
                      </div>
                      <p className="text-[11px] text-[#6F7889] font-bold mt-0.5">{a.actor}</p>
                      <p className="text-xs text-[#29231D] mt-1 font-medium">{a.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#6F7889] text-xs font-medium">
                No audit trail activities logged yet.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN MY PROJECTS WORKSPACE LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Workspace Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#29231D] tracking-tight font-['Outfit']">My Projects</h1>
          <p className="text-xs sm:text-sm text-[#6F7889] font-medium mt-1">
            Track construction progress, milestones, and site activities across your assigned projects.
          </p>
        </div>

        {/* Refresh & Sync Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAuthorizedProjects}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#EDE5D6] hover:bg-[#E4D8BE] text-[#29231D] font-bold text-xs border border-[#E4D8BE] transition flex items-center gap-2 cursor-pointer shadow-xs"
            title="Reload backend project records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D6B238] ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync Projects'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Row (Calculated dynamically from project records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Assigned Projects */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#D6B238]/20 text-[#29231D] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#29231D]" />
            </div>
            <span className="text-[11px] font-bold text-[#29231D] bg-[#D6B238]/20 px-2.5 py-1 rounded-full border border-[#D6B238]/40">
              Assigned Supervisor
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Total Assigned Projects</p>
            <p className="text-3xl font-black text-[#29231D] tracking-tight mt-1 font-['Outfit']">
              {loading ? '...' : kpis.total}
            </p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">Active site assignments</p>
        </div>

        {/* KPI 2: Projects In Progress */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#727C3E]/15 text-[#727C3E] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#727C3E] bg-[#727C3E]/15 px-2.5 py-1 rounded-full border border-[#727C3E]/30">
              Active Work
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Projects In Progress</p>
            <p className="text-3xl font-black text-[#29231D] tracking-tight mt-1 font-['Outfit']">
              {loading ? '...' : kpis.inProgress}
            </p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">On-site structural execution</p>
        </div>

        {/* KPI 3: Milestones Due Soon */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#D6B238]/20 text-[#8f7215] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#8f7215] bg-[#D6B238]/20 px-2.5 py-1 rounded-full border border-[#D6B238]/40">
              Next 14 Days
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Milestones Due Soon</p>
            <p className="text-3xl font-black text-[#29231D] tracking-tight mt-1 font-['Outfit']">
              {loading ? '...' : kpis.dueSoon}
            </p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">Awaiting progress verification</p>
        </div>

        {/* KPI 4: Projects Requiring Attention */}
        <div className="porcelain-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
              Action Required
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">Requiring Attention</p>
            <p className="text-3xl font-black text-rose-600 tracking-tight mt-1 font-['Outfit']">
              {loading ? '...' : kpis.requiringAttention}
            </p>
          </div>
          <p className="text-xs text-[#6F7889] mt-2">Schedule & material flags</p>
        </div>
      </div>

      {/* Project Search, Filters & Sorting Toolbar */}
      <div className="porcelain-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#6F7889] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, code, location, or contractor..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] text-xs font-bold text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7889] hover:text-[#29231D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] text-xs font-bold text-[#29231D] focus:outline-none focus:border-[#D6B238] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed / Behind Schedule</option>
            </select>

            {/* Phase Filter */}
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] text-xs font-bold text-[#29231D] focus:outline-none focus:border-[#D6B238] cursor-pointer"
            >
              <option value="All">All Phases</option>
              <option value="Foundation">Foundation & Substructure</option>
              <option value="Superstructure">Superstructure</option>
              <option value="MEP & Services">MEP & Services</option>
              <option value="Finishing & Handover">Finishing & Handover</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] text-xs font-bold text-[#29231D] focus:outline-none focus:border-[#D6B238] cursor-pointer"
            >
              <option value="recently_updated">Sort: Recently Updated</option>
              <option value="progress_desc">Sort: Highest Progress</option>
              <option value="progress_asc">Sort: Lowest Progress</option>
              <option value="deadline">Sort: Next Milestone Due</option>
              <option value="name">Sort: Project Name (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#EDE5D6] p-1 rounded-xl border border-[#E4D8BE]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-[#D6B238] text-[#29231D]' : 'text-[#6F7889] hover:text-[#29231D]'}`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-[#D6B238] text-[#29231D]' : 'text-[#6F7889] hover:text-[#29231D]'}`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== 'All' || phaseFilter !== 'All' || sortOption !== 'recently_updated') && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-2 text-xs font-bold text-[#rose-600] hover:text-rose-700 underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="porcelain-card p-5 space-y-4 animate-pulse">
              <div className="h-5 bg-[#EDE5D6] rounded w-3/4"></div>
              <div className="h-4 bg-[#EDE5D6] rounded w-1/2"></div>
              <div className="h-20 bg-[#EDE5D6] rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State: Search / Filter No Results */}
      {!loading && filteredProjects.length === 0 && (
        <div className="porcelain-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D6B238]/20 text-[#29231D] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">No Projects Found</h3>
          <p className="text-xs text-[#6F7889] max-w-md mx-auto">
            No construction projects match your search term or active filters. Try adjusting your filter criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl bg-[#D6B238] text-[#29231D] font-bold text-xs shadow-xs hover:bg-[#c4a12e] transition cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Grid View of Assigned Construction Projects */}
      {!loading && filteredProjects.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((prj) => (
            <div 
              key={prj.id} 
              className="porcelain-card p-6 flex flex-col justify-between hover:border-[#D6B238] transition-all group shadow-xs hover:shadow-md"
            >
              <div>
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#EDE5D6] text-[#29231D] border border-[#E4D8BE] font-['Outfit']">
                      {prj.code}
                    </span>
                    <h2 className="text-base font-bold text-[#29231D] font-['Outfit'] mt-1.5 group-hover:text-[#D6B238] transition">
                      {prj.name}
                    </h2>
                  </div>
                  {getStatusBadge(prj.status, prj.scheduleVariance)}
                </div>

                <p className="text-xs text-[#6F7889] font-medium flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D6B238] shrink-0" />
                  <span className="truncate">{prj.location}</span>
                </p>

                {/* Progress Bar & Variance Metric */}
                <div className="mt-4 pt-4 border-t border-[#E4D8BE] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6F7889]">Actual Progress</span>
                    <span className="text-[#29231D] font-black">{prj.actualProgress}%</span>
                  </div>
                  <div className="w-full bg-[#EDE5D6] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#727C3E] h-full rounded-full transition-all" style={{ width: `${prj.actualProgress}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-[#6F7889] pt-1">
                    <span>Planned: <strong className="text-[#29231D]">{prj.plannedProgress}%</strong></span>
                    <span className={prj.scheduleVariance < 0 ? 'text-rose-600 font-extrabold' : 'text-[#727C3E] font-extrabold'}>
                      {prj.scheduleVariance < 0 ? `${Math.abs(prj.scheduleVariance)}% Behind Plan` : `${prj.scheduleVariance}% Ahead`}
                    </span>
                  </div>
                </div>

                {/* Milestone Due Info */}
                <div className="mt-4 p-3 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] space-y-1">
                  <p className="text-[10px] font-bold text-[#6F7889] uppercase font-['Outfit']">Next Milestone</p>
                  <p className="text-xs font-extrabold text-[#29231D] line-clamp-1">{prj.nextMilestone}</p>
                  <p className="text-[10px] text-[#6F7889] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#D6B238]" /> Due: {prj.nextMilestoneDue}
                  </p>
                </div>

                {/* Indicators Pills */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-[#EDE5D6] text-[#29231D] flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#727C3E]" /> {prj.completedMilestones}/{prj.totalMilestones} Milestones
                  </span>
                  {prj.pendingEvidenceCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#D6B238]/20 text-[#8f7215] flex items-center gap-1 border border-[#D6B238]/30">
                      <Clock className="w-3 h-3" /> {prj.pendingEvidenceCount} Evidence Pending
                    </span>
                  )}
                  {prj.openAnomaliesCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 flex items-center gap-1 border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> {prj.openAnomaliesCount} Anomaly Flag
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="mt-6 pt-4 border-t border-[#E4D8BE] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProjectForDetails(prj)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#D6B238] text-[#29231D] font-bold text-xs shadow-xs hover:bg-[#c4a12e] transition text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (parentOnSelectProject) parentOnSelectProject(prj.id);
                    onNavigate('photo-audit');
                  }}
                  className="p-2 rounded-xl bg-[#EDE5D6] text-[#29231D] hover:bg-[#E4D8BE] transition cursor-pointer"
                  title="Capture Evidence for this project"
                >
                  <Camera className="w-4 h-4 text-[#29231D]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View of Assigned Construction Projects */}
      {!loading && filteredProjects.length > 0 && viewMode === 'list' && (
        <div className="porcelain-card p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EDE5D6] text-[#29231D] font-bold text-[11px] uppercase tracking-wider font-['Outfit']">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Project Name</th>
                <th className="px-4 py-3">Location & Phase</th>
                <th className="px-4 py-3">Actual Progress</th>
                <th className="px-4 py-3">Next Milestone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4D8BE]">
              {filteredProjects.map((prj) => (
                <tr key={prj.id} className="hover:bg-[#EDE5D6]/40 transition">
                  <td className="px-4 py-3.5 font-bold text-[#29231D]">
                    <p className="text-xs font-bold text-[#29231D]">{prj.name}</p>
                    <span className="text-[10px] text-[#6F7889] font-normal">{prj.code}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#6F7889]">
                    <p className="text-xs font-semibold text-[#29231D]">{prj.phase}</p>
                    <p className="text-[10px] text-[#6F7889]">{prj.location}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#EDE5D6] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#727C3E] h-full" style={{ width: `${prj.actualProgress}%` }}></div>
                      </div>
                      <span className="font-extrabold text-[#29231D]">{prj.actualProgress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#29231D]">
                    <p className="font-semibold">{prj.nextMilestone}</p>
                    <p className="text-[10px] text-[#6F7889]">Due: {prj.nextMilestoneDue}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {getStatusBadge(prj.status, prj.scheduleVariance)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProjectForDetails(prj)}
                        className="px-3 py-1.5 rounded-lg bg-[#D6B238] text-[#29231D] font-bold text-xs hover:bg-[#c4a12e] transition cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          if (parentOnSelectProject) parentOnSelectProject(prj.id);
                          onNavigate('photo-audit');
                        }}
                        className="p-1.5 rounded-lg bg-[#EDE5D6] text-[#29231D] hover:bg-[#E4D8BE] transition cursor-pointer"
                        title="Capture Evidence"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
