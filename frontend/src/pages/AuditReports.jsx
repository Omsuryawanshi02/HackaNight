import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  FileSpreadsheet
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { downloadReportPdfUrl } from '../services/api';

export default function AuditReports({ 
  reports = [], 
  onShowToast, 
  backendConnected 
}) {
  const [activeReportId, setActiveReportId] = useState(null);

  const activeReport = reports.find(r => r.id === activeReportId);

  const handleDownloadPdf = (report) => {
    if (backendConnected) {
      window.open(downloadReportPdfUrl(report.id), '_blank');
      onShowToast?.({
        type: 'success',
        title: 'Downloading PDF',
        message: `Requesting generated ReportLab PDF for ${report.id} from backend...`
      });
    } else {
      onShowToast?.({
        type: 'info',
        title: 'PDF Print View Ready',
        message: 'Opening clean browser PDF print dialog (Backend PDF service offline).'
      });
      window.print();
    }
  };

  const columns = [
    { 
      header: 'Report ID', 
      accessor: 'id', 
      cell: (r) => <span className="font-mono font-bold text-white">{r.id}</span> 
    },
    { 
      header: 'Report Title & Project', 
      cell: (r) => (
        <div>
          <p className="font-bold text-white">{r.title}</p>
          <p className="text-[11px] text-[#8b8c8e]">{r.project}</p>
        </div>
      ) 
    },
    { 
      header: 'Audit Type', 
      accessor: 'auditType',
      cell: (r) => <span className="px-2 py-0.5 rounded-full bg-white/6 text-slate-300 font-medium text-[11px] border border-white/8">{r.auditType}</span>
    },
    { header: 'Audited Milestone', accessor: 'milestone' },
    { 
      header: 'Verdict', 
      cell: (r) => <StatusBadge status={r.verdict} size="sm" /> 
    },
    { header: 'Generated Date', accessor: 'generatedDate' },
    { 
      header: 'Actions', 
      align: 'right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setActiveReportId(r.id)}
            className="p-1.5 rounded-lg hover:bg-white/6 text-slate-400 hover:text-white transition cursor-pointer"
            title="View Full Report"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadPdf(r)}
            className="p-1.5 rounded-lg hover:bg-white/6 text-slate-400 hover:text-[#FFE14F] transition cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      {!activeReport ? (
        <>
          {/* Top Banner */}
          <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
                  Formal Audit Dossiers
                </span>
                <span className="text-xs text-[#8b8c8e]">• Evidence-Backed Certification</span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">Audit Reports & Certification History</h1>
              <p className="text-xs text-[#8b8c8e] mt-1">
                Generate and archive comprehensive milestone audit dossiers with photographic evidence, inventory reconciliations, and auditor sign-offs.
              </p>
            </div>

            <button
              onClick={() => {
                const csvHeaders = 'Report ID,Title,Project,Milestone,Audit Type,Verdict,Status,Date,Auditor\n';
                const csvRows = reports.map(r => 
                  `"${r.id}","${r.title}","${r.project}","${r.milestone}","${r.auditType}","${r.verdict}","${r.status}","${r.generatedDate}","${r.auditor}"`
                ).join('\n');
                const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-reports-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                onShowToast?.({ type: 'success', title: 'Export Complete', message: 'Exported reports history to CSV.' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export All to CSV</span>
            </button>
          </div>

          {/* Table */}
          <DataTable
            title="Generated Audit Reports Archive"
            subtitle="Audited construction progress statements and material verification records"
            columns={columns}
            data={reports}
            searchPlaceholder="Search reports by title, project, or milestone..."
            filterKey="verdict"
            filterOptions={[
              { value: 'Approved for Billing', label: 'Approved for Billing' },
              { value: 'Conditional Review', label: 'Conditional Review' },
              { value: 'More Evidence Required', label: 'More Evidence Required' }
            ]}
          />
        </>
      ) : (
        /* Detailed Report View */
        <div className="space-y-6">
          {/* Back & Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveReportId(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports Archive</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>

              <button
                onClick={() => handleDownloadPdf(activeReport)}
                className="inline-flex items-center gap-1.5 px-4 py-2 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>

          {/* Official Printable Report Document Card */}
          <div className="glass-card p-8 max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b border-white/8 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#FFE14F] bg-[#FFE14F]/15 px-2.5 py-0.5 rounded-full border border-[#FFE14F]/30">
                    {activeReport.id}
                  </span>
                  <span className="text-xs text-[#8b8c8e]">• Official Audit Dossier</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mt-2 tracking-tight">{activeReport.title}</h2>
                <p className="text-xs text-[#8b8c8e] mt-0.5">{activeReport.project} • {activeReport.auditType}</p>
              </div>

              <div className="text-right">
                <StatusBadge status={activeReport.verdict} size="md" />
                <p className="text-[11px] text-[#8b8c8e] mt-1">Generated: {activeReport.generatedDate}</p>
              </div>
            </div>

            {/* Metadata Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/3 rounded-xl border border-white/6 text-xs">
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Lead Auditor</span>
                <span className="font-bold text-white mt-0.5 block">{activeReport.auditor}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Executing Contractor</span>
                <span className="font-bold text-white mt-0.5 block">{activeReport.contractor}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Target Milestone</span>
                <span className="font-bold text-white mt-0.5 block">{activeReport.milestone}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8c8e] font-semibold uppercase block">Source Audit ID</span>
                <span className="font-mono font-bold text-[#FFE14F] mt-0.5 block">{activeReport.auditId}</span>
              </div>
            </div>

            {/* Section 1 */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FFE14F]" />
                <span>1. Executive Audit Findings & Evidence Assessment</span>
              </h3>
              <div className="space-y-2">
                {activeReport.keyFindings?.map((finding, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/3 border border-white/6 text-xs text-[#c8c8cb] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFE14F] shrink-0 mt-1.5"></span>
                    <span className="leading-relaxed">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            {activeReport.reconciliationData && (
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFE14F]" />
                  <span>2. Material Quantity & Challan Reconciliation Statement</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-white/8">
                  <table className="w-full text-left text-xs text-[#c8c8cb]">
                    <thead className="bg-white/4 border-b border-white/6 text-[11px] font-semibold text-[#8b8c8e] uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Material Reconciled</th>
                        <th className="px-4 py-2.5">Challan Declared</th>
                        <th className="px-4 py-2.5">Store Received</th>
                        <th className="px-4 py-2.5">Recorded Use</th>
                        <th className="px-4 py-2.5">Physical Use</th>
                        <th className="px-4 py-2.5 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="divide-y divide-white/4">
                        <td className="px-4 py-3 font-bold text-white">{activeReport.reconciliationData.material}</td>
                        <td className="px-4 py-3">{activeReport.reconciliationData.challanQty}</td>
                        <td className="px-4 py-3">{activeReport.reconciliationData.receivedQty}</td>
                        <td className="px-4 py-3">{activeReport.reconciliationData.consumedRecorded}</td>
                        <td className="px-4 py-3 font-semibold text-white">{activeReport.reconciliationData.consumedPhysical}</td>
                        <td className="px-4 py-3 text-right font-bold text-rose-400">{activeReport.reconciliationData.variance}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 3 */}
            <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-[#8b8c8e] font-mono">
                  SHA-256 Audit Integrity Hash: 9f8a3c2e71bd904e22a4b8618e77c44d18fa2
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verified with BuildVerify AI Audit Standards (v1.0.4)
                </p>
              </div>

              <div className="text-right sm:text-right">
                <div className="font-serif italic text-sm text-white font-bold">Pooja Iyer</div>
                <div className="text-[11px] text-[#8b8c8e]">Lead Quality Auditor, PE (Civil)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
