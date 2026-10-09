import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

// Demo quick-fill accounts for hackathon evaluation
const DEMO_ROLE_PRESETS = [
  {
    role: 'Main Supervisor',
    title: 'Administrator',
    email: 'supervisor@buildverify.ai',
    password: 'Supervisor@2026!',
    badge: 'Admin Access',
    desc: 'Manages user accounts, assigns roles, configures projects, and oversees system logs.',
    icon: ShieldCheck,
    color: 'from-purple-500/20 to-blue-500/20 text-[#9C86CE] border-purple-500/30'
  },
  {
    role: 'Contractor',
    title: 'Site Progress Lead',
    email: 'contractor@buildverify.ai',
    password: 'Contractor@2026!',
    badge: 'Field Submissions',
    desc: 'Submits milestone claims, uploads site photos, and responds to auditor evidence requests.',
    icon: HardHat,
    color: 'from-amber-500/20 to-orange-500/20 text-[#FFE14F] border-[#FFE14F]/30'
  },
  {
    role: 'Shopkeeper',
    title: 'Store In-Charge',
    email: 'store@buildverify.ai',
    password: 'Store@2026!',
    badge: 'Material Deliveries',
    desc: 'Registers delivery challans, uploads OCR tickets, records opening and closing physical stock.',
    icon: Layers,
    color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    role: 'Auditor',
    title: 'Quality & Civil PE',
    email: 'auditor@buildverify.ai',
    password: 'Auditor@2026!',
    badge: 'Approval Authority',
    desc: 'Reviews AI vision findings, audits inventory variance, and signs milestone certification.',
    icon: UserCheck,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
  }
];

export default function Login() {
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

  const handleSelectPreset = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setErrorMessage('');
  };

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
    <div className="min-h-screen bg-[#e9e4d7] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-white relative overflow-hidden">
      {/* Atmospheric ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-linear-to-b from-[#9C86CE]/12 via-[#FFE14F]/8 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-8 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <svg className="w-full h-full" viewBox="0 0 34 34" fill="none">
                <circle cx="17" cy="17" r="17" fill="#9C86CE"/>
                <circle cx="17" cy="17" r="8.6" fill="#FFFFFF"/>
                <circle cx="17" cy="17" r="3.7" fill="#192853"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white leading-none">BuildVerify</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFE14F]/20 text-[#FFE14F] border border-[#FFE14F]/30">AI</span>
              </div>
              <p className="text-[11px] text-[#8b8c8e] font-medium tracking-tight mt-0.5">
                AI Construction Milestone Verification & Material Audit
              </p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            Sign In to Your Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#8b8c8e] max-w-md mx-auto">
            Role-governed verification environment. Sign in with your assigned enterprise account.
          </p>
        </div>

        {/* 4 Role Cards / Quick Credential Selectors */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-[#8b8c8e] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE14F]" />
              <span>Select Role Account to Evaluate</span>
            </span>
            <span className="text-[11px] text-[#8b8c8e] hidden sm:inline">
              Backend cryptographically enforces role permissions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_ROLE_PRESETS.map((p) => {
              const Icon = p.icon;
              const isSelected = email === p.email;
              return (
                <div
                  key={p.role}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-white/8 border-[#FFE14F] shadow-lg shadow-[#FFE14F]/10 -translate-y-1' 
                      : 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl bg-linear-to-br ${p.color} border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white tracking-tight">{p.role}</h3>
                    <p className="text-[10px] text-[#8b8c8e] font-medium">{p.title}</p>
                    <p className="text-[11px] text-[#c8c8cb] mt-2 line-clamp-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono truncate max-w-[120px]">{p.email}</span>
                    <span className={`font-semibold text-xs flex items-center gap-0.5 ${isSelected ? 'text-[#FFE14F]' : 'text-slate-400'}`}>
                      Select <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message Alert */}
            {(errorMessage || authError) && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage || authError}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@buildverify.ai"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/4 border border-white/10 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F] transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#c8c8cb]">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSuccess('');
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-[#FFE14F] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-white/4 border border-white/10 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
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
                  className="w-4 h-4 rounded bg-white/5 border-white/20 text-[#FFE14F] accent-[#FFE14F] cursor-pointer"
                />
                <span className="text-xs text-[#8b8c8e]">Remember this browser</span>
              </label>

              <span className="text-[11px] text-[#8b8c8e] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>JWT RBAC 256</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 btn-fastshot-primary text-[#192853] font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to BuildVerify AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Access Policy Notice */}
        <div className="text-center text-xs text-[#8b8c8e] max-w-lg mx-auto flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Only authorized personnel provisioned by the Main Supervisor may access this portal.</span>
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
            className="px-4 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        }
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <p className="text-xs text-[#c8c8cb] leading-relaxed">
            Enter your registered employee email. Your Main Supervisor will provision a secure temporary password reset ticket.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Registered Email</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. contractor@buildverify.ai"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
            />
          </div>

          {forgotSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {!forgotSuccess && (
            <button
              type="submit"
              className="w-full py-2.5 px-4 btn-fastshot-primary text-[#192853] font-semibold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Request Password Reset
            </button>
          )}
        </form>
      </Modal>

      {/* First-time Change Password Mandatory Modal */}
      <Modal
        isOpen={isChangePassModalOpen}
        onClose={() => {}}
        title="First-Time Login: Set Your New Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFirstTimeChangePassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#FFE14F]/30 text-xs text-[#FFE14F] flex items-start gap-2">
            <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Your account was provisioned with a temporary password. You must set a private password before accessing your workspace.
            </span>
          </div>

          {changePassError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{changePassError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter secure new password"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 btn-fastshot-primary text-[#192853] font-semibold text-xs rounded-xl shadow-md cursor-pointer mt-2"
          >
            Save Password & Continue
          </button>
        </form>
      </Modal>
    </div>
  );
}
