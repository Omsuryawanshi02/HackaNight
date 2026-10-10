import React, { useState } from 'react';
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
    </div>
  );
}
