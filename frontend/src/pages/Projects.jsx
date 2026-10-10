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

// Comprehensive Real-World Construction Projects Mock Seed for Site Supervisor
const MOCK_SUPERVISOR_PROJECTS = [
  {
    id: 'PRJ-101',
    code: 'PRJ-2026-NASHIK-01',
    name: 'Riverside Commercial Tower A',
    location: 'North Tech Corridor, Zone 4, Nashik, Maharashtra',
    client: 'Apex Infracon Pvt Ltd',
    supervisor: 'Rajesh Varma',
    phase: 'Superstructure Construction',
    status: 'In Progress',
    actualProgress: 68,
    plannedProgress: 74,
    scheduleVariance: -6, // 6% behind plan
    startDate: '2026-01-15',
    targetDate: '2027-04-30',
    lastUpdated: '2026-10-09 14:30',
    budget: '$18.4M',
    nextMilestone: 'Level 3 Slab Completion & Concrete Pour',
    nextMilestoneDue: '2026-10-18',
    completedMilestones: 8,
    totalMilestones: 12,
    pendingEvidenceCount: 3,
    openAnomaliesCount: 2,
    materialDiscrepancyCount: 1,
    description: '18-storey Grade-A commercial office tower with dual-basement parking, post-tensioned slabs, and smart building energy integration.',
    contractors: ['Apex Infracon (General Contractor)', 'Mahalaxmi Steel Fabrication', 'Ultratech Concrete Services'],
    milestones: [
      { id: 'M1', name: 'Site Excavation & Shoring Piles', stage: 'Foundation', plannedStart: '2026-01-15', plannedEnd: '2026-03-10', actualEnd: '2026-03-08', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Apex Infracon', evidenceStatus: 'Complete', notes: 'Soil compaction verified by geotechnical engineer.' },
      { id: 'M2', name: 'Raft Foundation Concrete Pour (M40 Grade)', stage: 'Foundation', plannedStart: '2026-03-12', plannedEnd: '2026-04-25', actualEnd: '2026-04-22', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Ultratech Concrete', evidenceStatus: 'Complete', notes: '28-day cube compressive strength tested 42.5 MPa.' },
      { id: 'M3', name: 'Basement Level B2 & B1 Retaining Walls', stage: 'Foundation', plannedStart: '2026-04-28', plannedEnd: '2026-06-15', actualEnd: '2026-06-18', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Apex Infracon', evidenceStatus: 'Complete', notes: 'Waterproofing membrane inspection sign-off archived.' },
      { id: 'M4', name: 'Ground Floor Columns & Transfer Beams', stage: 'Superstructure', plannedStart: '2026-06-20', plannedEnd: '2026-08-10', actualEnd: '2026-08-14', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Mahalaxmi Steel', evidenceStatus: 'Complete', notes: 'Rebar tie spacing verified by AI vision audit.' },
      { id: 'M5', name: 'Level 1 & Level 2 Post-Tensioned Slab Pour', stage: 'Superstructure', plannedStart: '2026-08-15', plannedEnd: '2026-09-28', actualEnd: '2026-09-30', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Apex Infracon', evidenceStatus: 'Complete', notes: 'Stressing records matched engineering tension calculations.' },
      { id: 'M6', name: 'Level 3 Slab Completion & Formwork', stage: 'Superstructure', plannedStart: '2026-10-01', plannedEnd: '2026-10-18', actualEnd: null, plannedProgress: 100, reportedProgress: 85, verifiedProgress: 75, status: 'In Progress', contractor: 'Apex Infracon', evidenceStatus: 'Review Required', notes: 'Formwork shuttering 85% erected; concrete pour scheduled Oct 18.' },
      { id: 'M7', name: 'Level 4 to 8 Structural Frame', stage: 'Superstructure', plannedStart: '2026-10-20', plannedEnd: '2026-12-15', actualEnd: null, plannedProgress: 20, reportedProgress: 10, verifiedProgress: 0, status: 'Under Review', contractor: 'Apex Infracon', evidenceStatus: 'Pending', notes: 'Column steel binding in progress for Level 4.' },
      { id: 'M8', name: 'HVAC Ducting & Plumbing Riser Shafts', stage: 'MEP & Services', plannedStart: '2026-11-01', plannedEnd: '2027-01-20', actualEnd: null, plannedProgress: 0, reportedProgress: 0, verifiedProgress: 0, status: 'Not Started', contractor: 'Voltas Engineering', evidenceStatus: 'Not Started', notes: 'MEP shop drawings submitted for clearance.' },
      { id: 'M9', name: 'Façade Glass Curtain Wall Framing', stage: 'Finishing & Handover', plannedStart: '2027-01-10', plannedEnd: '2027-03-15', actualEnd: null, plannedProgress: 0, reportedProgress: 0, verifiedProgress: 0, status: 'Not Started', contractor: 'GlassTech Facades', evidenceStatus: 'Not Started', notes: 'Mock-up unit approved by lead architect.' }
    ],
    progressTrend: [
      { month: 'May 2026', planned: 25, reported: 25, verified: 25 },
      { month: 'Jun 2026', planned: 38, reported: 37, verified: 37 },
      { month: 'Jul 2026', planned: 50, reported: 48, verified: 48 },
      { month: 'Aug 2026', planned: 62, reported: 60, verified: 59 },
      { month: 'Sep 2026', planned: 70, reported: 66, verified: 65 },
      { month: 'Oct 2026', planned: 74, reported: 68, verified: 66 }
    ],
    evidenceRecords: [
      { id: 'EVD-901', milestone: 'Level 3 Slab Completion', timestamp: '2026-10-09 09:24 AM', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800', status: 'Review Required', aiScore: 94.8, notes: 'Grid A1-B4 rebar arrangement scanned; tie wire binding verified.' },
      { id: 'EVD-902', milestone: 'Level 2 PT Slab Pour', timestamp: '2026-09-28 04:15 PM', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', status: 'Approved', aiScore: 98.2, notes: 'Curing ponding test passed; no thermal cracking detected.' },
      { id: 'EVD-903', milestone: 'Ground Floor Columns', timestamp: '2026-08-14 11:30 AM', imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', status: 'Approved', aiScore: 96.0, notes: 'Plumb alignment vertical deviation under 3mm.' }
    ],
    materialsBOQ: [
      { material: 'OPC 53 Grade Cement', totalBOQ: '12,500 Bags', received: '8,400 Bags', issued: '8,200 Bags', physicalStock: '200 Bags', recordedUsed: '8,200 Bags', variance: '0.0%', status: 'Normal Variance' },
      { material: 'TMT 16mm Steel Rebars', totalBOQ: '450 Tons', received: '310 Tons', issued: '298 Tons', physicalStock: '12 Tons', recordedUsed: '298 Tons', variance: '+4.2%', status: 'High Discrepancy' },
      { material: 'M35 Ready Mix Concrete', totalBOQ: '3,800 m³', received: '2,650 m³', issued: '2,650 m³', physicalStock: '0 m³', recordedUsed: '2,650 m³', variance: '-0.8%', status: 'Normal Variance' },
      { material: 'Crushed Coarse Aggregate (20mm)', totalBOQ: '6,200 Tons', received: '4,100 Tons', issued: '4,050 Tons', physicalStock: '50 Tons', recordedUsed: '4,050 Tons', variance: '+1.1%', status: 'Normal Variance' }
    ],
    activities: [
      { id: 'ACT-1', time: 'Oct 09, 2026 14:30', title: 'Level 3 Slab Evidence Captured', actor: 'Rajesh Varma (Site Supervisor)', details: 'Uploaded 4 high-res site captures for Level 3 shuttering plumb & alignment check.' },
      { id: 'ACT-2', time: 'Oct 09, 2026 11:15', title: 'Material Anomaly Flagged', actor: 'Store System AI', details: 'Detected +4.2% consumption discrepancy in TMT 16mm Rebar store ledger vs steel binder pour log.' },
      { id: 'ACT-3', time: 'Oct 08, 2026 17:10', title: 'Level 2 Slab Certification Released', actor: 'Pooja Iyer, PE (Audit Manager)', details: 'Approved milestone payout claim #PRJ-101-M5 based on verified AI stress test evidence.' }
    ]
  },
  {
    id: 'PRJ-102',
    code: 'PRJ-2026-MUM-03',
    name: 'Metro Line 3 Sub-Station',
    location: 'Central Transport Hub, BKC, Mumbai, Maharashtra',
    client: 'Metro Infrastructure Corp',
    supervisor: 'Rajesh Varma',
    phase: 'Foundation & Underground Structural',
    status: 'In Progress',
    actualProgress: 42,
    plannedProgress: 40,
    scheduleVariance: 2, // 2% ahead of plan
    startDate: '2026-03-01',
    targetDate: '2027-08-15',
    lastUpdated: '2026-10-09 16:45',
    budget: '$34.2M',
    nextMilestone: 'Basement Level B2 Waterproofing & Drainage',
    nextMilestoneDue: '2026-10-24',
    completedMilestones: 4,
    totalMilestones: 10,
    pendingEvidenceCount: 1,
    openAnomaliesCount: 1,
    materialDiscrepancyCount: 0,
    description: 'Underground high-voltage power substation integrated into Mumbai Metro Line 3 underground corridor.',
    contractors: ['Metro Infrastructure Corp', 'L&T Electrical & Automation', 'Gammon Civil Construction'],
    milestones: [
      { id: 'M101', name: 'Diaphragm Wall & Anchor Tiebacks', stage: 'Foundation', plannedStart: '2026-03-01', plannedEnd: '2026-05-15', actualEnd: '2026-05-10', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Gammon Civil', evidenceStatus: 'Complete', notes: 'Perimeter diaphragm wall 100% leak-tested.' },
      { id: 'M102', name: 'Deep Excavation to -16.5m Depth', stage: 'Foundation', plannedStart: '2026-05-18', plannedEnd: '2026-07-20', actualEnd: '2026-07-15', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Metro Infrastructure', evidenceStatus: 'Complete', notes: 'Rock anchor tensioning verified by third-party inspector.' },
      { id: 'M103', name: 'Base Slab Tremie Concrete Pour (M40)', stage: 'Foundation', plannedStart: '2026-07-22', plannedEnd: '2026-09-10', actualEnd: '2026-09-08', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Metro Infrastructure', evidenceStatus: 'Complete', notes: 'Underwater tremie pour completed with zero segregation.' },
      { id: 'M104', name: 'Basement Level B2 Waterproofing & Drainage', stage: 'Foundation', plannedStart: '2026-09-15', plannedEnd: '2026-10-24', actualEnd: null, plannedProgress: 80, reportedProgress: 85, verifiedProgress: 82, status: 'In Progress', contractor: 'Pidilite Waterproofing', evidenceStatus: 'Review Required', notes: 'HDPE membrane heat-seam testing in progress.' },
      { id: 'M105', name: 'Substation Transformer Vault Steel Framing', stage: 'Superstructure', plannedStart: '2026-10-25', plannedEnd: '2026-12-20', actualEnd: null, plannedProgress: 0, reportedProgress: 0, verifiedProgress: 0, status: 'Not Started', contractor: 'L&T Electrical', evidenceStatus: 'Not Started', notes: 'Structural steel girders delivered to site staging yard.' }
    ],
    progressTrend: [
      { month: 'Jun 2026', planned: 15, reported: 16, verified: 16 },
      { month: 'Jul 2026', planned: 25, reported: 26, verified: 26 },
      { month: 'Aug 2026', planned: 32, reported: 34, verified: 34 },
      { month: 'Sep 2026', planned: 38, reported: 40, verified: 40 },
      { month: 'Oct 2026', planned: 40, reported: 42, verified: 42 }
    ],
    evidenceRecords: [
      { id: 'EVD-904', milestone: 'Basement Level B2 Waterproofing', timestamp: '2026-10-07 16:45 PM', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', status: 'Approved', aiScore: 97.4, notes: 'Vacuum seam tester verified 100% airtight welds.' }
    ],
    materialsBOQ: [
      { material: 'Sulfate Resistant Cement', totalBOQ: '8,000 Bags', received: '4,500 Bags', issued: '4,400 Bags', physicalStock: '100 Bags', recordedUsed: '4,400 Bags', variance: '0.0%', status: 'Normal Variance' },
      { material: 'Heavy Duty Structural Beams', totalBOQ: '600 Tons', received: '280 Tons', issued: '260 Tons', physicalStock: '20 Tons', recordedUsed: '260 Tons', variance: '+0.5%', status: 'Normal Variance' }
    ],
    activities: [
      { id: 'ACT-4', time: 'Oct 07, 2026 16:45', title: 'Waterproofing Inspection Logged', actor: 'Rajesh Varma (Site Supervisor)', details: 'Submitted vacuum seam test photos for Level B2 membrane.' }
    ]
  },
  {
    id: 'PRJ-103',
    code: 'PRJ-2026-PUNE-05',
    name: 'Highland Heights Residential Phase 2',
    location: 'South Valley Boulevard, Kothrud, Pune, Maharashtra',
    client: 'Skyline Buildtech Ltd',
    supervisor: 'Rajesh Varma',
    phase: 'Finishing & Handover',
    status: 'Active',
    actualProgress: 85,
    plannedProgress: 88,
    scheduleVariance: -3,
    startDate: '2025-11-01',
    targetDate: '2026-12-31',
    lastUpdated: '2026-10-08 11:20',
    budget: '$12.8M',
    nextMilestone: 'External Plastering & Waterproof Painting',
    nextMilestoneDue: '2026-10-30',
    completedMilestones: 9,
    totalMilestones: 11,
    pendingEvidenceCount: 0,
    openAnomaliesCount: 0,
    materialDiscrepancyCount: 0,
    description: 'Luxury residential tower comprising 120 residential apartments with integrated clubhouse and solar panel canopy.',
    contractors: ['Skyline Buildtech', 'Asian Paints Commercial', 'Kirloskar Plumbing Systems'],
    milestones: [
      { id: 'M201', name: 'RC Structural Superstructure (14 Floors)', stage: 'Superstructure', plannedStart: '2025-11-01', plannedEnd: '2026-06-30', actualEnd: '2026-06-25', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Skyline Buildtech', evidenceStatus: 'Complete', notes: 'All floor slabs cast and certified.' },
      { id: 'M202', name: 'Internal Brickwork & Electrical Conduit Wiring', stage: 'MEP & Services', plannedStart: '2026-07-01', plannedEnd: '2026-09-15', actualEnd: '2026-09-18', plannedProgress: 100, reportedProgress: 100, verifiedProgress: 100, status: 'Verified', contractor: 'Skyline Buildtech', evidenceStatus: 'Complete', notes: 'Insulation testing on all electrical risers complete.' },
      { id: 'M203', name: 'External Plastering & Waterproof Painting', stage: 'Finishing & Handover', plannedStart: '2026-09-20', plannedEnd: '2026-10-30', actualEnd: null, plannedProgress: 75, reportedProgress: 70, verifiedProgress: 70, status: 'In Progress', contractor: 'Asian Paints', evidenceStatus: 'Review Required', notes: 'Primer coat 80% applied; elastomeric topcoat ongoing.' }
    ],
    progressTrend: [
      { month: 'Jun 2026', planned: 65, reported: 66, verified: 66 },
      { month: 'Jul 2026', planned: 75, reported: 74, verified: 74 },
      { month: 'Aug 2026', planned: 82, reported: 80, verified: 80 },
      { month: 'Sep 2026', planned: 86, reported: 83, verified: 83 },
      { month: 'Oct 2026', planned: 88, reported: 85, verified: 85 }
    ],
    evidenceRecords: [
      { id: 'EVD-905', milestone: 'External Plastering', timestamp: '2026-10-08 11:20 AM', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800', status: 'Approved', aiScore: 95.1, notes: 'Uniform 18mm double-coat sand-face plaster verified.' }
    ],
    materialsBOQ: [
      { material: 'PPC Cement', totalBOQ: '9,000 Bags', received: '8,800 Bags', issued: '8,750 Bags', physicalStock: '50 Bags', recordedUsed: '8,750 Bags', variance: '0.0%', status: 'Normal Variance' }
    ],
    activities: [
      { id: 'ACT-5', time: 'Oct 08, 2026 11:20', title: 'External Painting Claim Logged', actor: 'Rajesh Varma (Site Supervisor)', details: 'Submitted 70% claim for Block B elastomeric coating.' }
    ]
  }
];

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
  const [projectsList, setProjectsList] = useState(MOCK_SUPERVISOR_PROJECTS);
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

  // Load Projects from Backend API with Fallback to Mock Data
  const fetchAuthorizedProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects();
      if (res.success && res.data && res.data.items && res.data.items.length > 0) {
        // Map backend projects to supervisor format
        const fetched = res.data.items.map(p => ({
          id: p.id || `PRJ-${p.code}`,
          code: p.code || p.id,
          name: p.name || 'Site Project',
          location: p.location || 'Site Location Not Specified',
          client: p.client || 'General Contractor',
          supervisor: user?.full_name || 'Site Supervisor',
          phase: p.phase || 'Construction Phase',
          status: p.status || 'In Progress',
          actualProgress: p.completionPercent || p.actual_progress || 65,
          plannedProgress: p.planned_progress || 70,
          scheduleVariance: (p.completionPercent || 65) - (p.planned_progress || 70),
          startDate: p.start_date || '2026-01-01',
          targetDate: p.target_date || '2027-06-30',
          lastUpdated: p.updated_at || new Date().toISOString().replace('T', ' ').substring(0, 16),
          budget: p.budget || '$15.0M',
          nextMilestone: p.next_milestone || 'Structural Slab Pour',
          nextMilestoneDue: p.next_milestone_due || '2026-11-15',
          completedMilestones: 6,
          totalMilestones: 10,
          pendingEvidenceCount: 2,
          openAnomaliesCount: 1,
          materialDiscrepancyCount: 0,
          description: p.description || 'Enterprise construction site project.',
          contractors: ['General Contractor'],
          milestones: MOCK_SUPERVISOR_PROJECTS[0].milestones,
          progressTrend: MOCK_SUPERVISOR_PROJECTS[0].progressTrend,
          evidenceRecords: MOCK_SUPERVISOR_PROJECTS[0].evidenceRecords,
          materialsBOQ: MOCK_SUPERVISOR_PROJECTS[0].materialsBOQ,
          activities: MOCK_SUPERVISOR_PROJECTS[0].activities
        }));
        setProjectsList(fetched);
      } else {
        // Use Mock Dataset if backend returns empty or unavailable
        setProjectsList(MOCK_SUPERVISOR_PROJECTS);
      }
    } catch (err) {
      console.warn('Backend projects endpoint unavailable. Displaying assigned projects workspace demo mode.');
      setProjectsList(MOCK_SUPERVISOR_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizedProjects();
  }, [backendConnected]);

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
      return new Date(b.lastUpdated || '2026-10-09') - new Date(a.lastUpdated || '2026-10-09');
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
              {prj.completedMilestones} <span className="text-sm font-bold text-[#6F7889]">/ {prj.totalMilestones}</span>
            </p>
            <p className="text-[10px] text-[#727C3E] mt-1.5 font-extrabold flex items-center gap-1">
              <Check className="w-3 h-3" /> {Math.round((prj.completedMilestones / prj.totalMilestones) * 100)}% Completed
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
                  {(prj.milestones || []).map((m) => (
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
                  ))}
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
            
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prj.progressTrend || []}>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(prj.evidenceRecords || []).map((ev) => (
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
                  {(prj.materialsBOQ || []).map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#EDE5D6]/40 transition">
                      <td className="px-4 py-3.5 font-bold text-[#29231D]">{m.material}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#29231D]">{m.totalBOQ}</td>
                      <td className="px-4 py-3.5 text-[#6F7889] font-medium">{m.received}</td>
                      <td className="px-4 py-3.5 text-[#29231D] font-semibold">{m.physicalStock}</td>
                      <td className={`px-4 py-3.5 font-extrabold ${m.variance.includes('+4') ? 'text-rose-600' : 'text-[#727C3E]'}`}>
                        {m.variance}
                      </td>
                      <td className="px-4 py-3.5">
                        {m.variance.includes('+4') ? (
                          <span className="bg-rose-500/15 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-500/30">High Discrepancy</span>
                        ) : (
                          <span className="badge-verified px-2 py-0.5 rounded-full text-[10px]">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Activity Timeline */}
        {activeDetailsTab === 'timeline' && (
          <div className="porcelain-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Immutable Project Audit Trail</h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E4D8BE]">
              {(prj.activities || []).map((a) => (
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
