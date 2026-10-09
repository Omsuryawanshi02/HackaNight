import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Building2, 
  Check, 
  ChevronDown, 
  Plus,
  Search,
  Calendar,
  Download,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  onToggleSidebar, 
  projects = [], 
  selectedProjectId, 
  onSelectProject,
  backendConnected,
  onOpenQuickAudit
}) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const notifications = [
    { id: 1, title: 'Discrepancy Flagged', message: 'Tower B Cement consumption variance is +15.8%', time: '10m ago', unread: true },
    { id: 2, title: 'New Photo Submitted', message: 'Pier 48 North Column Stem de-shuttering photo ready for audit', time: '1h ago', unread: true },
    { id: 3, title: 'Decision Recorded', message: 'Foundation Pile Caps approved by Lead Auditor', time: '3h ago', unread: false }
  ];

  return (
    <header className="sticky top-0 z-20 h-20 glass-header px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="px-2.5 py-2 rounded-xl text-[#29231D] bg-[#FFFDF8] hover:bg-[#EDE5D6] border border-[#E4D8BE] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          aria-label="Toggle menu"
          title="Toggle Sidebar Navigation Menu"
        >
          <Menu className="w-4.5 h-4.5" />
          <span className="text-xs font-bold font-['Outfit'] hidden sm:inline">Menu</span>
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7889]" />
          <input 
            type="text"
            placeholder="Search projects, sites, materials..."
            className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] focus:ring-1 focus:ring-[#D6B238] transition shadow-xs"
          />
        </div>
      </div>

      {/* Right: Date Picker, Export Report, Notifications, User Selector */}
      <div className="flex items-center gap-3">
        {/* Date Filter Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#E4D8BE] text-xs font-semibold text-[#29231D] shadow-xs">
          <Calendar className="w-4 h-4 text-[#D6B238]" />
          <span>Oct 09, 2026 - Nov 09, 2026</span>
        </div>

        {/* Export Report Action (Champagne Gold button) */}
        <button
          onClick={() => alert("Generating full project audit PDF report dossier...")}
          className="btn-gold text-xs shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline font-bold">Export Report</span>
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] hover:bg-[#EDE5D6] transition text-left cursor-pointer shadow-xs"
          >
            <div className="p-1 rounded-lg bg-[#D6B238]/20 text-[#29231D]">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="hidden xl:block">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#6F7889] block leading-none">
                Project
              </span>
              <span className="text-xs font-bold text-[#29231D] leading-tight block truncate max-w-[140px]">
                {currentProject ? currentProject.name : 'Select Site'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6F7889] shrink-0" />
          </button>

          {showProjectMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowProjectMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFDF8] rounded-xl shadow-xl border border-[#E4D8BE] py-2 z-40">
                <div className="px-4 py-2 border-b border-[#E4D8BE] text-[10px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">
                  Switch Active Site
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setShowProjectMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#EDE5D6] flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#29231D]">{proj.name}</p>
                      <p className="text-[11px] text-[#6F7889]">{proj.location}</p>
                    </div>
                    {proj.id === selectedProjectId && (
                      <Check className="w-4 h-4 text-[#727C3E]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] hover:bg-[#EDE5D6] text-[#29231D] relative transition cursor-pointer shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D6B238]"></span>
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#FFFDF8] rounded-xl shadow-xl border border-[#E4D8BE] py-2 z-40">
                <div className="px-4 py-2.5 border-b border-[#E4D8BE] flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#29231D] font-['Outfit']">Audit Notifications</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#D6B238]/20 text-[#29231D] font-bold">2 New</span>
                </div>
                <div className="divide-y divide-[#E4D8BE] max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-[#EDE5D6]/50 transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#29231D]">{n.title}</span>
                        <span className="text-[10px] text-[#6F7889]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#6F7889] mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E4D8BE]">
          <div className="w-9 h-9 rounded-full bg-[#29231D] text-[#D6B238] flex items-center justify-center font-bold text-xs shadow-xs border border-[#D6B238]/50">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#29231D] leading-none">
              {user?.full_name || 'Project Auditor'}
            </p>
            <span className="text-[10px] text-[#6F7889] font-semibold inline-block mt-0.5">
              Riverside Tower Project
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

