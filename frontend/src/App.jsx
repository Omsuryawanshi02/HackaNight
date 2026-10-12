import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ActivityLogs from './pages/ActivityLogs';
import PhotoAudit from './pages/PhotoAudit';
import MaterialAudit from './pages/MaterialAudit';
import InventoryAnomalies from './pages/InventoryAnomalies';
import AuditorReview from './pages/AuditorReview';
import AuditReports from './pages/AuditReports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Projects from './pages/Projects';

// Supabase Realtime Client
import { supabase } from './services/supabaseClient';

import { checkBackendHealth, getProjects, getAudits, getDashboardData } from './services/api';

// Role → default landing page mapping
const DEFAULT_TAB_FOR_ROLE = {
  'Main Supervisor': 'admin-dashboard',
  'Administrator': 'admin-dashboard',
  'Admin': 'admin-dashboard',
  'Contractor': 'dashboard',
  'Shopkeeper': 'dashboard',
  'Auditor': 'dashboard',
};

const ALL_ACCESSIBLE_TABS = [
  'landing', 'admin-dashboard', 'dashboard', 'projects', 'user-management', 'activity-logs',
  'photo-audit', 'material-audit', 'inventory-anomalies',
  'auditor-review', 'audit-reports', 'settings', 'profile'
];

// Role → allowed tabs (All dashboards and audit features accessible to all authenticated roles)
const ALLOWED_TABS = {
  'Main Supervisor': ALL_ACCESSIBLE_TABS,
  'Administrator': ALL_ACCESSIBLE_TABS,
  'Admin': ALL_ACCESSIBLE_TABS,
  'Contractor': ALL_ACCESSIBLE_TABS,
  'Shopkeeper': ALL_ACCESSIBLE_TABS,
  'Auditor': ALL_ACCESSIBLE_TABS,
};

