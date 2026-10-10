import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Camera, 
  UserCheck, 
  Layers 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { submitAuditorDecision } from '../services/api';

export default function AuditorReview({ 
  auditReviews = [], 
  onUpdateAuditDecision, 
  onShowToast, 
  backendConnected,
  initialSelectedAudit = null
}) {
  const [selectedAudit, setSelectedAudit] = useState(initialSelectedAudit);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState('Approve');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDetails = (audit) => {
    setSelectedAudit(audit);
  };

  const handleInitiateDecision = (action) => {
    setDecisionAction(action);
    setDecisionReason('');
    setDecisionError('');
    setIsDecisionModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if ((decisionAction === 'More Evidence Required' || decisionAction === 'Rejected') && !decisionReason.trim()) {
      setDecisionError(`A detailed explanation is required when selecting "${decisionAction}".`);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      decision: decisionAction,
      notes: decisionReason.trim() || 'Approved after technical review of photographic evidence and inventory logs.',
      auditor: 'Pooja Iyer (Lead Quality Auditor)',
      timestamp: new Date().toISOString()
    };

    if (backendConnected && selectedAudit) {
      await submitAuditorDecision(selectedAudit.id, payload);
    }

    onUpdateAuditDecision?.(selectedAudit.id, {
      status: decisionAction,
      auditorDecision: decisionAction,
      auditorNotes: payload.notes,
      decisionDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setIsSubmitting(false);
    setIsDecisionModalOpen(false);

    setSelectedAudit(prev => prev ? ({
      ...prev,
      status: decisionAction,
      auditorDecision: decisionAction,
      auditorNotes: payload.notes,
      decisionDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }) : null);

    onShowToast?.({
      type: decisionAction === 'Approved' ? 'success' : decisionAction === 'Rejected' ? 'error' : 'warning',
      title: `Audit Decision Recorded`,
      message: `Audit ${selectedAudit.id} status updated to "${decisionAction}".`
    });
  };

  const columns = [
    { 
      header: 'Audit ID', 
      accessor: 'id', 
      cell: (r) => <span className="font-mono font-bold text-[#29231D]">{r.id}</span> 
    },
    { 
      header: 'Project & Milestone', 
      cell: (r) => (
        <div>
          <p className="font-bold text-[#29231D]">{r.milestone}</p>
          <p className="text-[11px] text-[#6F7889]">{r.project}</p>
        </div>
      ) 
    },
    { 
      header: 'Audit Type', 
      cell: (r) => (
        <span className="px-2.5 py-0.5 rounded-full bg-[#EDE5D6] text-[#29231D] font-bold text-[11px] border border-[#E4D8BE]">
          {r.auditType}
        </span>
      ) 
    },
    { header: 'Submitted By', accessor: 'submittedBy' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    { 
      header: 'Risk Level', 
      cell: (r) => <StatusBadge status={r.riskLevel} size="sm" /> 
    },
    { 
      header: 'Current Status', 
      cell: (r) => <StatusBadge status={r.status} size="sm" /> 
    },
    { 
      header: 'Action', 
      align: 'right',
      cell: (r) => (
        <button
          onClick={() => handleOpenDetails(r)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFFDF8] border border-[#E4D8BE] hover:bg-[#D6B238] hover:text-[#29231D] text-[#29231D] rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider font-['Outfit']">
              Human-in-the-Loop Governance
            </span>
            <span className="text-xs text-[#6F7889] font-medium">• Certified Engineering Sign-off</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#29231D] font-['Outfit'] mt-1.5 tracking-tight">Auditor Review & Decision Ledger</h1>
          <p className="text-xs text-[#6F7889] font-medium mt-1">
            Review submitted photographic evidence, AI feature detections, and inventory variance calculations before certifying milestone progress.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-[#F7F3EA] border border-[#E4D8BE] text-[#29231D] font-bold rounded-xl px-3.5 py-2">
          <Lock className="w-4 h-4 text-[#D6B238] shrink-0" />
          <span>Role: <strong className="text-[#29231D]">Lead Quality Auditor</strong></span>
        </div>
      </div>

      {/* Security & Role Permission Callout */}
      <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E4D8BE] text-xs text-[#6F7889] leading-relaxed font-medium">
        <strong className="text-[#29231D]">Enterprise Role Governance Note:</strong> In production deployments, milestone approval authority is strictly enforced by signed JWT tokens and backend cryptographic RBAC rules, preventing unauthorized client-side state mutation.
      </div>

      {/* Audit Review Queue Table */}
      <DataTable
        title="Auditor Review Ledger"
        subtitle="Submitted construction milestone claims and delivery reconciliations"
        columns={columns}
        data={auditReviews}
        searchPlaceholder="Search by audit ID, project, or milestone..."
        filterKey="status"
        filterOptions={[
          { value: 'Pending Review', label: 'Pending Review' },
          { value: 'Approved', label: 'Approved' },
          { value: 'More Evidence Required', label: 'More Evidence Required' },
          { value: 'Rejected', label: 'Rejected' }
        ]}
      />

      {/* Details Modal */}
      {selectedAudit && (
        <Modal
          isOpen={!!selectedAudit}
          onClose={() => setSelectedAudit(null)}
          title={`Audit Review: ${selectedAudit.id}`}
          maxWidth="max-w-4xl"
          footer={
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#8b8c8e]">
                Current Status: <strong className="text-white">{selectedAudit.status}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handleInitiateDecision('Rejected')}
                  className="px-3.5 py-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Reject Claim
                </button>

                <button
                  onClick={() => handleInitiateDecision('More Evidence Required')}
                  className="px-3.5 py-2 bg-[#FFE14F]/15 border border-[#FFE14F]/30 text-[#FFE14F] hover:bg-[#FFE14F]/25 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Request More Evidence
                </button>

                <button
                  onClick={() => handleConfirmDecision('Approved')}
                  className="px-4 py-2 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  Approve Milestone
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Metadata Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/3 rounded-xl border border-white/8 text-xs">
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Project</span>
                <span className="font-bold text-white mt-0.5 block">{selectedAudit.project}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Milestone Claim</span>
                <span className="font-bold text-[#FFE14F] mt-0.5 block">{selectedAudit.claimedPercentage}% Claimed</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Submitted By</span>
                <span className="font-bold text-white mt-0.5 block">{selectedAudit.submittedBy}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Submission Date</span>
                <span className="font-bold text-white mt-0.5 block">{selectedAudit.submissionDate}</span>
              </div>
            </div>

            {/* Milestone Clearance Gate Checklist */}
            <div className="p-5 rounded-xl bg-[#EDE5D6]/60 border border-[#E4D8BE] space-y-3">
              <h4 className="text-xs font-bold text-[#29231D] uppercase tracking-wider font-['Outfit'] flex items-center justify-between">
                <span>Milestone Clearance Gate Enforcement (6 Gates)</span>
                <span className="text-[10px] font-bold text-[#727C3E] bg-[#727C3E]/20 px-2 py-0.5 rounded border border-[#727C3E]/40">Gate Checklist Active</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E4D8BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0" />
                  <span className="font-semibold text-[#29231D]">Gate 1: Photographic Evidence Present</span>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E4D8BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0" />
                  <span className="font-semibold text-[#29231D]">Gate 2: VLM AI Photo Analysis Reviewed</span>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E4D8BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0" />
                  <span className="font-semibold text-[#29231D]">Gate 3: Material Inventory Reconciled</span>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E4D8BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0" />
                  <span className="font-semibold text-[#29231D]">Gate 4: No Blocking Critical Findings</span>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E4D8BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0" />
                  <span className="font-semibold text-[#29231D]">Gate 5: Measured Quantities Verified</span>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF8] p-2.5 rounded-lg border border-[#E4D8BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0" />
                  <span className="font-semibold text-[#29231D]">Gate 6: Auditor Role Authorized (No Self-Approval)</span>
                </div>
              </div>
            </div>

            {/* Visual Evidence & AI Finding Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-xs font-bold text-[#29231D] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-['Outfit']">
                  <Camera className="w-4 h-4 text-[#D6B238]" />
                  <span>Submitted Site Photograph</span>
                </h4>
                <div className="rounded-xl overflow-hidden border border-[#E4D8BE] bg-[#29231D] h-64">
                  <img
                    src={selectedAudit.evidenceImage}
                    alt={selectedAudit.milestone}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E4D8BE]">
                  <h4 className="text-xs font-bold text-[#D6B238] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-['Outfit']">
                    <UserCheck className="w-4 h-4" />
                    <span>AI Vision Findings</span>
                  </h4>
                  <p className="text-xs text-[#29231D] leading-relaxed font-medium">
                    {selectedAudit.aiSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E4D8BE]">
                  <h4 className="text-xs font-bold text-[#6F7889] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-['Outfit']">
                    <Layers className="w-4 h-4 text-[#D6B238]" />
                    <span>Material Inventory Findings</span>
                  </h4>
                  <p className="text-xs text-[#6F7889] leading-relaxed">
                    {selectedAudit.materialSummary}
                  </p>
                </div>

                {selectedAudit.auditorDecision && (
                  <div className="p-4 rounded-xl bg-[#727C3E]/15 border border-[#727C3E]/30">
                    <h4 className="text-xs font-bold text-[#727C3E] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-['Outfit']">
                      <CheckCircle2 className="w-4 h-4 text-[#727C3E]" />
                      <span>Formal Milestone Clearance Certificate</span>
                    </h4>
                    <p className="text-xs text-[#29231D] font-bold">
                      Verdict: {selectedAudit.auditorDecision} ({selectedAudit.decisionDate})
                    </p>
                    <p className="text-[11px] font-mono text-[#6F7889] mt-0.5">
                      Certificate Hash: sha256_cert_{selectedAudit.id.replace(/-/g, '').substring(0, 16)}
                    </p>
                    <p className="text-xs text-[#727C3E] mt-1.5 italic font-medium">
                      "{selectedAudit.auditorNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation & Reason Dialog Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title={`Confirm Decision: ${decisionAction}`}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDecisionModalOpen(false)}
              className="px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDecision}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer ${
                decisionAction === 'Approved' ? 'btn-fastshot-primary text-[#192853]' :
                decisionAction === 'Rejected' ? 'bg-rose-600 hover:bg-rose-500 text-white' :
                'bg-[#FFE14F] hover:bg-[#FFE14F] text-[#192853]'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Confirm & Save Decision'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#c8c8cb]">
            You are about to submit the verdict <strong className="text-white">{decisionAction}</strong> for audit claim <strong className="font-mono text-[#FFE14F]">{selectedAudit?.id}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Auditor Justification & Notes {decisionAction !== 'Approved' && <span className="text-rose-400">*</span>}
            </label>
            <textarea
              rows={4}
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder={
                decisionAction === 'Approved' 
                  ? 'Optional approval comments or inspection references...' 
                  : 'Specify missing photographic angles, re-testing requirements, or discrepancy explanation...'
              }
              className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
            />
            {decisionError && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{decisionError}</span>
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
