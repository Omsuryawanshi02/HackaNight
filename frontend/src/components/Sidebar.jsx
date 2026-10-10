import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Package,
  AlertTriangle,
  UserCheck,
  FileText,
  ChevronRight,
  ShieldCheck,
  Server,
  Users,
  ScrollText,
  Building2,
  Boxes,
  Compass,
  ArrowRight,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Master Role Names matching specs
export const ROLE_SUPERVISOR = 'SITE_SUPERVISOR';
export const ROLE_STORE = 'STORE_INCHARGE';
export const ROLE_AUDIT = 'AUDIT_MANAGER';
export const ROLE_ADMIN = 'ADMIN';

// Role-based navigation maps
const NAVIGATION_BY_ROLE = {
  [ROLE_SUPERVISOR]: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: Building2 },
    { id: 'photo-audit', label: 'Live Site Capture', icon: Camera },
    { id: 'submissions', label: 'My Submissions', icon: ScrollText },
    { id: 'reports', label: 'Audit Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
  [ROLE_STORE]: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'material-audit', label: 'Materials & Receipts', icon: Package },
    { id: 'inventory-anomalies', label: 'Discrepancies & Stock', icon: AlertTriangle, badgeKey: 'anomalies' },
    { id: 'reports', label: 'Inventory Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
  [ROLE_AUDIT]: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'auditor-review', label: 'Milestone Reviews', icon: UserCheck, badgeKey: 'pendingReviews' },
    { id: 'photo-audit', label: 'Site Evidence', icon: Camera },
    { id: 'material-audit', label: 'Material Audits', icon: Package },
    { id: 'inventory-anomalies', label: 'Audit Findings', icon: AlertTriangle, badgeKey: 'anomalies' },
    { id: 'audit-reports', label: 'Clearance & Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
  [ROLE_ADMIN]: [
    { id: 'admin-dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'user-management', label: 'Users & Roles', icon: Users },
    { id: 'activity-logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'dashboard', label: 'Operational View', icon: Compass },
    { id: 'auditor-review', label: 'Milestone Reviews', icon: UserCheck },
    { id: 'material-audit', label: 'Materials & Inventory', icon: Package },
    { id: 'profile', label: 'My Profile', icon: User },
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

export default function Sidebar({
  currentTab,
  onSelectTab,
  badgeCounts = {},
  isOpen = true,
  onCloseMobile,
  backendConnected
}) {
  const { user, role } = useAuth();

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
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#29231D]/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

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
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-[#524636] uppercase font-['Outfit']">
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
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all group cursor-pointer
                  ${isActive
                    ? 'nav-item-active text-[#29231D]'
                    : 'text-[#29231D] hover:bg-[#D6B238]/20 hover:text-[#1A1612]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#29231D]' : 'text-[#4A3E2C] group-hover:text-[#29231D]'}`} />
                  <span className={`font-bold text-[13px] ${isActive ? 'text-[#29231D]' : 'text-[#29231D] group-hover:text-[#1A1612]'}`}>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {badgeCount > 0 && (
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-extrabold
                      ${isActive
                        ? 'bg-[#29231D] text-[#D6B238]'
                        : 'bg-[#29231D]/15 text-[#29231D] border border-[#29231D]/30'
                      }
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

      </aside>
    </>
  );
}

