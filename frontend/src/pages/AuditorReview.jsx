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
      cell: (r) => <span className="font-mono font-bold text-white">{r.id}</span> 
    },
    { 
      header: 'Project & Milestone', 
      cell: (r) => (
        <div>
          <p className="font-bold text-white">{r.milestone}</p>
          <p className="text-[11px] text-[#8b8c8e]">{r.project}</p>
        </div>
      ) 
    },
    { 
      header: 'Audit Type', 
      cell: (r) => (
        <span className="px-2 py-0.5 rounded-full bg-white/6 text-slate-300 font-medium text-[11px] border border-white/8">
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
          className="inline-flex items-center gap-1 px-3 py-1 glass-chip rounded-xl text-xs font-semibold hover:text-[#FFE14F] transition cursor-pointer"
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
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
              Human-in-the-Loop Governance
            </span>
            <span className="text-xs text-[#8b8c8e]">• Certified Engineering Sign-off</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">Auditor Review & Decision Ledger</h1>
          <p className="text-xs text-[#8b8c8e] mt-1">
            Review submitted photographic evidence, AI feature detections, and inventory variance calculations before certifying milestone progress.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs glass-chip rounded-xl px-3.5 py-2">
          <Lock className="w-4 h-4 text-[#FFE14F] shrink-0" />
          <span>Role: <strong className="text-white">Lead Quality Auditor</strong></span>
        </div>
      </div>

      {/* Security & Role Permission Callout */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 text-xs text-[#8b8c8e] leading-relaxed">
        <strong className="text-white">Enterprise Role Governance Note:</strong> In production deployments, milestone approval authority is strictly enforced by signed JWT tokens and backend cryptographic RBAC rules, preventing unauthorized client-side state mutation.
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

            {/* Visual Evidence & AI Finding Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#FFE14F]" />
                  <span>Submitted Site Photograph</span>
                </h4>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 h-64">
                  <img
                    src={selectedAudit.evidenceImage}
                    alt={selectedAudit.milestone}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <h4 className="text-xs font-bold text-[#FFE14F] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>AI Vision Findings</span>
                  </h4>
                  <p className="text-xs text-[#c8c8cb] leading-relaxed font-medium">
                    {selectedAudit.aiSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Material Inventory Findings</span>
                  </h4>
                  <p className="text-xs text-[#8b8c8e] leading-relaxed">
                    {selectedAudit.materialSummary}
                  </p>
                </div>

                {selectedAudit.auditorDecision && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Recorded Auditor Decision</span>
                    </h4>
                    <p className="text-xs text-white font-bold">
                      Decision: {selectedAudit.auditorDecision} ({selectedAudit.decisionDate})
                    </p>
                    <p className="text-xs text-emerald-200/80 mt-1 italic">
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
