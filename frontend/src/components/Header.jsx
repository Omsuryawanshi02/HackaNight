import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Building2, 
  Check, 
  ChevronDown, 
  Plus
} from 'lucide-react';

export default function Header({ 
  onToggleSidebar, 
  projects = [], 
  selectedProjectId, 
  onSelectProject,
  backendConnected,
  onOpenQuickAudit
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const notifications = [
    { id: 1, title: 'Discrepancy Flagged', message: 'Tower B Cement consumption variance is +15.8%', time: '10m ago', unread: true },
    { id: 2, title: 'New Photo Submitted', message: 'Pier 48 North Column Stem de-shuttering photo ready for audit', time: '1h ago', unread: true },
    { id: 3, title: 'Decision Recorded', message: 'Foundation Pile Caps approved by Lead Auditor', time: '3h ago', unread: false }
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#192853]/85 backdrop-blur-xl border-b border-white/8 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-white/15 transition text-left"
          >
            <div className="p-1 rounded-lg bg-blue-500/15 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8b8c8e] block leading-none">
                Active Project
              </span>
              <span className="text-xs font-semibold text-white leading-tight block truncate max-w-[160px] sm:max-w-[220px]">
                {currentProject ? currentProject.name : 'Select Project'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
          </button>

          {showProjectMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowProjectMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#1e3264]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 py-1.5 z-40">
                <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-[#8b8c8e] uppercase tracking-wider">
                  Select Construction Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setShowProjectMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center justify-between transition"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{proj.name}</p>
                      <p className="text-[11px] text-slate-400">{proj.location}</p>
                    </div>
                    {proj.id === selectedProjectId && (
                      <Check className="w-4 h-4 text-[#FFE14F]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions, Backend Status, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <div 
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            backendConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
          title={backendConnected ? 'Connected to live Flask backend at http://127.0.0.1:5000' : 'Running in client demo mode'}
        >
          {backendConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-medium">API: Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-[11px] font-medium">Demo Mode</span>
            </>
          )}
        </div>

        {/* Quick New Audit Button with Fastshot Orange accent */}
        {onOpenQuickAudit && (
          <button
            onClick={onOpenQuickAudit}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 btn-fastshot-primary rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Audit</span>
          </button>
        )}

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 relative transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FFE14F] ring-2 ring-[#192853]"></span>
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#1e3264]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 py-2 z-40">
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Audit Notifications</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFE14F]/20 text-[#FFE14F] font-semibold">2 New</span>
                </div>
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-white/5 transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#9C86CE] to-[#FFE14F] text-slate-900 flex items-center justify-center font-bold text-xs ring-1 ring-white/20">
            PI
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-none">Pooja Iyer</p>
            <span className="text-[10px] text-[#FFE14F] font-medium inline-block mt-0.5">
              Lead Quality Auditor
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
