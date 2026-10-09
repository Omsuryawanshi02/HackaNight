import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Edit2, 
  KeyRound, 
  UserX, 
  UserCheck as UserCheckIcon, 
  Check, 
  Copy, 
  Building2,
  HardHat,
  Layers,
  AlertCircle
} from 'lucide-react';
import { getUsers, createUser, updateUser, toggleUserStatus, resetUserPassword, getProjects } from '../services/api';
import Modal from '../components/Modal';

export default function UserManagement({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Add User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    employee_id: '',
    role: 'Contractor',
    password: '',
    assigned_project_ids: []
  });

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);

  // Temp Password Modal
  const [tempPassModal, setTempPassModal] = useState(null); // { user, password }
  const [copied, setCopied] = useState(false);

  // Fetch users & projects
  const fetchUsersAndProjects = async () => {
    setIsLoading(true);
    const [usersRes, projsRes] = await Promise.all([getUsers(), getProjects()]);
    if (usersRes.success) setUsers(usersRes.data);
    if (projsRes.success) setProjects(projsRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsersAndProjects();
  }, []);

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserData.full_name.trim() || !newUserData.email.trim()) {
      onShowToast?.({ type: 'error', title: 'Validation Error', message: 'Full name and email are required.' });
      return;
    }

    const res = await createUser(newUserData);
    if (res.success) {
      setIsAddUserOpen(false);
      setTempPassModal({
        name: newUserData.full_name,
        email: newUserData.email,
        role: newUserData.role,
        password: res.data.temporary_password
      });
      setNewUserData({
        full_name: '',
        email: '',
        employee_id: '',
        role: 'Contractor',
        password: '',
        assigned_project_ids: []
      });
      fetchUsersAndProjects();
      onShowToast?.({
        type: 'success',
        title: 'Account Provisioned',
        message: `Account created for ${newUserData.full_name}.`
      });
    } else {
      onShowToast?.({
        type: 'error',
        title: 'Creation Failed',
        message: res.error || 'Failed to create user.'
      });
    }
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = await updateUser(editingUser.id, {
      full_name: editingUser.full_name,
      employee_id: editingUser.employee_id,
      role: editingUser.role,
      assigned_project_ids: editingUser.assigned_project_ids
    });

    if (res.success) {
      setEditingUser(null);
      fetchUsersAndProjects();
      onShowToast?.({
        type: 'success',
        title: 'User Updated',
        message: `Updated profile for ${editingUser.full_name}.`
      });
    } else {
      onShowToast?.({
        type: 'error',
        title: 'Update Failed',
        message: res.error || 'Failed to update user.'
      });
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const res = await toggleUserStatus(user.id, newStatus);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      onShowToast?.({
        type: 'info',
        title: 'Status Updated',
        message: `User ${user.full_name} is now ${newStatus ? 'Active' : 'Deactivated'}.`
      });
    } else {
      onShowToast?.({
        type: 'error',
        title: 'Action Failed',
        message: res.error
      });
    }
  };

  const handleResetPassword = async (user) => {
    const res = await resetUserPassword(user.id);
    if (res.success) {
      setTempPassModal({
        name: user.full_name,
        email: user.email,
        role: user.role,
        password: res.data.temporary_password
      });
      onShowToast?.({
        type: 'success',
        title: 'Temporary Password Issued',
        message: `Reset credentials generated for ${user.full_name}.`
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.employee_id && u.employee_id.toLowerCase().includes(q)) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#9C86CE]/15 text-[#9C86CE] border border-[#9C86CE]/30 uppercase tracking-wider">
              Identity & Access Management (IAM)
            </span>
            <span className="text-xs text-[#8b8c8e]">• Supervisor Exclusive</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">Enterprise User Management</h1>
          <p className="text-xs text-[#8b8c8e] mt-1">
            Provision user accounts, assign roles, bind projects, and reset security credentials.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold cursor-pointer shadow-md"
        >
          <UserPlus className="w-4 h-4 stroke-[2.2]" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, employee ID..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
          />
        </div>

        <div className="flex items-center gap-1.5 glass-chip rounded-xl px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#8b8c8e] font-medium">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#1e3264] text-white">All Roles</option>
            <option value="Contractor" className="bg-[#1e3264] text-white">Contractors</option>
            <option value="Shopkeeper" className="bg-[#1e3264] text-white">Shopkeepers</option>
            <option value="Auditor" className="bg-[#1e3264] text-white">Auditors</option>
            <option value="Main Supervisor" className="bg-[#1e3264] text-white">Main Supervisors</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#c8c8cb]">
            <thead className="bg-white/3 border-b border-white/6 text-[#8b8c8e] uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3.5">User & ID</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Employee ID</th>
                <th className="px-4 py-3.5">Assigned Projects</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading user registry...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No users match active criteria.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  let roleBadgeClass = 'bg-white/6 text-slate-300 border-white/10';
                  if (u.role === 'Main Supervisor') roleBadgeClass = 'bg-purple-500/15 text-[#9C86CE] border-purple-500/30';
                  else if (u.role === 'Contractor') roleBadgeClass = 'bg-[#FFE14F]/15 text-[#FFE14F] border-[#FFE14F]/30';
                  else if (u.role === 'Shopkeeper') roleBadgeClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                  else if (u.role === 'Auditor') roleBadgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

                  return (
                    <tr key={u.id} className="hover:bg-white/4 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-[11px] text-[#8b8c8e] font-mono">{u.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {u.employee_id || '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        {u.role === 'Main Supervisor' ? (
                          <span className="text-[11px] text-[#9C86CE] font-medium">All Projects (Global)</span>
                        ) : u.assigned_projects && u.assigned_projects.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {u.assigned_projects.map(p => (
                              <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-slate-300">
                                {p.name.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No assigned projects</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{u.is_active ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[#8b8c8e] text-[11px]">
                        {u.last_login ? u.last_login.split(' UTC')[0] : 'Never'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setEditingUser({
                              ...u,
                              assigned_project_ids: u.assigned_projects ? u.assigned_projects.map(p => p.id) : []
                            })}
                            className="p-1.5 rounded-lg hover:bg-white/8 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 rounded-lg hover:bg-white/8 text-slate-300 hover:text-[#FFE14F] transition cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg hover:bg-white/8 transition cursor-pointer ${u.is_active ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                            title={u.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheckIcon className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Provision New Enterprise Account"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newUserData.full_name}
                onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                placeholder="e.g. Er. Rajesh Sharma"
                className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="contractor@buildverify.ai"
                className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Employee / Vendor ID</label>
              <input
                type="text"
                value={newUserData.employee_id}
                onChange={(e) => setNewUserData({ ...newUserData, employee_id: e.target.value })}
                placeholder="EMP-CON-05"
                className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Role Assignment *</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#1e3264] border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F] cursor-pointer"
              >
                <option value="Contractor" className="bg-[#1e3264] text-white">Contractor</option>
                <option value="Shopkeeper" className="bg-[#1e3264] text-white">Shopkeeper / Store In-Charge</option>
                <option value="Auditor" className="bg-[#1e3264] text-white">Auditor (Quality & Civil PE)</option>
                <option value="Main Supervisor" className="bg-[#1e3264] text-white">Main Supervisor (Administrator)</option>
              </select>
            </div>
          </div>

          {/* Project Assignments */}
          {newUserData.role !== 'Main Supervisor' && (
            <div>
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1.5">
                Assign Projects (User will only access selected sites)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-white/2 rounded-xl border border-white/6">
                {projects.map((p) => {
                  const isChecked = newUserData.assigned_project_ids.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/4 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewUserData({ ...newUserData, assigned_project_ids: [...newUserData.assigned_project_ids, p.id] });
                          } else {
                            setNewUserData({ ...newUserData, assigned_project_ids: newUserData.assigned_project_ids.filter(id => id !== p.id) });
                          }
                        }}
                        className="rounded bg-white/5 border-white/20 text-[#FFE14F] accent-[#FFE14F]"
                      />
                      <span className="text-white truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">
              Temporary Password (leave blank to auto-generate)
            </label>
            <input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              placeholder="Leave blank for secure auto-generation"
              className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 btn-fastshot-primary text-[#192853] font-semibold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Provision Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.full_name}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Email (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 text-xs bg-white/2 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Employee ID</label>
                <input
                  type="text"
                  value={editingUser.employee_id || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, employee_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Assigned Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#1e3264] border border-white/8 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="Contractor" className="bg-[#1e3264] text-white">Contractor</option>
                  <option value="Shopkeeper" className="bg-[#1e3264] text-white">Shopkeeper</option>
                  <option value="Auditor" className="bg-[#1e3264] text-white">Auditor</option>
                  <option value="Main Supervisor" className="bg-[#1e3264] text-white">Main Supervisor</option>
                </select>
              </div>
            </div>

            {editingUser.role !== 'Main Supervisor' && (
              <div>
                <label className="block text-xs font-semibold text-[#c8c8cb] mb-1.5">Project Assignments</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-white/2 rounded-xl border border-white/6">
                  {projects.map((p) => {
                    const isChecked = editingUser.assigned_project_ids && editingUser.assigned_project_ids.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/4 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = editingUser.assigned_project_ids || [];
                            if (e.target.checked) {
                              setEditingUser({ ...editingUser, assigned_project_ids: [...cur, p.id] });
                            } else {
                              setEditingUser({ ...editingUser, assigned_project_ids: cur.filter(id => id !== p.id) });
                            }
                          }}
                          className="rounded bg-white/5 border-white/20 text-[#FFE14F] accent-[#FFE14F]"
                        />
                        <span className="text-white truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-fastshot-primary text-[#192853] font-semibold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Generated Temporary Credentials Modal */}
      {tempPassModal && (
        <Modal
          isOpen={!!tempPassModal}
          onClose={() => setTempPassModal(null)}
          title="Generated Account Credentials"
          maxWidth="max-w-md"
          footer={
            <button
              onClick={() => setTempPassModal(null)}
              className="px-4 py-2 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          }
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
              <p className="font-bold">Credentials provisioned successfully!</p>
              <p className="text-[11px] mt-0.5 text-emerald-200/80">
                Provide these credentials to the user. They will be required to choose a private password on first login.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8b8c8e]">User:</span>
                <span className="text-white font-bold">{tempPassModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b8c8e]">Email:</span>
                <span className="text-white font-mono">{tempPassModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b8c8e]">Role:</span>
                <span className="text-[#FFE14F] font-semibold">{tempPassModal.role}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/6">
                <span className="text-[#8b8c8e]">Temporary Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-mono font-bold bg-white/8 px-2 py-0.5 rounded">
                    {tempPassModal.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tempPassModal.password)}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 cursor-pointer"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
