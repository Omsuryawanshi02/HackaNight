import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  Calendar,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  HardHat,
  Package,
  UserCheck,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/api';
import Modal from '../components/Modal';

export default function Profile({ onShowToast, projects = [], backendConnected }) {
  const { user, setUser, role } = useAuth();

  // Modal & Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '+1 (555) 234-5678',
    designation: user?.designation || (
      role === 'SITE_SUPERVISOR' || role === 'Main Supervisor' ? 'Senior Site Engineer' :
        role === 'STORE_INCHARGE' || role === 'Shopkeeper' ? 'Materials & Inventory Officer' :
          role === 'AUDIT_MANAGER' || role === 'Auditor' ? 'Lead Structural Quality Auditor' :
            'System Security & Infrastructure Administrator'
    ),
    department: user?.department || (
      role === 'SITE_SUPERVISOR' || role === 'Main Supervisor' ? 'Field Engineering & Construction' :
        role === 'STORE_INCHARGE' || role === 'Shopkeeper' ? 'Store & Material Logistics' :
          role === 'AUDIT_MANAGER' || role === 'Auditor' ? 'Quality Assurance & Compliance' :
            'IT & Enterprise Administration'
    )
  });

  const [formErrors, setFormErrors] = useState({});

  if (!user) {
    return (
      <div className="p-8 text-center bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE]">
        <AlertTriangle className="w-8 h-8 text-[#D6B238] mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">Profile Unavailable</h3>
        <p className="text-xs text-[#6F7889] mt-1">Unable to load user authentication session.</p>
      </div>
    );
  }

  // Role Normalize Helper
  const normalizedRole = (() => {
    const r = (user.role || role || '').toUpperCase().replace(/\s+/g, '_');
    if (r.includes('SUPERVISOR') || r.includes('CONTRACTOR')) return 'SITE_SUPERVISOR';
    if (r.includes('STORE') || r.includes('SHOPKEEPER')) return 'STORE_INCHARGE';
    if (r.includes('AUDIT')) return 'AUDIT_MANAGER';
    if (r.includes('ADMIN')) return 'ADMIN';
    return 'SITE_SUPERVISOR';
  })();

  const roleMeta = {
    SITE_SUPERVISOR: {
      label: 'Site Supervisor',
      badgeColor: 'bg-[#D6B238]/20 text-[#29231D] border-[#D6B238]/40',
      icon: HardHat,
      desc: 'Authorized to capture site progress, log photo evidence, and track field milestones.'
    },
    STORE_INCHARGE: {
      label: 'Store In-Charge',
      badgeColor: 'bg-[#727C3E]/20 text-[#727C3E] border-[#727C3E]/40',
      icon: Package,
      desc: 'Authorized to reconcile delivery challans, manage stock ledgers, and log material drawdowns.'
    },
    AUDIT_MANAGER: {
      label: 'Audit Manager',
      badgeColor: 'bg-[#29231D]/15 text-[#29231D] border-[#29231D]/30',
      icon: UserCheck,
      desc: 'Authorized to review visual photo evidence, sign off milestone clearances, and issue audit certificates.'
    },
    ADMIN: {
      label: 'Administrator',
      badgeColor: 'bg-purple-500/15 text-purple-800 border-purple-500/30',
      icon: Shield,
      desc: 'Full system administration, user role assignment, security audit logs, and organization governance.'
    }
  }[normalizedRole];

  // Assigned Projects Mapper
  const assignedProjects = projects.filter(p =>
    !user.assigned_project_ids ||
    user.assigned_project_ids.includes(p.id) ||
    user.assigned_project_ids.length === 0
  );

  const handleOpenEditModal = () => {
    setFormData({
      full_name: user.full_name || '',
      phone: user.phone || '+1 (555) 234-5678',
      designation: user.designation || (
        normalizedRole === 'SITE_SUPERVISOR' ? 'Senior Site Engineer' :
          normalizedRole === 'STORE_INCHARGE' ? 'Materials & Inventory Officer' :
            normalizedRole === 'AUDIT_MANAGER' ? 'Lead Structural Quality Auditor' :
              'System Infrastructure Administrator'
      ),
      department: user.department || (
        normalizedRole === 'SITE_SUPERVISOR' ? 'Field Engineering & Construction' :
          normalizedRole === 'STORE_INCHARGE' ? 'Store & Material Logistics' :
            normalizedRole === 'AUDIT_MANAGER' ? 'Quality Assurance & Compliance' :
              'IT & Enterprise Administration'
      )
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (backendConnected && user.id) {
        await updateUser(user.id, formData);
      }

      const updatedUser = {
        ...user,
        ...formData
      };

      setUser(updatedUser);
      localStorage.setItem('PRAMAAN_cached_user', JSON.stringify(updatedUser));

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your account profile details have been saved successfully.'
        });
      }
      setIsEditModalOpen(false);
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Update Failed',
          message: err.message || 'Failed to save profile changes.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const RoleIcon = roleMeta.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header & Breadcrumb */}
      <div>
        <nav className="text-xs text-[#6F7889] font-semibold mb-1 flex items-center gap-1.5">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-[#29231D] font-bold">Profile</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#29231D] font-['Outfit']">My Profile</h1>
            <p className="text-xs text-[#6F7889] font-medium mt-0.5">
              View and manage your account information, role authorizations, and project memberships.
            </p>
          </div>
          <button
            onClick={handleOpenEditModal}
            className="btn-gold text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Main Profile Summary Card */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Initials Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-[#29231D] text-[#D6B238] flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#D6B238]/60 shrink-0">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-[#29231D] font-['Outfit']">
                  {user.full_name || 'User Profile'}
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeColor}`}>
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#6F7889] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D6B238]" />
                <span>{user.email || 'Not provided'}</span>
              </p>
              <p className="text-xs text-[#6F7889] font-medium pt-0.5">
                {roleMeta.desc}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4D8BE] w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#727C3E]/15 text-[#727C3E] border border-[#727C3E]/30 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{user.is_active !== false ? 'Active Account' : 'Inactive'}</span>
            </div>
            <span className="text-[10px] text-[#6F7889] font-semibold">
              Employee ID: <strong className="text-[#29231D]">{user.employee_id || `EMP-${new Date().getFullYear()}-01`}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Personal Info & Account Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Information & Department */}
        <div className="lg:col-span-6 bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4D8BE]">
            <div className="p-2 rounded-xl bg-[#D6B238]/20 text-[#29231D]">
              <User className="w-4.5 h-4.5 text-[#8f7215]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">Personal Details</h3>
              <p className="text-[11px] text-[#6F7889]">Contact and organizational classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Full Name</span>
              <span className="font-bold text-[#29231D] block">{user.full_name || 'Not provided'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Email Address</span>
              <span className="font-bold text-[#29231D] block truncate">{user.email || 'Not provided'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Phone Number</span>
              <span className="font-bold text-[#29231D] block">{formData.phone || 'Not provided'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Designation</span>
              <span className="font-bold text-[#29231D] block">{formData.designation || 'Not provided'}</span>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Department</span>
              <span className="font-bold text-[#29231D] block">{formData.department || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Account & Security Metadata */}
        <div className="lg:col-span-6 bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4D8BE]">
            <div className="p-2 rounded-xl bg-[#727C3E]/20 text-[#727C3E]">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">Account Security & Governance</h3>
              <p className="text-[11px] text-[#6F7889]">Access control and system privileges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Role Type</span>
              <span className="font-bold text-[#29231D] block">{roleMeta.label}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Employee ID</span>
              <span className="font-bold text-[#29231D] block">{user.employee_id || `EMP-${new Date().getFullYear()}-01`}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Account Status</span>
              <span className="font-bold text-[#727C3E] block">Active / Verified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Created Date</span>
              <span className="font-bold text-[#29231D] block">
                {user.created_at ? (
                  new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                ) : (
                  new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                )}
              </span>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#F7F3EA]/60 border border-[#E4D8BE]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Auth Standard</span>
              <span className="font-bold text-[#29231D] block">Bearer JWT Authentication & RBAC Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Information Section */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4D8BE]">
          <div className="p-2 rounded-xl bg-[#29231D] text-[#D6B238]">
            <RoleIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">
              Role Scope & Assigned Workspaces ({roleMeta.label})
            </h3>
            <p className="text-[11px] text-[#6F7889]">Authorized projects and functional domain clearance</p>
          </div>
        </div>

        {normalizedRole === 'ADMIN' ? (
          <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#29231D]">
              <Shield className="w-4 h-4 text-[#D6B238]" />
              <span>Full System Administration Clearance</span>
            </div>
            <p className="text-[#6F7889]">
              As an Administrator, you hold full platform governance across all active construction projects, user role assignments, system audit logs, and security policy management.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">
              Authorized Site Memberships ({assignedProjects.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignedProjects.length === 0 ? (
                <div className="col-span-3 p-4 text-center text-xs text-[#6F7889]">
                  No specific projects assigned.
                </div>
              ) : (
                assignedProjects.map(proj => (
                  <div key={proj.id} className="p-4 rounded-xl border border-[#E4D8BE] bg-[#FFFDF8] hover:border-[#D6B238] transition space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D6B238]/20 text-[#29231D]">
                        {proj.id}
                      </span>
                      <span className="text-[10px] font-bold text-[#727C3E]">{proj.status}</span>
                    </div>
                    <h5 className="text-xs font-bold text-[#29231D] font-['Outfit']">{proj.name}</h5>
                    <p className="text-[11px] text-[#6F7889]">{proj.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#29231D] mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              placeholder="e.g. Rajesh Varma"
            />
            {formErrors.full_name && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{formErrors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29231D] mb-1">Email (Read Only)</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full bg-[#EDE5D6]/60 border border-[#E4D8BE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#6F7889] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29231D] mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              placeholder="+1 (555) 234-5678"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29231D] mb-1">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              placeholder="e.g. Senior Quality Auditor"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29231D] mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              placeholder="e.g. Quality Assurance & Compliance"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4D8BE]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary-sandstone text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold text-xs px-5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
