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
  ShieldCheck,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateAuditPdfDossier } from '../utils/pdfGenerator';

export default function Header({
  onToggleSidebar,
  projects = [],
  selectedProjectId,
  onSelectProject,
  backendConnected,
  onOpenQuickAudit,
  onOpenProfile,
  onDateRangeChange
}) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHeaderProfileMenu, setShowHeaderProfileMenu] = useState(false);
  const [startDate, setStartDate] = useState('2026-10-09');
  const [endDate, setEndDate] = useState('2026-11-09');
  const [selectedPreset, setSelectedPreset] = useState('30days');

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const formatDateRangeLabel = (startStr, endStr) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
      const sDay = String(s.getDate()).padStart(2, '0');
      const sYear = s.getFullYear();
      const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
      const eDay = String(e.getDate()).padStart(2, '0');
      const eYear = e.getFullYear();
      return `${sMonth} ${sDay}, ${sYear} - ${eMonth} ${eDay}, ${eYear}`;
    } catch (err) {
      return `${startStr} - ${endStr}`;
    }
  };

  const handleApplyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    const anchorDate = new Date('2026-11-09');
    let s = new Date(anchorDate);

    if (presetKey === '7days') {
      s.setDate(anchorDate.getDate() - 7);
    } else if (presetKey === '30days') {
      s.setDate(anchorDate.getDate() - 30);
    } else if (presetKey === 'thisMonth') {
      s = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    } else if (presetKey === 'quarter') {
      s.setMonth(anchorDate.getMonth() - 3);
    }

    const formatYMD = (d) => d.toISOString().split('T')[0];
    const newStart = formatYMD(s);
    const newEnd = formatYMD(anchorDate);
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleApplyDateFilter = () => {
    setShowDatePicker(false);
    onDateRangeChange?.({ startDate, endDate, label: formatDateRangeLabel(startDate, endDate) });
  };

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
        {/* Interactive Calendar Date Range Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#EDE5D6] border border-[#E4D8BE] text-xs font-bold text-[#29231D] shadow-xs cursor-pointer transition"
            title="Filter Audit Data by Date Range"
          >
            <Calendar className="w-4 h-4 text-[#D6B238]" />
            <span>{formatDateRangeLabel(startDate, endDate)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6F7889] shrink-0 ml-0.5" />
          </button>

          {/* Date Range Selector Dropdown Modal */}
          {showDatePicker && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowDatePicker(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#FFFDF8] rounded-2xl shadow-xl border border-[#E4D8BE] p-4 z-40 space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#E4D8BE]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D6B238]" />
                    <h4 className="text-xs font-bold text-[#29231D] font-['Outfit']">Audit Date Range Filter</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D6B238]/20 text-[#29231D]">
                    {selectedPreset === 'custom' ? 'Custom' : 'Preset Filter'}
                  </span>
                </div>

                {/* Quick Range Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Quick Presets</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { key: '7days', label: 'Last 7 Days' },
                      { key: '30days', label: 'Last 30 Days' },
                      { key: 'thisMonth', label: 'This Month' },
                      { key: 'quarter', label: 'Quarter to Date' }
                    ].map(preset => (
                      <button
                        key={preset.key}
                        onClick={() => handleApplyPreset(preset.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedPreset === preset.key
                          ? 'bg-[#D6B238] text-[#29231D] shadow-xs'
                          : 'bg-[#F7F3EA] text-[#6F7889] hover:text-[#29231D] hover:bg-[#EDE5D6]'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Selectors */}
                <div className="space-y-2 pt-2 border-t border-[#E4D8BE]">
                  <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Custom Date Range</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#29231D] block mb-1">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setSelectedPreset('custom');
                        }}
                        className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-lg px-2 py-1 text-xs font-medium text-[#29231D] focus:outline-none focus:border-[#D6B238]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#29231D] block mb-1">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setSelectedPreset('custom');
                        }}
                        className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-lg px-2 py-1 text-xs font-medium text-[#29231D] focus:outline-none focus:border-[#D6B238]"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4D8BE]">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6F7889] hover:bg-[#EDE5D6] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyDateFilter}
                    className="btn-gold text-xs px-4 py-1.5 rounded-lg font-bold shadow-xs cursor-pointer"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Export Report Action (Champagne Gold button) */}
        <button
          onClick={() => {
            generateAuditPdfDossier({
              id: `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
              title: `${currentProject ? currentProject.name : 'Project'} Executive Audit Dossier`,
              project: currentProject ? `${currentProject.name} (${currentProject.location})` : 'PRAMAAN Active Site',
              generatedDate: new Date().toISOString().split('T')[0],
              auditor: user?.full_name ? `${user.full_name}, ${user.role || 'Auditor'}` : 'Pooja Iyer, Lead Quality Auditor',
              verdict: 'APPROVED FOR BILLING',
              keyFindings: [
                'All physical concrete cube compressive tests verified against BIS specifications.',
                'Rebar placement and spacing verified via AI vision inspection model.',
                'Material reconciliation statement reconciled with gate entry register.'
              ],
              reconciliationData: {
                material: 'Structural Reinforcement TMT Steel & Cement',
                challanQty: '150 M.T.',
                receivedQty: '148 M.T.',
                consumedRecorded: '142 M.T.',
                consumedPhysical: '144 M.T.',
                variance: '+2.0 M.T. (1.4% Conforming)'
              }
            });
          }}
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

        {/* User Profile Avatar with Dropdown */}
        <div className="relative border-l border-[#E4D8BE] pl-2">
          <button
            onClick={() => setShowHeaderProfileMenu(!showHeaderProfileMenu)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition text-left group"
            title="Account Options & Logout"
          >
            <div className="w-9 h-9 rounded-full bg-[#29231D] text-[#D6B238] flex items-center justify-center font-bold text-xs shadow-xs border border-[#D6B238]/50 group-hover:scale-105 transition">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-[#29231D] leading-none">
                {user?.full_name || 'Project Auditor'}
              </p>
              <span className="text-[10px] text-[#6F7889] font-semibold inline-block mt-0.5">
                {user?.role || 'Authenticated Role'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#6F7889] transition-transform duration-200 ${showHeaderProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {showHeaderProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowHeaderProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#FFFDF8] rounded-2xl shadow-xl border border-[#E4D8BE] py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-[#E4D8BE]">
                  <p className="text-xs font-bold text-[#29231D] truncate">{user?.full_name || 'User Account'}</p>
                  <p className="text-[10px] text-[#6F7889] truncate">{user?.email || 'authenticated@PRAMAAN.ai'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowHeaderProfileMenu(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#EDE5D6] text-xs font-bold text-[#29231D] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#D6B238]" />
                  View My Profile
                </button>
                <button
                  onClick={() => {
                    setShowHeaderProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-rose-500/15 text-xs font-bold text-rose-600 flex items-center gap-2.5 transition cursor-pointer border-t border-[#E4D8BE]"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