export default function App() {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [unauthView, setUnauthView] = useState('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  // Core App Data (Strictly live from Supabase)
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalProjects: 0,
    activeUsers: 0,
    pendingReviews: 0,
    verifiedMilestones: 0,
    materialDiscrepancies: 0,
    overallSafetyScore: 0
  });
  const [milestonesData, setMilestonesData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  
  const [materialAudits, setMaterialAudits] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [auditReviews, setAuditReviews] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [activeReviewAudit, setActiveReviewAudit] = useState(null);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch live backend data from Supabase
  const syncLiveBackendData = useCallback(async () => {
    try {
      const [projRes, auditRes, dashRes] = await Promise.all([
        getProjects(),
        getAudits(),
        getDashboardData()
      ]);

      if (projRes.success && Array.isArray(projRes.data)) {
        setProjects(projRes.data);
        if (projRes.data.length > 0) {
          setSelectedProjectId(prev => (prev && projRes.data.some(p => p.id === prev || p.code === prev)) ? prev : projRes.data[0].id);
        } else {
          setSelectedProjectId(null);
        }
      }
      if (auditRes.success && Array.isArray(auditRes.data)) {
        setAuditReviews(auditRes.data);
      }
      if (dashRes.success && dashRes.data) {
        setStats(prev => ({ ...prev, ...dashRes.data }));
      }
    } catch (err) {
      console.warn('Backend live data sync notice:', err);
    }
  }, []);

  // Supabase Realtime Subscription:
  // Projects created or assigned in Admin panel appear in real-time across all allotted roles
  useEffect(() => {
    const channel = supabase
      .channel('projects-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('[Supabase Realtime] Project change event:', payload);
          syncLiveBackendData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_members' },
        (payload) => {
          console.log('[Supabase Realtime] Project member allotment event:', payload);
          syncLiveBackendData();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('[Supabase Realtime] Subscription error:', err);
        } else {
          console.log('[Supabase Realtime] Channel status:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncLiveBackendData]);

  // Check Backend Connection Health (initial + recurring check)
  const verifyBackend = useCallback(async () => {
    const res = await checkBackendHealth();
    setBackendConnected(res.connected);
    if (res.connected) {
      syncLiveBackendData();
    }
  }, [syncLiveBackendData]);

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 12000);
    return () => clearInterval(interval);
  }, [verifyBackend]);

  // Set default tab when user authenticates
  useEffect(() => {
    if (isAuthenticated && role) {
      const defaultTab = DEFAULT_TAB_FOR_ROLE[role] || 'dashboard';
      setCurrentTab(defaultTab);
    } else if (!isAuthenticated) {
      setUnauthView('landing');
    }
  }, [isAuthenticated, role]);

  // Navigation & tab access with alias handling
  const handleSetTab = useCallback((targetTab) => {
    const ALIASES = {
      'all-audits': 'auditor-review'
    };
    const tab = ALIASES[targetTab] || targetTab;
    if (ALL_ACCESSIBLE_TABS.includes(tab)) {
      setCurrentTab(tab);
    } else {
      setCurrentTab('dashboard');
    }
  }, []);

  // Synchronize stats dynamically based on current live lists
  useEffect(() => {
    const pendingCount = auditReviews.filter(r => r.status === 'Pending Review').length;
    const verifiedCount = auditReviews.filter(r => r.status === 'Approved').length;
    const discrepanciesCount = materialAudits.filter(m => m.status && m.status.includes('Discrepancy')).length + 
                                anomalies.filter(a => a.status === 'Open' || a.status === 'Under Investigation').length;

    setStats(prev => ({
      ...prev,
      activeProjects: projects.length,
      totalProjects: projects.length,
      pendingReviews: pendingCount,
      verifiedMilestones: verifiedCount,
      materialDiscrepancies: discrepanciesCount
    }));
  }, [projects, auditReviews, materialAudits, anomalies]);

  // Handlers for cross-page interactions
  const handleSaveMaterialAudit = (newRecord) => {
    setMaterialAudits(prev => [newRecord, ...prev]);

    if (newRecord.status === 'High Discrepancy') {
      const newAnomaly = {
        id: `ANOM-${Math.floor(105 + Math.random() * 890)}`,
        project: newRecord.project,
        material: newRecord.material,
        anomalyType: 'Excess Material Consumption Discrepancy',
        expectedValue: `${newRecord.recordedConsumption} ${newRecord.unit} (Recorded in Daily Log)`,
        observedValue: `${newRecord.estimatedUsed} ${newRecord.unit} (Store Stock Reconciled)`,
        variance: `+${newRecord.consumptionVariance} ${newRecord.unit} (+${newRecord.variancePercent}%)`,
        severity: 'High',
        explanation: `Field audit logged ${newRecord.consumptionVariance} ${newRecord.unit} variance between store issues and certified pour logs. Exceeds permissible allowance.`,
        recommendedAction: 'Inspect batching plant scale calibration and audit daily subcontractor consumption books.',
        status: 'Open',
        detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setAnomalies(prev => [newAnomaly, ...prev]);
    }
  };

  const handleUpdateAnomalyStatus = (id, newStatus) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleSaveToAuditorReview = (newAudit) => {
    setAuditReviews(prev => [newAudit, ...prev]);
    handleSetTab('auditor-review');
  };

  const handleUpdateAuditDecision = (id, decisionUpdate) => {
    setAuditReviews(prev => prev.map(r => r.id === id ? { ...r, ...decisionUpdate } : r));

    const targetAudit = auditReviews.find(r => r.id === id);
    if (targetAudit) {
      const newReport = {
        id: `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        title: `${targetAudit.milestone} Formal Certification`,
        project: targetAudit.project,
        milestone: targetAudit.milestone,
        auditId: targetAudit.id,
        auditType: targetAudit.auditType,
        generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        auditor: 'Pooja Iyer, Lead Quality Auditor',
        contractor: 'Apex Infracon Pvt Ltd',
        verdict: decisionUpdate.status === 'Approved' ? 'Approved for Billing' : 
                 decisionUpdate.status === 'Rejected' ? 'Rejected with Non-Compliance' : 'Conditional Review Required',
        status: 'Certification Completed',
        keyFindings: [
          `Auditor Verdict: ${decisionUpdate.status}`,
          `Auditor Rationale: ${decisionUpdate.auditorNotes || 'Standard checklist verified.'}`,
          `Observable visual progress aligned with claimed ${targetAudit.claimedPercentage}%.`
        ],
        reconciliationData: {
          material: 'Construction Deliverables Package',
          challanQty: 'Standard',
          receivedQty: 'Verified',
          openingStock: 'Verified',
          closingStock: 'Verified',
          consumedRecorded: 'Certified',
          consumedPhysical: 'Certified',
          variance: '0% Net Allowance'
        }
      };
      setReports(prev => [newReport, ...prev]);
    }
  };

  const handleResetData = () => {
    setMaterialAudits([]);
    setAnomalies([]);
    setAuditReviews([]);
    setReports([]);
  };

  const handleSelectAuditForReview = (audit) => {
    setActiveReviewAudit(audit);
    handleSetTab('auditor-review');
  };

  // ─── Auth Loading Screen ───────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 relative">
            <svg className="w-full h-full animate-pulse" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="17" fill="#9C86CE"/>
              <circle cx="17" cy="17" r="8.6" fill="#FFFFFF"/>
              <circle cx="17" cy="17" r="3.7" fill="#192853"/>
            </svg>
          </div>
          <p className="text-sm text-[#8b8c8e] font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  // ─── Unauthenticated Screens (Public Landing & Login) ──────────────
  if (!isAuthenticated) {
    if (unauthView === 'login') {
      return (
        <>
          <Toast toasts={toasts} onDismiss={dismissToast} />
          <Login onBackToLanding={() => setUnauthView('landing')} />
        </>
      );
    }

    return (
      <>
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <LandingPage
          onNavigateToLogin={() => setUnauthView('login')}
          onNavigateToApp={() => setUnauthView('login')}
        />
      </>
    );
  }

  // ─── Authenticated App Shell ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-white antialiased selection:bg-[#FFE14F]/20 selection:text-[#FFE14F]">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Persistent / Toggleable Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSetTab}
        badgeCounts={{
          anomalies: anomalies.filter(a => a.status === 'Open' || a.status === 'Under Investigation').length,
          pendingReviews: auditReviews.filter(r => r.status === 'Pending Review').length
        }}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        backendConnected={backendConnected}
      />

      {/* Main Content Area */}
      <div className={`${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} flex-1 flex flex-col min-w-0 transition-all duration-200`}>
        {/* Sticky Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          backendConnected={backendConnected}
          onOpenQuickAudit={() => handleSetTab('photo-audit')}
          onOpenProfile={() => handleSetTab('profile')}
          onProjectCreated={(newProject) => {
            setProjects(prev => {
              const filtered = prev.filter(p => p.id !== newProject.id && p.code !== newProject.code);
              return [newProject, ...filtered];
            });
            setSelectedProjectId(newProject.id);
            syncLiveBackendData();
            addToast({
              type: 'success',
              title: 'Project Registered in Supabase',
              message: `Project "${newProject.name}" has been registered and synced with Supabase.`
            });
          }}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* ── Public Landing Overview (Authenticated View) ── */}
          {currentTab === 'landing' && (
            <div className="-m-4 sm:-m-6 lg:-m-8">
              <LandingPage
                onNavigateToLogin={() => handleSetTab('dashboard')}
                onNavigateToApp={() => handleSetTab('dashboard')}
              />
            </div>
          )}

          {/* ── Profile Page ── */}
          {currentTab === 'profile' && (
            <Profile
              onShowToast={addToast}
              projects={projects}
              backendConnected={backendConnected}
            />
          )}

          {/* ── My Projects Page (Site Supervisor) ── */}
          {currentTab === 'projects' && (
            <Projects
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onNavigate={handleSetTab}
              onShowToast={addToast}
              backendConnected={backendConnected}
            />
          )}

          {/* ── Admin Pages ── */}
          {currentTab === 'admin-dashboard' && (
            <AdminDashboard
              stats={stats}
              recentAudits={auditReviews}
              anomalies={anomalies}
              onNavigate={handleSetTab}
            />
          )}

          {currentTab === 'user-management' && (
            <UserManagement
              onShowToast={addToast}
              backendConnected={backendConnected}
              onNavigate={handleSetTab}
            />
          )}

          {currentTab === 'activity-logs' && (
            <ActivityLogs
              onShowToast={addToast}
              backendConnected={backendConnected}
            />
          )}

          {/* ── Shared Audit Workspace Pages ── */}
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              milestonesData={milestonesData}
              materialsData={materialsData}
              recentAudits={auditReviews}
              anomalies={anomalies}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onNavigate={handleSetTab}
              onSelectAuditForReview={handleSelectAuditForReview}
            />
          )}

          {currentTab === 'photo-audit' && (
            <PhotoAudit
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSaveToAuditorReview={handleSaveToAuditorReview}
              onShowToast={addToast}
              backendConnected={backendConnected}
            />
          )}

          {currentTab === 'material-audit' && (
            <MaterialAudit
              projects={projects}
              selectedProjectId={selectedProjectId}
              materialAudits={materialAudits}
              onSaveAudit={handleSaveMaterialAudit}
              onGenerateReport={(form, calc) => {
                const reportRecord = {
                  id: `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                  title: `${form.material} Reconciliation Statement`,
                  project: form.projectName,
                  milestone: `${form.material} Batch Verification`,
                  auditId: `MAT-AUD-${Math.floor(100 + Math.random() * 900)}`,
                  auditType: 'Material Reconciliation & Challan Audit',
                  generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  auditor: 'Pooja Iyer, Lead Quality Auditor',
                  contractor: form.supplier,
                  verdict: calc.isHighVariance ? 'More Evidence Required' : 'Approved for Billing',
                  status: 'Generated',
                  keyFindings: [
                    `Challan #${form.challanNo} declared ${form.challanQty} ${form.unit}, actual received ${form.receivedQty} ${form.unit}.`,
                    `Physical consumption is ${calc.estimatedUsed} ${form.unit} vs recorded ${form.recordedConsumption} ${form.unit}.`,
                    `Net consumption variance: ${calc.consumptionVariance > 0 ? `+${calc.consumptionVariance}` : calc.consumptionVariance} ${form.unit} (${calc.variancePercent}%).`
                  ],
                  reconciliationData: {
                    material: form.material,
                    challanQty: `${form.challanQty} ${form.unit}`,
                    receivedQty: `${form.receivedQty} ${form.unit}`,
                    openingStock: `${form.openingStock} ${form.unit}`,
                    closingStock: `${form.closingPhysicalStock} ${form.unit}`,
                    consumedRecorded: `${form.recordedConsumption} ${form.unit}`,
                    consumedPhysical: `${calc.estimatedUsed} ${form.unit}`,
                    variance: `${calc.consumptionVariance > 0 ? `+${calc.consumptionVariance}` : calc.consumptionVariance} ${form.unit} (${calc.variancePercent}%)`
                  }
                };
                setReports(prev => [reportRecord, ...prev]);
                handleSetTab('audit-reports');
                addToast({
                  type: 'success',
                  title: 'Report Dossier Generated',
                  message: `New report ${reportRecord.id} compiled from material reconciliation.`
                });
              }}
              onShowToast={addToast}
              backendConnected={backendConnected}
            />
          )}

          {currentTab === 'inventory-anomalies' && (
            <InventoryAnomalies
              anomalies={anomalies}
              onUpdateAnomalyStatus={handleUpdateAnomalyStatus}
              onNavigateToAuditorReview={() => handleSetTab('auditor-review')}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'auditor-review' && (
            <AuditorReview
              auditReviews={auditReviews}
              onUpdateAuditDecision={handleUpdateAuditDecision}
              onShowToast={addToast}
              backendConnected={backendConnected}
              initialSelectedAudit={activeReviewAudit}
            />
          )}

          {currentTab === 'audit-reports' && (
            <AuditReports
              reports={reports}
              onShowToast={addToast}
              backendConnected={backendConnected}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              backendConnected={backendConnected}
              onRefreshBackendStatus={verifyBackend}
              onResetData={handleResetData}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
