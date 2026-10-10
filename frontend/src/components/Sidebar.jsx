import React from 'react';
<<<<<<< HEAD
import {
  LayoutDashboard,
  Camera,
  Package,
  AlertTriangle,
  UserCheck,
  FileText,
=======
import { 
  LayoutDashboard, 
  Camera, 
  Package, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  ChevronRight,
  ShieldCheck,
  Server,
  Users,
  ScrollText,
<<<<<<< HEAD
  Building2,
  Boxes,
  Compass,
  ArrowRight,
  User
=======
  LogOut,
  Building2,
  Boxes,
  Compass,
  ArrowRight
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Master Role Names matching specs
export const ROLE_SUPERVISOR = 'SITE_SUPERVISOR';
export const ROLE_STORE = 'STORE_INCHARGE';
export const ROLE_AUDIT = 'AUDIT_MANAGER';
export const ROLE_ADMIN = 'ADMIN';

<<<<<<< HEAD
// Role-based navigation maps
=======
// Role-based navigation maps (Settings option removed as requested)
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
const NAVIGATION_BY_ROLE = {
  [ROLE_SUPERVISOR]: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: Building2 },
    { id: 'photo-audit', label: 'Live Site Capture', icon: Camera },
    { id: 'submissions', label: 'My Submissions', icon: ScrollText },
    { id: 'reports', label: 'Audit Reports', icon: FileText },
<<<<<<< HEAD
    { id: 'profile', label: 'My Profile', icon: User },
=======
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  ],
  [ROLE_STORE]: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'material-audit', label: 'Materials & Receipts', icon: Package },
    { id: 'inventory-anomalies', label: 'Discrepancies & Stock', icon: AlertTriangle, badgeKey: 'anomalies' },
    { id: 'reports', label: 'Inventory Reports', icon: FileText },
<<<<<<< HEAD
    { id: 'profile', label: 'My Profile', icon: User },
=======
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  ],
  [ROLE_AUDIT]: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'auditor-review', label: 'Milestone Reviews', icon: UserCheck, badgeKey: 'pendingReviews' },
    { id: 'photo-audit', label: 'Site Evidence', icon: Camera },
    { id: 'material-audit', label: 'Material Audits', icon: Package },
    { id: 'inventory-anomalies', label: 'Audit Findings', icon: AlertTriangle, badgeKey: 'anomalies' },
    { id: 'audit-reports', label: 'Clearance & Reports', icon: FileText },
<<<<<<< HEAD
    { id: 'profile', label: 'My Profile', icon: User },
=======
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  ],
  [ROLE_ADMIN]: [
    { id: 'admin-dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'user-management', label: 'Users & Roles', icon: Users },
    { id: 'activity-logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'dashboard', label: 'Operational View', icon: Compass },
    { id: 'auditor-review', label: 'Milestone Reviews', icon: UserCheck },
    { id: 'material-audit', label: 'Materials & Inventory', icon: Package },
<<<<<<< HEAD
    { id: 'profile', label: 'My Profile', icon: User },
=======
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  ]
};

const ALL_ROLES_DEFAULT_NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'admin-dashboard', label: 'Admin Console', icon: Users },
  { id: 'photo-audit', label: 'Site Evidence', icon: Camera },
  { id: 'material-audit', label: 'Materials & Inventory', icon: Package },
  { id: 'inventory-anomalies', label: 'Audit Findings', icon: AlertTriangle, badgeKey: 'anomalies' },
  { id: 'auditor-review', label: 'Auditor Review', icon: UserCheck, badgeKey: 'pendingReviews' },
  { id: 'audit-reports', label: 'Clearance & Reports', icon: FileText },
  { id: 'user-management', label: 'Team & Access', icon: Users },
];

