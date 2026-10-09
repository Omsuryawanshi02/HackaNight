import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  HardHat,
  Package,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  FileText,
  Camera,
  Layers,
  Lock,
  Scale,
  Sparkles,
  BarChart3,
  Menu,
  X,
  Shield,
  FileCheck,
  Cpu,
  Database,
  Users,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onNavigateToLogin, onNavigateToApp }) {
  const { isAuthenticated, user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      if (onNavigateToApp) onNavigateToApp();
    } else {
      if (onNavigateToLogin) onNavigateToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#29231D] font-sans antialiased selection:bg-[#D6B238]/30 selection:text-[#29231D] relative">

      {/* ─── A. Navigation Bar ────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'glass-header py-3 shadow-md' : 'bg-[#F7F3EA]/90 backdrop-blur-md py-4 border-b border-[#E4D8BE]/60'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-[#D6B238] flex items-center justify-center text-[#29231D] shadow-sm font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#29231D] font-['Outfit']">SITESURE</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D6B238] text-[#29231D]">AI</span>
              </div>
              <p className="text-[10px] text-[#6F7889] font-semibold tracking-tight leading-none hidden sm:block">
                Construction Verification & Audit Intelligence
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#6F7889]">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-[#29231D] transition cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('platform')}
              className="hover:text-[#29231D] transition cursor-pointer"
            >
              Platform
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#29231D] transition cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#29231D] transition cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className="hover:text-[#29231D] transition cursor-pointer"
            >
              Roles
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-[#29231D] transition cursor-pointer"
            >
              Security
            </button>
          </nav>

          {/* Right: Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onNavigateToApp}
                className="btn-gold text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Go to Workspace ({user?.role || role || 'User'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onNavigateToLogin}
                  className="btn-secondary-sandstone text-xs font-bold px-4 py-2 rounded-xl text-[#29231D] hover:bg-[#EDE5D6] transition cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={onNavigateToLogin}
                  className="btn-gold text-xs font-bold px-4.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#29231D] hover:bg-[#EDE5D6] transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF8] border-b border-[#E4D8BE] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2 text-sm font-semibold text-[#6F7889] pb-3 border-b border-[#E4D8BE]">
              <button onClick={() => scrollToSection('home')} className="text-left py-1.5 hover:text-[#29231D]">Home</button>
              <button onClick={() => scrollToSection('platform')} className="text-left py-1.5 hover:text-[#29231D]">Platform</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1.5 hover:text-[#29231D]">How It Works</button>
              <button onClick={() => scrollToSection('features')} className="text-left py-1.5 hover:text-[#29231D]">Features</button>
              <button onClick={() => scrollToSection('roles')} className="text-left py-1.5 hover:text-[#29231D]">Roles</button>
              <button onClick={() => scrollToSection('security')} className="text-left py-1.5 hover:text-[#29231D]">Security</button>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {isAuthenticated ? (
                <button
                  onClick={onNavigateToApp}
                  className="w-full btn-gold py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onNavigateToLogin}
                    className="w-full btn-secondary-sandstone py-2.5 text-xs font-bold rounded-xl text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={onNavigateToLogin}
                    className="w-full btn-gold py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── B. Hero Section ─────────────────────────────────────────── */}
      <section id="home" className="pt-12 pb-16 lg:pt-20 lg:pb-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 flex flex-col items-center">

          {/* Eyebrow Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE5D6] border border-[#E4D8BE] text-[11px] font-extrabold text-[#29231D] uppercase tracking-wider font-['Outfit']">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B238]" />
            <span>AI-Powered Construction Auditing</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#29231D] tracking-tight leading-[1.12] font-['Outfit']">
            Verify Construction Progress. <br />
            <span className="text-[#8f7215]">Build with Confidence.</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base text-[#6F7889] leading-relaxed font-normal max-w-2xl mx-auto">
            SiteSure AI helps construction teams verify site progress, review photographic evidence, reconcile material usage, and identify discrepancies before milestone clearance.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handlePrimaryAction}
              className="w-full sm:w-auto btn-gold py-3.5 px-8 text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('platform')}
              className="w-full sm:w-auto btn-secondary-sandstone py-3.5 px-8 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore the Platform</span>
              <ChevronRight className="w-4 h-4 text-[#6F7889]" />
            </button>
          </div>

          {/* Trust Pill */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-[#6F7889]">
            <ShieldCheck className="w-4 h-4 text-[#727C3E] shrink-0" />
            <span>Evidence-led reviews. Traceable decisions. Human-controlled approvals.</span>
          </div>
        </div>
      </section>

      {/* ─── C. Platform Overview Section ────────────────────────────── */}
      <section id="platform" className="py-16 bg-[#FFFDF8]/30 backdrop-blur-md border-y border-[#E4D8BE]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#29231D] tracking-tight font-['Outfit']">
              One Platform. A Clearer View of Every Site.
            </h2>
            <p className="text-xs sm:text-sm text-[#6F7889] leading-relaxed">
              Bring construction evidence, material records, and milestone reviews into one traceable workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature Card 1 */}
            <div className="porcelain-card p-6 rounded-2xl border border-[#E4D8BE] space-y-4 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#D6B238]/20 flex items-center justify-center text-[#29231D]">
                <Camera className="w-6 h-6 text-[#8f7215]" />
              </div>
              <h3 className="text-lg font-bold text-[#29231D] font-['Outfit']">
                Progress Evidence Verification
              </h3>
              <ul className="space-y-2 text-xs text-[#6F7889] leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Review site photographs against the claimed construction stage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Identify missing, obstructed, duplicate, or potentially inconsistent evidence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Record observations and request additional evidence when required.</span>
                </li>
              </ul>
            </div>

            {/* Feature Card 2 */}
            <div className="porcelain-card p-6 rounded-2xl border border-[#E4D8BE] space-y-4 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#727C3E]/20 flex items-center justify-center text-[#29231D]">
                <Scale className="w-6 h-6 text-[#727C3E]" />
              </div>
              <h3 className="text-lg font-bold text-[#29231D] font-['Outfit']">
                Material & Document Reconciliation
              </h3>
              <ul className="space-y-2 text-xs text-[#6F7889] leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Review vendor challans, purchase orders, receipts, and material movements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Compare recorded quantities with expected consumption and available stock.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Flag unusual drawdowns and unmatched records for human investigation.</span>
                </li>
              </ul>
            </div>

            {/* Feature Card 3 */}
            <div className="porcelain-card p-6 rounded-2xl border border-[#E4D8BE] space-y-4 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#EDE5D6] flex items-center justify-center text-[#29231D]">
                <ShieldCheck className="w-6 h-6 text-[#29231D]" />
              </div>
              <h3 className="text-lg font-bold text-[#29231D] font-['Outfit']">
                Audit & Milestone Control
              </h3>
              <ul className="space-y-2 text-xs text-[#6F7889] leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Consolidate evidence and discrepancies in a single review workflow.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Track findings, explanations, exceptions, and review decisions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                  <span>Support controlled milestone clearance with authorized human approval.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── D. How It Works Section ─────────────────────────────────── */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-[#29231D] tracking-tight font-['Outfit']">
            From Site Evidence to an Informed Audit Decision
          </h2>
          <p className="text-xs sm:text-sm text-[#6F7889]">
            A structured four-step process for clear, repeatable construction verification.
          </p>
        </div>

        {/* Workflow Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">

          {/* Step 1 */}
          <div className="porcelain-card p-5 rounded-2xl border border-[#E4D8BE] relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#8f7215] tracking-wider uppercase font-['Outfit']">Step 01</span>
              <div className="p-2 rounded-lg bg-[#D6B238]/20 text-[#29231D]">
                <HardHat className="w-4.5 h-4.5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Capture</h3>
            <p className="text-xs text-[#6F7889] leading-relaxed">
              Site supervisors submit relevant site evidence using the supported capture workflow with location tags and timestamps.
            </p>
          </div>

          {/* Step 2 */}
          <div className="porcelain-card p-5 rounded-2xl border border-[#E4D8BE] relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#8f7215] tracking-wider uppercase font-['Outfit']">Step 02</span>
              <div className="p-2 rounded-lg bg-[#D6B238]/20 text-[#29231D]">
                <Cpu className="w-4.5 h-4.5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Analyze</h3>
            <p className="text-xs text-[#6F7889] leading-relaxed">
              The system analyzes submitted images and documents, extracts available information, and identifies items that may need review.
            </p>
          </div>

          {/* Step 3 */}
          <div className="porcelain-card p-5 rounded-2xl border border-[#E4D8BE] relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#8f7215] tracking-wider uppercase font-['Outfit']">Step 03</span>
              <div className="p-2 rounded-lg bg-[#727C3E]/20 text-[#727C3E]">
                <Database className="w-4.5 h-4.5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Reconcile</h3>
            <p className="text-xs text-[#6F7889] leading-relaxed">
              Material records and quantities are compared against the relevant project, purchase order, BOQ, and inventory information.
            </p>
          </div>

          {/* Step 4 */}
          <div className="porcelain-card p-5 rounded-2xl border border-[#E4D8BE] relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#8f7215] tracking-wider uppercase font-['Outfit']">Step 04</span>
              <div className="p-2 rounded-lg bg-[#EDE5D6] text-[#29231D]">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Review & Decide</h3>
            <p className="text-xs text-[#6F7889] leading-relaxed">
              The Audit Manager reviews evidence, findings, and exceptions before making an authorized milestone decision.
            </p>
          </div>

        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-[#FFFDF8]/60 backdrop-blur-md border border-[#E4D8BE]/60 flex items-center gap-3 max-w-3xl mx-auto text-xs text-[#6F7889]">
          <Sparkles className="w-5 h-5 text-[#D6B238] shrink-0" />
          <span>
            <strong className="text-[#29231D]">Responsible AI Architecture:</strong> AI produces decision-support observations. Authorized personnel remain strictly responsible for final audit and milestone clearance decisions.
          </span>
        </div>
      </section>

      {/* ─── E. Features Section ─────────────────────────────────────── */}
      <section id="features" className="py-16 bg-[#FFFDF8]/30 backdrop-blur-md border-y border-[#E4D8BE]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#29231D] tracking-tight font-['Outfit']">
              Built for Accountability Across Construction Operations
            </h2>
            <p className="text-xs sm:text-sm text-[#6F7889]">
              Comprehensive auditing tools designed for real-world job site requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[
              {
                title: 'AI-assisted site-photo analysis',
                desc: 'Leverages Qwen2.5-VL-7B Vision-Language Model to evaluate visible work, rebar, concrete, and site conditions.',
                icon: Camera
              },
              {
                title: 'Capture-time and location metadata review',
                desc: 'Validates timestamp, geolocation coordinates, and device EXIF metadata for authentic context.',
                icon: Shield
              },
              {
                title: 'Duplicate and near-duplicate image detection',
                desc: 'Uses perceptual hashing to instantly flag recycled images previously submitted on other milestones.',
                icon: Layers
              },
              {
                title: 'Vendor document OCR with human correction',
                desc: 'Extracts line items, delivery weights, and challan numbers from paper receipts with verification UI.',
                icon: FileText
              },
              {
                title: 'Purchase order and BOQ reconciliation',
                desc: 'Cross-checks reported material usage against project Bill of Quantities and contracted caps.',
                icon: Scale
              },
              {
                title: 'Material inventory movement tracking',
                desc: 'Monitors opening balances, store receipts, daily consumption logs, and closing physical stock.',
                icon: Package
              },
              {
                title: 'Anomaly and discrepancy alerts',
                desc: 'Triggers automated alerts when consumption variances or milestone schedule shifts exceed thresholds.',
                icon: AlertTriangle
              },
              {
                title: 'Evidence-linked audit findings',
                desc: 'Links every finding directly to supporting photos, challan documents, and store register entries.',
                icon: FileCheck
              },
              {
                title: 'Milestone review and clearance workflow',
                desc: 'Enforces structured review states (Approved, Rejected, Conditional) with signed auditor notes.',
                icon: UserCheck
              },
              {
                title: 'Traceable decision history and reports',
                desc: 'Generates comprehensive audit certificates and exportable reports for billing and compliance.',
                icon: BarChart3
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl porcelain-card border border-[#E4D8BE] space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EDE5D6] flex items-center justify-center text-[#29231D]">
                    <Icon className="w-4.5 h-4.5 text-[#8f7215]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">{feature.title}</h3>
                  <p className="text-xs text-[#6F7889] leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ─── G. Trust & Responsible AI Section ──────────────────────── */}
      <section id="security" className="py-16 bg-[#FFFDF8]/30 backdrop-blur-md border-y border-[#E4D8BE]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#29231D] tracking-tight font-['Outfit']">
              Transparent Evidence. Accountable Decisions.
            </h2>
            <p className="text-xs sm:text-sm text-[#6F7889]">
              Designed with strict data governance, evidence traceability, and human control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="p-6 rounded-2xl porcelain-card border border-[#E4D8BE] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#D6B238]/20 text-[#29231D]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Traceable Evidence</h3>
              </div>
              <p className="text-xs text-[#6F7889] leading-relaxed">
                Preserve original submissions, timestamps, image hashes, and associate review results with their underlying supporting records for complete audit trails.
              </p>
            </div>

            <div className="p-6 rounded-2xl porcelain-card border border-[#E4D8BE] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#727C3E]/20 text-[#727C3E]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Human Oversight</h3>
              </div>
              <p className="text-xs text-[#6F7889] leading-relaxed">
                AI vision observations support investigations; they do not independently establish legal fraud, certify structural engineering safety, or authorize payments without human signoff.
              </p>
            </div>

            <div className="p-6 rounded-2xl porcelain-card border border-[#E4D8BE] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#EDE5D6] text-[#29231D]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Controlled Approvals</h3>
              </div>
              <p className="text-xs text-[#6F7889] leading-relaxed">
                Milestone clearance decisions remain subject to the existing multi-tier authorization and review workflow configured within your enterprise.
              </p>
            </div>

            <div className="p-6 rounded-2xl porcelain-card border border-[#E4D8BE] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#29231D]/10 text-[#29231D]">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#29231D] font-['Outfit']">Permission-Based Access</h3>
              </div>
              <p className="text-xs text-[#6F7889] leading-relaxed">
                Role-Based Access Control (RBAC) ensures users only access the projects, site records, and actions permitted by their assigned organizational role.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── I. Premium Footer ────────────────────────────────────────── */}
      <footer className="bg-[#29231D]/92 backdrop-blur-2xl text-[#EDE5D6] border-t border-[#D6B238]/30 pt-16 pb-12 relative overflow-hidden">
        {/* Subtle Decorative Ambient Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#D6B238]/50 to-transparent blur-sm" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#E4D8BE]/15">

            {/* Column 1: Brand Info (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D6B238] flex items-center justify-center text-[#29231D] font-black shadow-md">
                  <Building2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-[#FFFDF8] font-['Outfit']">SITESURE</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D6B238] text-[#29231D]">AI</span>
                  </div>
                  <p className="text-[10px] text-[#D6B238] font-bold tracking-wider uppercase">Audit Intelligence</p>
                </div>
              </div>

              <p className="text-xs text-[#EDE5D6]/80 leading-relaxed font-normal max-w-sm">
                Next-generation construction milestone verification, visual evidence audit, and material reconciliation platform powered by vision-language AI.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFDF8]/5 border border-[#E4D8BE]/20 text-[11px] text-[#D6B238] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#727C3E]" />
                <span>RBAC & Cryptographic Verification Enforced</span>
              </div>
            </div>

            {/* Column 2: Navigation Links (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#D6B238] font-['Outfit']">
                Platform Navigation
              </h4>
              <ul className="space-y-2 text-xs text-[#EDE5D6]/80 font-medium">
                <li>
                  <button onClick={() => scrollToSection('home')} className="hover:text-[#D6B238] transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#D6B238]" /> Home Overview
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('platform')} className="hover:text-[#D6B238] transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#D6B238]" /> Platform Architecture
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#D6B238] transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#D6B238]" /> 4-Step Audit Workflow
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#D6B238] transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#D6B238]" /> Core Capabilities
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('roles')} className="hover:text-[#D6B238] transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#D6B238]" /> Role-Based Access
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('security')} className="hover:text-[#D6B238] transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#D6B238]" /> Security & Governance
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Capabilities (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#D6B238] font-['Outfit']">
                Audit Capabilities
              </h4>
              <ul className="space-y-2 text-xs text-[#EDE5D6]/80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#727C3E]" />
                  <span>Qwen2.5-VL-7B Photo Inspection</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#727C3E]" />
                  <span>Perceptual Image Hash Duplicate Check</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#727C3E]" />
                  <span>Challan OCR & Store Reconciliation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#727C3E]" />
                  <span>Schedule Variance & Anomaly Detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#727C3E]" />
                  <span>Exportable Certification Reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#EDE5D6]/60">
            <div className="flex items-center gap-3">
              <p>© 2026 SiteSure AI. All rights reserved.</p>
              <span className="hidden sm:inline text-[#E4D8BE]/30">•</span>
              <p className="hidden sm:inline">Construction Verification & Material Audit Platform</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>System Operational</span>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
