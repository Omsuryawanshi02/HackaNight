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
    <div className="space-y-6 font-sans text-[#29231D]">
      {/* Top Banner */}
      <div className="porcelain-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider font-['Outfit']">
              Identity & Access Management (IAM)
            </span>
            <span className="text-xs text-[#6F7889] font-medium">• Supervisor Exclusive</span>
          </div>
          <h1 className="text-2xl font-black text-[#29231D] mt-1.5 tracking-tight font-['Outfit']">Enterprise User Management</h1>
          <p className="text-xs text-[#6F7889] font-medium mt-1">
            Provision user accounts, assign roles, bind projects, and reset security credentials.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-gold text-[#29231D] rounded-xl text-xs font-bold cursor-pointer shadow-md"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="porcelain-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6F7889] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, employee ID..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#EDE5D6] border border-[#E4D8BE] rounded-xl px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#6F7889]" />
          <span className="text-[#6F7889] font-bold">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-[#29231D] font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#FFFDF8] text-[#29231D]">All Roles</option>
            <option value="Contractor" className="bg-[#FFFDF8] text-[#29231D]">Contractors</option>
            <option value="Shopkeeper" className="bg-[#FFFDF8] text-[#29231D]">Shopkeepers</option>
            <option value="Auditor" className="bg-[#FFFDF8] text-[#29231D]">Auditors</option>
            <option value="Main Supervisor" className="bg-[#FFFDF8] text-[#29231D]">Main Supervisors</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="porcelain-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#29231D]">
            <thead className="bg-[#EDE5D6] border-b border-[#E4D8BE] text-[#6F7889] uppercase text-[10px] font-['Outfit'] font-bold">
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
            <tbody className="divide-y divide-[#E4D8BE]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6F7889]">Loading user registry...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6F7889]">No users match active criteria.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  let roleBadgeClass = 'bg-[#EDE5D6] text-[#29231D] border-[#E4D8BE]';
                  if (u.role === 'Main Supervisor') roleBadgeClass = 'bg-purple-100 text-purple-900 border-purple-300';
                  else if (u.role === 'Contractor') roleBadgeClass = 'bg-[#D6B238]/20 text-[#29231D] border-[#D6B238]/40';
                  else if (u.role === 'Shopkeeper') roleBadgeClass = 'bg-cyan-100 text-cyan-900 border-cyan-300';
                  else if (u.role === 'Auditor') roleBadgeClass = 'bg-[#727C3E]/20 text-[#727C3E] border-[#727C3E]/30';

                  return (
                    <tr key={u.id} className="hover:bg-[#EDE5D6]/40 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#29231D]">{u.full_name}</div>
                        <div className="text-[11px] text-[#6F7889] font-mono">{u.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[#29231D] font-semibold">
                        {u.employee_id || '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        {u.role === 'Main Supervisor' ? (
                          <span className="text-[11px] text-[#8f7215] font-bold">All Projects (Global)</span>
                        ) : u.assigned_projects && u.assigned_projects.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {u.assigned_projects.map(p => (
                              <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[#EDE5D6] border border-[#E4D8BE] text-[#29231D] font-semibold">
                                {p.name.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#6F7889] italic">No assigned projects</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.is_active ? 'text-[#727C3E]' : 'text-rose-600'}`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-[#727C3E]' : 'bg-rose-600'}`} />
                          <span>{u.is_active ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[#6F7889] text-[11px] font-medium">
                        {u.last_login ? u.last_login.split(' UTC')[0] : 'Never'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setEditingUser({
                              ...u,
                              assigned_project_ids: u.assigned_projects ? u.assigned_projects.map(p => p.id) : []
                            })}
                            className="p-1.5 rounded-lg hover:bg-[#EDE5D6] text-[#29231D] transition cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 rounded-lg hover:bg-[#EDE5D6] text-[#8f7215] transition cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg hover:bg-[#EDE5D6] transition cursor-pointer ${u.is_active ? 'text-rose-600' : 'text-[#727C3E]'}`}
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
        <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-[#29231D]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newUserData.full_name}
                onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                placeholder="e.g. Er. Rajesh Sharma"
                className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="contractor@buildverify.ai"
                className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1">Employee / Vendor ID</label>
              <input
                type="text"
                value={newUserData.employee_id}
                onChange={(e) => setNewUserData({ ...newUserData, employee_id: e.target.value })}
                placeholder="EMP-CON-05"
                className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1">Role Assignment *</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238] cursor-pointer"
              >
                <option value="Contractor">Contractor</option>
                <option value="Shopkeeper">Shopkeeper / Store In-Charge</option>
                <option value="Auditor">Auditor (Quality & Civil PE)</option>
                <option value="Main Supervisor">Main Supervisor (Administrator)</option>
              </select>
            </div>
          </div>

          {/* Project Assignments */}
          {newUserData.role !== 'Main Supervisor' && (
            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1.5">
                Assign Projects (User will only access selected sites)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#EDE5D6]/30 rounded-xl border border-[#E4D8BE]">
                {projects.map((p) => {
                  const isChecked = newUserData.assigned_project_ids.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EDE5D6] cursor-pointer text-xs">
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
                        className="rounded border-[#E4D8BE] text-[#D6B238] accent-[#D6B238]"
                      />
                      <span className="text-[#29231D] font-medium truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#6F7889] mb-1">
              Temporary Password (leave blank to auto-generate)
            </label>
            <input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              placeholder="Leave blank for secure auto-generation"
              className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 btn-secondary-sandstone text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 btn-gold text-[#29231D] font-bold text-xs rounded-xl shadow-md cursor-pointer"
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
          <form onSubmit={handleUpdateUserSubmit} className="space-y-4 text-[#29231D]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Email (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 text-xs bg-[#EDE5D6] border border-[#E4D8BE] rounded-xl text-[#6F7889] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Employee ID</label>
                <input
                  type="text"
                  value={editingUser.employee_id || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, employee_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1">Assigned Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none cursor-pointer"
                >
                  <option value="Contractor">Contractor</option>
                  <option value="Shopkeeper">Shopkeeper</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Main Supervisor">Main Supervisor</option>
                </select>
              </div>
            </div>

            {editingUser.role !== 'Main Supervisor' && (
              <div>
                <label className="block text-xs font-semibold text-[#6F7889] mb-1.5">Project Assignments</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#EDE5D6]/30 rounded-xl border border-[#E4D8BE]">
                  {projects.map((p) => {
                    const isChecked = editingUser.assigned_project_ids && editingUser.assigned_project_ids.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EDE5D6] cursor-pointer text-xs">
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
                          className="rounded border-[#E4D8BE] text-[#D6B238] accent-[#D6B238]"
                        />
                        <span className="text-[#29231D] font-medium truncate">{p.name}</span>
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
                className="px-4 py-2 btn-secondary-sandstone text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-gold text-[#29231D] font-bold text-xs rounded-xl shadow-md cursor-pointer"
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
              className="px-4 py-2 btn-gold text-[#29231D] rounded-xl text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          }
        >
          <div className="space-y-4 text-[#29231D]">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <p className="font-bold">Credentials provisioned successfully!</p>
              <p className="text-[11px] mt-0.5 text-emerald-800">
                Provide these credentials to the user. They will be required to choose a private password on first login.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#EDE5D6]/40 border border-[#E4D8BE] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6F7889]">User:</span>
                <span className="text-[#29231D] font-bold">{tempPassModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7889]">Email:</span>
                <span className="text-[#29231D] font-mono font-bold">{tempPassModal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7889]">Role:</span>
                <span className="text-[#8f7215] font-bold">{tempPassModal.role}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E4D8BE]">
                <span className="text-[#6F7889]">Temporary Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#29231D] font-mono font-bold bg-[#EDE5D6] px-2 py-0.5 rounded border border-[#E4D8BE]">
                    {tempPassModal.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tempPassModal.password)}
                    className="p-1 rounded hover:bg-[#EDE5D6] text-[#29231D] cursor-pointer"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
