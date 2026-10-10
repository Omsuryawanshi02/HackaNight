import React, { useState } from 'react';
<<<<<<< HEAD
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Info,
  Building2
=======
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  HardHat, 
  Layers, 
  ArrowRight,
  Sparkles,
  KeyRound,
  Info,
  Building2,
  Package
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

<<<<<<< HEAD
export default function Login({ onBackToLanding }) {
=======
// 4 Master Roles matching specifications
const DEMO_ROLE_PRESETS = [
  {
    role: 'SITE_SUPERVISOR',
    title: 'Site Supervisor',
    email: 'supervisor@sitesure.ai',
    password: 'Supervisor@2026!',
    badge: 'Live Site Capture',
    desc: 'Captures location-stamped site photos, submits milestone claims, and tracks evidence requests.',
    icon: HardHat
  },
  {
    role: 'STORE_INCHARGE',
    title: 'Store In-Charge',
    email: 'store@sitesure.ai',
    password: 'Store@2026!',
    badge: 'Material Audit & OCR',
    desc: 'Registers delivery challans, uploads OCR tickets, records opening and closing physical stock.',
    icon: Package
  },
  {
    role: 'AUDIT_MANAGER',
    title: 'Audit Manager',
    email: 'auditor@sitesure.ai',
    password: 'Auditor@2026!',
    badge: 'Clearance & Gate Check',
    desc: 'Reviews AI vision findings, audits inventory variance, and signs milestone clearance certificates.',
    icon: UserCheck
  },
  {
    role: 'ADMIN',
    title: 'System Admin',
    email: 'admin@sitesure.ai',
    password: 'Admin@2026!',
    badge: 'Governance & Audit Log',
    desc: 'Manages user accounts, assigns RBAC roles, configures site boundaries, and inspects audit logs.',
    icon: ShieldCheck
  }
];

export default function Login() {
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  const { login, changePassword, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // First-time change password modal
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassError, setChangePassError] = useState('');

<<<<<<< HEAD
=======
  const handleSelectPreset = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setErrorMessage('');
  };

>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    } else if (res.user && res.user.must_change_password) {
      setIsChangePassModalOpen(true);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess('If an active account exists with that email, reset instructions have been forwarded to your supervisor or registered inbox.');
  };

  const handleFirstTimeChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setChangePassError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePassError('Passwords do not match.');
      return;
    }

    setChangePassError('');
    const res = await changePassword('', newPassword);
    if (res.success) {
      setIsChangePassModalOpen(false);
    } else {
      setChangePassError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-[#29231D] relative overflow-hidden">
<<<<<<< HEAD
      {/* Back to Public Landing Page Link */}
      {onBackToLanding && (
        <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-20">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6F7889] hover:text-[#29231D] transition cursor-pointer px-3 py-1.5 rounded-lg bg-[#FFFDF8]/80 border border-[#E4D8BE]"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Back to Public Overview</span>
          </button>
        </div>
      )}

=======
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
      <div className="w-full max-w-4xl relative z-10 space-y-8 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B238] flex items-center justify-center text-[#29231D] shadow-md font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
<<<<<<< HEAD
                <span className="font-extrabold text-2xl tracking-tight text-[#29231D] font-['Outfit']">PRAMAAN</span>
=======
                <span className="font-extrabold text-2xl tracking-tight text-[#29231D] font-['Outfit']">SITESURE</span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#D6B238] text-[#29231D]">AI</span>
              </div>
              <p className="text-[11px] text-[#6F7889] font-semibold tracking-tight mt-0.5">
                Construction Progress Verification & Material Audit Platform
              </p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#29231D] tracking-tight mt-2 font-['Outfit']">
            Sign In to Your Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#6F7889] max-w-md mx-auto">
            Strict role-based access control. Sign in with your assigned account.
          </p>
        </div>

<<<<<<< HEAD
=======
        {/* 4 Role Cards / Quick Credential Selectors */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-[#6F7889] uppercase tracking-wider flex items-center gap-1.5 font-['Outfit']">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B238]" />
              <span>Select Role Account to Evaluate</span>
            </span>
            <span className="text-[11px] text-[#6F7889] hidden sm:inline">
              FastAPI backend cryptographically validates permissions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_ROLE_PRESETS.map((p) => {
              const Icon = p.icon;
              const isSelected = email === p.email;
              return (
                <div
                  key={p.role}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between porcelain-card ${
                    isSelected 
                      ? 'border-[#D6B238] ring-2 ring-[#D6B238]/40 -translate-y-1' 
                      : 'hover:border-[#D6B238]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-[#D6B238]/20 text-[#29231D]">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE5D6] text-[#29231D] border border-[#E4D8BE]">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#29231D] font-['Outfit']">{p.title}</h3>
                    <p className="text-[10px] text-[#6F7889] font-semibold">{p.role}</p>
                    <p className="text-[11px] text-[#6F7889] mt-2 line-clamp-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E4D8BE] flex items-center justify-between text-[11px]">
                    <span className="text-[#6F7889] font-mono truncate max-w-[120px]">{p.email}</span>
                    <span className={`font-bold text-xs flex items-center gap-0.5 ${isSelected ? 'text-[#8f7215]' : 'text-[#6F7889]'}`}>
                      Select <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
        {/* Login Form Card */}
        <div className="porcelain-card p-6 sm:p-8 max-w-lg mx-auto shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message Alert */}
            {(errorMessage || authError) && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage || authError}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#6F7889] mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6F7889] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                  placeholder="name@PRAMAAN.ai"
=======
                  placeholder="name@sitesure.ai"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#6F7889]">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSuccess('');
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#8f7215] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F7889] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#6F7889] hover:text-[#29231D] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E4D8BE] text-[#D6B238] accent-[#D6B238] cursor-pointer"
                />
                <span className="text-xs text-[#6F7889] font-medium">Remember this browser</span>
              </label>

              <span className="text-[11px] text-[#727C3E] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#727C3E]" />
                <span>JWT RBAC Enforced</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 btn-gold text-[#29231D] font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#29231D] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
<<<<<<< HEAD
                  <span>Sign In to PRAMAAN AI</span>
=======
                  <span>Sign In to SiteSure AI</span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Access Policy Notice */}
        <div className="text-center text-xs text-[#6F7889] max-w-lg mx-auto flex items-center justify-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#D6B238]" />
          <span>Only authorized personnel provisioned by the Administrator may access this platform.</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Password"
        maxWidth="max-w-md"
        footer={
          <button
            onClick={() => setIsForgotModalOpen(false)}
            className="px-4 py-2 btn-secondary-sandstone text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        }
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <p className="text-xs text-[#6F7889] leading-relaxed">
            Enter your registered employee email. Your System Administrator will provision a secure temporary password reset ticket.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#6F7889] mb-1">Registered Email</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
<<<<<<< HEAD
              placeholder="e.g. supervisor@PRAMAAN.ai"
=======
              placeholder="e.g. supervisor@sitesure.ai"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
            />
          </div>

          {forgotSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {!forgotSuccess && (
            <button
              type="submit"
              className="w-full py-2.5 px-4 btn-gold text-[#29231D] font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Request Password Reset
            </button>
          )}
        </form>
      </Modal>

      {/* First-time Change Password Mandatory Modal */}
      <Modal
        isOpen={isChangePassModalOpen}
<<<<<<< HEAD
        onClose={() => { }}
=======
        onClose={() => {}}
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
        title="First-Time Login: Set Your New Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFirstTimeChangePassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Your account was provisioned with a temporary password. You must set a private password before accessing your workspace.
            </span>
          </div>

          {changePassError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{changePassError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#6F7889] mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter secure new password"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6F7889] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] focus:outline-none focus:border-[#D6B238]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 btn-gold text-[#29231D] font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
          >
            Save Password & Continue
          </button>
        </form>
      </Modal>
    </div>
  );
}

