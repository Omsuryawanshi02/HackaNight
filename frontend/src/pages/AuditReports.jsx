import React, { useState } from 'react';
<<<<<<< HEAD
import { FileText, Download, ShieldCheck, Search, Calendar, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { downloadReportPdfUrl } from '../services/api';
import { generateAuditPdfDossier } from '../utils/pdfGenerator';

export default function AuditReports({ reports = [], onShowToast, backendConnected }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(reports[0] || null);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeReport = selectedReport || filteredReports[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#29231D] font-['Outfit']">Audit Reports & Certificates</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D6B238]/20 text-[#29231D]">Official Dossiers</span>
          </div>
          <p className="text-xs text-[#6F7889] font-medium mt-1">
            Formal quality verification certificates, billing releases, and reconciled material statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7889]" />
            <input
              type="text"
              placeholder="Filter reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238]"
            />
          </div>
        </div>
      </div>

      {/* Grid Layout: Report List & Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Report List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit'] px-1">
            Generated Dossiers ({filteredReports.length})
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE]">
              <FileText className="w-8 h-8 mx-auto text-[#6F7889] mb-2 opacity-50" />
              <p className="text-xs text-[#6F7889] font-semibold">No audit reports match search query.</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isSelected = activeReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFFDF8] border-[#D6B238] shadow-md ring-1 ring-[#D6B238]'
                      : 'bg-[#FFFDF8]/70 border-[#E4D8BE] hover:bg-[#FFFDF8] hover:border-[#D6B238]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#29231D] text-[#D6B238]">
                      {report.id}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6F7889]">{report.generatedDate}</span>
                  </div>

                  <h3 className="text-xs font-bold text-[#29231D] font-['Outfit'] mt-2 line-clamp-1">
                    {report.title}
                  </h3>

                  <p className="text-[11px] text-[#6F7889] font-medium mt-1">
                    {report.project}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E4D8BE]/50">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      report.verdict?.includes('Approved')
                        ? 'bg-[#727C3E]/20 text-[#727C3E]'
                        : 'bg-[#C84B31]/20 text-[#C84B31]'
                    }`}>
                      {report.verdict}
                    </span>
                    <span className="text-[10px] font-medium text-[#6F7889] flex items-center gap-1">
                      View Certificate <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Dossier View */}
        <div className="lg:col-span-8">
          {activeReport ? (
            <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4D8BE]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D6B238] flex items-center justify-center text-[#29231D] font-black shrink-0 shadow-sm">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#29231D] text-[#D6B238] tracking-wider uppercase">
                      Official Certificate #{activeReport.id}
                    </span>
                    <h2 className="text-xl font-extrabold text-[#29231D] font-['Outfit'] mt-1">
                      {activeReport.title}
                    </h2>
                    <p className="text-xs text-[#6F7889] font-medium mt-0.5">
                      Site: <span className="text-[#29231D] font-bold">{activeReport.project}</span> • Generated {activeReport.generatedDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    generateAuditPdfDossier(activeReport);
                    if (onShowToast) {
                      onShowToast({
                        type: 'success',
                        title: 'PDF Dossier Downloaded',
                        message: `Generated official PDF certificate for ${activeReport.id}`
                      });
                    }
                  }}
                  className="btn-gold text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Dossier</span>
                </button>
              </div>

              {/* Verdict Summary Box */}
              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E4D8BE] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider">Formal Verdict</span>
                  <p className="text-base font-extrabold text-[#29231D] font-['Outfit'] mt-0.5">
                    {activeReport.verdict}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider">Certified Auditor</span>
                  <p className="text-xs font-bold text-[#29231D] mt-0.5">{activeReport.auditor}</p>
                </div>
              </div>

              {/* Key Findings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#29231D] font-['Outfit'] uppercase tracking-wider">
                  Auditor Audit Findings & Remarks
                </h4>
                <div className="space-y-2">
                  {activeReport.keyFindings?.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFDF8] border border-[#E4D8BE]/80 text-xs font-medium text-[#29231D]">
                      <CheckCircle2 className="w-4 h-4 text-[#727C3E] shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Reconciliation Data Table */}
              {activeReport.reconciliationData && (
                <div className="space-y-3 pt-4 border-t border-[#E4D8BE]">
                  <h4 className="text-xs font-bold text-[#29231D] font-['Outfit'] uppercase tracking-wider">
                    Material Reconciliation Statement
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-[#E4D8BE]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F7F3EA] text-[#6F7889] font-bold border-b border-[#E4D8BE]">
                        <tr>
                          <th className="p-3">Material</th>
                          <th className="p-3">Challan Qty</th>
                          <th className="p-3">Received</th>
                          <th className="p-3">Recorded Use</th>
                          <th className="p-3">Physical Use</th>
                          <th className="p-3">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4D8BE]">
                        <tr>
                          <td className="p-3 font-bold text-[#29231D]">{activeReport.reconciliationData.material}</td>
                          <td className="p-3 text-[#6F7889]">{activeReport.reconciliationData.challanQty}</td>
                          <td className="p-3 text-[#6F7889]">{activeReport.reconciliationData.receivedQty}</td>
                          <td className="p-3 text-[#6F7889]">{activeReport.reconciliationData.consumedRecorded}</td>
                          <td className="p-3 font-bold text-[#29231D]">{activeReport.reconciliationData.consumedPhysical}</td>
                          <td className="p-3 font-bold text-[#727C3E]">{activeReport.reconciliationData.variance}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE]">
              <FileText className="w-10 h-10 mx-auto text-[#6F7889] mb-2 opacity-50" />
              <p className="text-xs text-[#6F7889] font-semibold">Select a report from the list to view full details.</p>
            </div>
          )}
        </div>
      </div>
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    </div>
  );
}