<<<<<<< HEAD
export default function Sidebar({
  currentTab,
  onSelectTab,
  badgeCounts = {},
  isOpen = true,
  onCloseMobile,
  backendConnected
}) {
  const { user, role } = useAuth();
=======
export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  badgeCounts = {}, 
  isOpen = true, 
  onCloseMobile,
  backendConnected
}) {
  const { user, role, logout } = useAuth();
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a

  // Normalize role string to key
  const normalizedRole = (() => {
    if (!role) return ROLE_AUDIT;
    const r = role.toUpperCase().replace(/\s+/g, '_');
    if (r.includes('SUPERVISOR') || r.includes('CONTRACTOR')) return ROLE_SUPERVISOR;
    if (r.includes('STORE') || r.includes('SHOPKEEPER')) return ROLE_STORE;
    if (r.includes('AUDIT')) return ROLE_AUDIT;
    if (r.includes('ADMIN')) return ROLE_ADMIN;
    return ROLE_AUDIT;
  })();

  const navItems = NAVIGATION_BY_ROLE[normalizedRole] || ALL_ROLES_DEFAULT_NAV;

  const handleLogout = async () => {
    await logout();
  };

  const roleDisplayNames = {
    [ROLE_SUPERVISOR]: 'Site Supervisor',
    [ROLE_STORE]: 'Store In-Charge',
    [ROLE_AUDIT]: 'Project Auditor',
    [ROLE_ADMIN]: 'System Administrator',
  };

  return (
    <>
      {/* Backdrop for overlays */}
      {isOpen && (
<<<<<<< HEAD
        <div
=======
        <div 
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#29231D]/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

<<<<<<< HEAD
      {/* Glassmorphic Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#EDE8D0] glass-sidebar backdrop-blur-2xl text-[#29231D] border-r border-[#D6B238]/40 flex flex-col transition-transform duration-200 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-[#D6B238]/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D6B238] flex items-center justify-center text-[#29231D] font-black text-xl shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-[#29231D]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#29231D] tracking-tight text-base font-['Outfit']">PRAMAAN</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#29231D] text-[#D6B238]">AI</span>
              </div>
              <p className="text-[10px] text-[#5C4A1C] font-extrabold tracking-wider uppercase mt-0.5">From Site To Proof</p>
=======
      {/* Glassmorphic Obsidian Charcoal Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#29231D]/95 backdrop-blur-2xl text-[#EDE5D6] border-r border-[#E4D8BE]/20 flex flex-col transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-[#E4D8BE]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D6B238] flex items-center justify-center text-[#29231D] font-black text-xl shadow-md shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#FFFDF8] tracking-tight text-base font-['Outfit']">SITESURE</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D6B238] text-[#29231D]">AI</span>
              </div>
              <p className="text-[10px] text-[#D6B238] font-bold tracking-wider uppercase mt-0.5">Build Transparency</p>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-4 space-y-1.5 overflow-y-auto">
<<<<<<< HEAD
          <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-[#524636] uppercase font-['Outfit']">
=======
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#6F7889] uppercase font-['Outfit']">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
            Workspace Navigation ({roleDisplayNames[normalizedRole] || role})
          </div>

          {navItems.map((item) => {
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
<<<<<<< HEAD
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all group cursor-pointer
                  ${isActive
                    ? 'nav-item-active text-[#29231D]'
                    : 'text-[#29231D] hover:bg-[#D6B238]/20 hover:text-[#1A1612]'
=======
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer
                  ${isActive 
                    ? 'nav-item-active' 
                    : 'text-[#EDE5D6] hover:bg-white/8 hover:text-[#FFFDF8]'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  }
                `}
              >
                <div className="flex items-center gap-3">
<<<<<<< HEAD
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#29231D]' : 'text-[#4A3E2C] group-hover:text-[#29231D]'}`} />
                  <span className={`font-bold text-[13px] ${isActive ? 'text-[#29231D]' : 'text-[#29231D] group-hover:text-[#1A1612]'}`}>{item.label}</span>
=======
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#29231D]' : 'text-[#D6B238] group-hover:text-[#FFFDF8]'}`} />
                  <span className="font-medium text-[13px]">{item.label}</span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                </div>

                <div className="flex items-center gap-1.5">
                  {badgeCount > 0 && (
                    <span className={`
<<<<<<< HEAD
                      text-[10px] px-2 py-0.5 rounded-full font-extrabold
                      ${isActive
                        ? 'bg-[#29231D] text-[#D6B238]'
                        : 'bg-[#29231D]/15 text-[#29231D] border border-[#29231D]/30'
                      }
=======
                      text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${isActive ? 'bg-[#29231D] text-[#D6B238]' : 'bg-[#D6B238]/20 text-[#D6B238] border border-[#D6B238]/40'}
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                    `}>
                      {badgeCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-[#29231D]" />}
                </div>
              </button>
            );
          })}
        </div>

<<<<<<< HEAD
=======
        {/* Callout Card (matching screenshot) */}
        <div className="px-4 py-2">
          <div className="bg-gradient-to-br from-[#29231D] to-[#3d342c] p-3.5 rounded-xl border border-[#D6B238]/30 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2 pointer-events-none">
              <Building2 className="w-24 h-24 text-[#D6B238]" />
            </div>
            <p className="text-xs font-bold text-[#D6B238] font-['Outfit']">Smarter Audits</p>
            <p className="text-[11px] text-[#EDE5D6] font-semibold mt-0.5">Stronger Projects</p>
            <p className="text-[10px] text-[#6F7889] mt-1 leading-tight">Verified progress. Accountable construction.</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#727C3E] bg-[#727C3E]/20 px-2 py-0.5 rounded border border-[#727C3E]/40">Verified AI</span>
              <button 
                onClick={() => onSelectTab('photo-audit')}
                className="w-6 h-6 rounded-full bg-[#D6B238] text-[#29231D] flex items-center justify-center hover:scale-105 transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* User Profile & Footer */}
        <div className="p-4 border-t border-[#E4D8BE]/15 bg-[#201b17]/90 space-y-3">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#D6B238] text-[#29231D] flex items-center justify-center text-xs font-bold shrink-0">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#FFFDF8] truncate">{user.full_name}</p>
                  <p className="text-[10px] text-[#D6B238] font-medium truncate">
                    {roleDisplayNames[normalizedRole] || role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#6F7889] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#6F7889] font-semibold flex items-center gap-1">
              <Server className="w-3 h-3 text-[#D6B238]" />
              Backend:
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              backendConnected 
                ? 'bg-[#727C3E]/20 text-[#727C3E] border-[#727C3E]/40' 
                : 'bg-[#D6B238]/20 text-[#D6B238] border-[#D6B238]/40'
            }`}>
              {backendConnected ? 'FastAPI Connected' : 'Demo Mode'}
            </span>
          </div>
        </div>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
      </aside>
    </>
  );
}

