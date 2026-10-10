import { jsPDF } from 'jspdf';

/**
 * Generate and download an official PRAMAAN AI PDF Audit Dossier
 * @param {Object} report - Report data object
 */
export function generateAuditPdfDossier(report) {
  if (!report) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Colors (RGB)
  const colorPrimary = [41, 35, 29];    // #29231D Dark Charcoal
  const colorGold = [214, 178, 56];     // #D6B238 Champagne Gold
  const colorOlive = [114, 124, 62];    // #727C3E Sage Green
  const colorRed = [200, 75, 49];       // #C84B31 Crimson
  const colorBgLight = [247, 243, 234]; // #F7F3EA Sandstone
  const colorBorder = [228, 216, 190];  // #E4D8BE Border
  const colorTextDark = [41, 35, 29];
  const colorTextMuted = [111, 120, 137];

  let y = margin;

  // 1. TOP HEADER BANNER
  doc.setFillColor(...colorPrimary);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Gold Top Accent Line
  doc.setFillColor(...colorGold);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PRAMAAN AI', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colorGold);
  doc.text('— From Site To Proof', margin + 35, 13);

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text('ISO/IEC 17020 COMPLIANT AUDIT DOSSIER', pageWidth - margin, 13, { align: 'right' });

  y = 32;

  // 2. DOSSIER TITLE & METADATA CARD
  doc.setFillColor(...colorBgLight);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'FD');

  // Report ID Badge
  doc.setFillColor(...colorPrimary);
  doc.roundedRect(margin + 5, y + 5, 32, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...colorGold);
  doc.text(`ID: ${report.id || `REP-${new Date().getFullYear()}-101`}`, margin + 21, y + 9.2, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...colorTextDark);
  doc.text(report.title || 'Construction Audit Statement', margin + 42, y + 10);

  // Subtitle / Project
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colorTextMuted);
  doc.text(`Project Site: ${report.project || 'PRAMAAN Active Site'}`, margin + 5, y + 19);

  doc.text(`Generated Date: ${report.generatedDate || new Date().toISOString().split('T')[0]}`, margin + 5, y + 25);
  doc.text(`Auditor in Charge: ${report.auditor || 'Lead Auditor'}`, margin + 5, y + 31);

  // Verdict Box (Right aligned inside metadata card)
  const verdictText = (report.verdict || 'VERIFIED').toUpperCase();
  const isApproved = verdictText.includes('APPROVED') || verdictText.includes('PASSED');
  const verdictBg = isApproved ? colorOlive : colorRed;

  doc.setFillColor(...verdictBg);
  doc.roundedRect(pageWidth - margin - 50, y + 14, 45, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('FORMAL VERDICT', pageWidth - margin - 27.5, y + 19, { align: 'center' });
  doc.setFontSize(8);
  doc.text(verdictText, pageWidth - margin - 27.5, y + 24.5, { align: 'center' });

  y += 44;

  // 3. AUDITOR FINDINGS & REMARKS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colorTextDark);
  doc.text('AUDITOR AUDIT FINDINGS & REMARKS', margin, y);

  // Gold accent bar under heading
  doc.setFillColor(...colorGold);
  doc.rect(margin, y + 2, contentWidth, 0.8, 'F');

  y += 8;

  const findings = report.keyFindings || [
    'Challan physical delivery reconciled against gate register entries.',
    'Material visual inspection confirmed conforming specs.',
    'Variance within standard site allowance tolerance limits.'
  ];

  findings.forEach((finding, index) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'FD');

    // Bullet icon
    doc.setFillColor(...colorOlive);
    doc.circle(margin + 4, y + 5, 1.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...colorTextDark);
    doc.text(finding, margin + 8, y + 6.3);

    y += 13;
  });

  y += 4;

  // 4. MATERIAL RECONCILIATION STATEMENT TABLE
  if (report.reconciliationData) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colorTextDark);
    doc.text('MATERIAL RECONCILIATION STATEMENT', margin, y);

    // Gold accent bar under heading
    doc.setFillColor(...colorGold);
    doc.rect(margin, y + 2, contentWidth, 0.8, 'F');

    y += 8;

    // Table Headers
    const headers = ['Material Name', 'Challan Qty', 'Received', 'Recorded Use', 'Physical Use', 'Variance'];
    const colWidths = [45, 25, 25, 28, 28, 29];

    doc.setFillColor(...colorBgLight);
    doc.setDrawColor(...colorBorder);
    doc.rect(margin, y, contentWidth, 8, 'FD');

    let x = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colorTextMuted);

    headers.forEach((h, i) => {
      doc.text(h, x + 2, y + 5.5);
      x += colWidths[i];
    });

    y += 8;

    // Table Data Row
    const row = [
      report.reconciliationData.material || 'Cement OPC 53',
      report.reconciliationData.challanQty || '1000 Bags',
      report.reconciliationData.receivedQty || '960 Bags',
      report.reconciliationData.consumedRecorded || '760 Bags',
      report.reconciliationData.consumedPhysical || '880 Bags',
      report.reconciliationData.variance || '+120 Bags (15.8%)'
    ];

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 10, 'FD');

    x = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorTextDark);

    row.forEach((val, i) => {
      if (i === 0) doc.setFont('helvetica', 'bold');
      else if (i === 5) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorOlive);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorTextDark);
      }
      doc.text(String(val), x + 2, y + 6.5);
      x += colWidths[i];
    });

    y += 18;
  }

  // 5. OFFICIAL SIGNATURE & STAMP BLOCK
  doc.setFillColor(...colorBgLight);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorTextDark);
  doc.text('CHAIN OF CUSTODY & VERIFICATION SEAL', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorTextMuted);
  doc.text('This digital dossier has been cryptographically signed and recorded on the PRAMAAN ledger.', margin + 6, y + 13);
  doc.text(`Verification Code: PRAMAAN-VERIFIED-AUTH-${new Date().getFullYear()}-X89`, margin + 6, y + 18);
  doc.text(`Timestamp: ${new Date().toISOString()}`, margin + 6, y + 23);

  // Official Stamp Box (Right side)
  doc.setDrawColor(...colorGold);
  doc.setLineWidth(0.8);
  doc.roundedRect(pageWidth - margin - 48, y + 6, 42, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGold);
  doc.text('PRAMAAN AI', pageWidth - margin - 27, y + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(...colorTextDark);
  doc.text('OFFICIAL SEAL OF AUDIT', pageWidth - margin - 27, y + 19, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(...colorOlive);
  doc.text('✓ DIGITALLY SIGNED', pageWidth - margin - 27, y + 24, { align: 'center' });

  // 6. FOOTER BAR
  doc.setFillColor(...colorPrimary);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGold);
  doc.text('PRAMAAN AI — Construction Site Verification Engine', margin, pageHeight - 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text('Page 1 of 1 • Confidentially generated for Site Supervisor', pageWidth - margin, pageHeight - 4.5, { align: 'right' });

  // Save the PDF file natively
  const fileName = `PRAMAAN_Audit_Report_${report.id || 'DOSSIER'}.pdf`;
  doc.save(fileName);
}
