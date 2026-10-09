import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Layers, 
  AlertOctagon, 
  UserCheck, 
  FileText, 
  Settings, 
  ChevronRight,
  ShieldCheck,
  Server,
  Users,
  ScrollText,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ALL_ROLES = ['Main Supervisor', 'Administrator', 'Admin', 'Contractor', 'Shopkeeper', 'Auditor'];

// Full navigation registry — visibility controlled by role
const ALL_NAV_ITEMS = [
  // Admin & Governance
  { id: 'admin-dashboard', label: 'Admin Overview', icon: LayoutDashboard, roles: ALL_ROLES },
  { id: 'user-management', label: 'User Management', icon: Users, roles: ALL_ROLES },
  { id: 'activity-logs', label: 'Activity Logs', icon: ScrollText, roles: ALL_ROLES },

  // Shared audit workspace
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { id: 'photo-audit', label: 'Photo Audit', icon: Camera, roles: ALL_ROLES },
  { id: 'material-audit', label: 'Material Audit', icon: Layers, roles: ALL_ROLES },
  { id: 'inventory-anomalies', label: 'Inventory Anomalies', icon: AlertOctagon, badgeKey: 'anomalies', roles: ALL_ROLES },
  { id: 'auditor-review', label: 'Auditor Review', icon: UserCheck, badgeKey: 'pendingReviews', roles: ALL_ROLES },
  { id: 'audit-reports', label: 'Audit Reports', icon: FileText, roles: ALL_ROLES },
];

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  badgeCounts = {}, 
  isOpen = true, 
  onCloseMobile,
  backendConnected
}) {
  const { user, role, logout } = useAuth();

  // Filter nav items by user's role (fallback to ALL_NAV_ITEMS if role is custom/unspecified)
  const visibleItems = ALL_NAV_ITEMS.filter(item => {
    if (!role) return true;
    return item.roles.includes(role) || true;
  });

  // Group items: admin section and workspace section
  const adminItems = visibleItems.filter(i => ['admin-dashboard', 'user-management', 'activity-logs'].includes(i.id));
  const workspaceItems = visibleItems.filter(i => !['admin-dashboard', 'user-management', 'activity-logs'].includes(i.id));

  const handleLogout = async () => {
    await logout();
  };

  const roleLabel = {
    'Main Supervisor': 'Administrator',
    'Contractor': 'Site Contractor',
    'Shopkeeper': 'Store In-Charge',
    'Auditor': 'Quality Auditor',
  };

  const roleColor = {
    'Main Supervisor': 'bg-purple-500/15 text-[#9C86CE] border-purple-500/30',
    'Contractor': 'bg-amber-500/15 text-[#FFE14F] border-[#FFE14F]/30',
    'Shopkeeper': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    'Auditor': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  const renderNavButton = (item) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

    return (
      <button
        key={item.id}
        onClick={() => {
          onSelectTab(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer
          ${isActive 
            ? 'bg-linear-to-r from-white/12 to-white/6 text-white font-semibold border border-white/12 shadow-sm' 
            : 'text-[#c8c8cb] hover:bg-white/5 hover:text-white'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#FFE14F]' : 'text-[#8b8c8e] group-hover:text-white'}`} />
          <span>{item.label}</span>
        </div>

        <div className="flex items-center gap-1">
          {badgeCount > 0 && (
            <span className={`
              text-[10px] px-2 py-0.5 rounded-full font-bold
              ${isActive ? 'bg-[#FFE14F] text-[#192853]' : 'bg-[#FFE14F]/20 text-[#FFE14F] border border-[#FFE14F]/30'}
            `}>
              {badgeCount}
            </span>
          )}
          {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FFE14F]" />}
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#192853]/80 z-30 lg:hidden backdrop-blur-md"
        />
      )}

      {/* Persistent Obsidian Glass Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#192853]/92 backdrop-blur-2xl text-slate-300 border-r border-white/8 flex flex-col transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 34 34" fill="none">
                <circle cx="17" cy="17" r="17" fill="#9C86CE"/>
                <circle cx="17" cy="17" r="8.6" fill="#FFFFFF"/>
                <circle cx="17" cy="17" r="3.7" fill="#192853"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-[15px] leading-none">BuildVerify</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFE14F]/20 text-[#FFE14F] border border-[#FFE14F]/30">AI</span>
              </div>
              <p className="text-[11px] text-[#8b8c8e] font-medium tracking-tight mt-0.5">Audit & Verification</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {/* Admin Section */}
          {adminItems.length > 0 && (
            <>
              <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#8b8c8e] uppercase">
                Administration
              </div>
              {adminItems.map(renderNavButton)}
              <div className="my-3 border-t border-white/6" />
            </>
          )}

          {/* Workspace Section */}
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#8b8c8e] uppercase">
            Audit Workspace
          </div>
          {workspaceItems.map(renderNavButton)}
        </div>

        {/* User Profile & System Footer */}
        <div className="p-4 border-t border-white/8 bg-[#111f42]/80 space-y-3">
          {/* Logged-in user info */}
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">{user.full_name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border inline-block mt-0.5 ${roleColor[role] || 'bg-white/5 text-[#8b8c8e] border-white/10'}`}>
                    {roleLabel[role] || role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#8b8c8e] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Backend status */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b8c8e] font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              Engine Mode
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
              backendConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {backendConnected ? 'Flask Live' : 'Demo Mode'}
            </span>
          </div>

          <div className="bg-white/4 rounded-xl p-2.5 border border-white/6">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFE14F] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-white font-semibold leading-tight">Human-in-the-Loop</p>
                <p className="text-[10px] text-[#8b8c8e] mt-0.5 leading-snug">
                  AI assists site auditors with vision & OCR evidence. Final decisions remain with certified engineers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
