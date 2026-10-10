export const INITIAL_PROJECTS = [
  {
    id: 'PRJ-101',
    name: 'Riverside Commercial Tower A',
    location: 'North Tech Corridor, Zone 4',
    budget: '$18.4M',
    status: 'Active',
    completionPercent: 68,
    contractor: 'Apex Infracon Pvt Ltd',
    supervisor: 'Rajesh Varma'
  },
  {
    id: 'PRJ-102',
    name: 'Metro Line 3 Sub-Station',
    location: 'Central Transport Hub',
    budget: '$34.2M',
    status: 'Active',
    completionPercent: 42,
    contractor: 'Metro Infrastructure Corp',
    supervisor: 'Suresh Mehta'
  },
  {
    id: 'PRJ-103',
    name: 'Highland Heights Residential Phase 2',
    location: 'South Valley Boulevard',
    budget: '$12.8M',
    status: 'Active',
    completionPercent: 85,
    contractor: 'Skyline Buildtech',
    supervisor: 'Pooja Iyer'
  }
];

export const INITIAL_DASHBOARD_STATS = {
  pendingReviews: 3,
  verifiedMilestones: 24,
  materialDiscrepancies: 5,
  overallSafetyScore: 94.2
};

export const MILESTONE_PROGRESS_DATA = [
  { milestone: 'Foundation & Piling', claimed: 100, verified: 100, status: 'Approved' },
  { milestone: 'Basement Slab Pour', claimed: 100, verified: 100, status: 'Approved' },
  { milestone: 'Ground Floor Columns', claimed: 90, verified: 85, status: 'Under Review' },
  { milestone: 'Level 2 Beam Structure', claimed: 60, verified: 50, status: 'In Progress' },
  { milestone: 'Exterior Cladding', claimed: 25, verified: 15, status: 'Pending Verification' }
];

export const MATERIAL_CONSUMPTION_DATA = [
  { month: 'Jun', cement: 420, steel: 180, aggregate: 890 },
  { month: 'Jul', cement: 510, steel: 210, aggregate: 940 },
  { month: 'Aug', cement: 480, steel: 195, aggregate: 910 },
  { month: 'Sep', cement: 620, steel: 260, aggregate: 1120 },
  { month: 'Oct', cement: 580, steel: 240, aggregate: 1050 }
];

export const SAMPLE_PHOTO_PRESETS = [
  {
    id: 'PRESET-1',
    title: 'Column Steel Placement (80%)',
    project: 'Riverside Commercial Tower A',
    location: 'Grid A1-B4 Ground Floor',
    milestone: 'Columns',
    claimedPercentage: 80,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800',
    mockResult: {
      claimedMilestone: 'Ground Floor Columns Verification',
      assessmentStatus: 'Evidence Supports Claim',
      confidenceScore: 92,
      estimatedProgressRange: '75% - 82%',
      visibleEvidence: [
        '16 vertical TMT 20mm main reinforcement bars installed',
        'Helical tie spacing verified at 150mm c/c',
        'Column shuttering alignment plumb checked'
      ],
      missingEvidence: [
        'Pour checklist sign-off missing for concrete batching'
      ],
      recommendation: 'Visual evidence supports 80% claim. Proceed with concrete pour approval.',
      notes: 'Verified against structural drawings ST-201.'
    }
  },
  {
    id: 'PRESET-2',
    title: 'Basement Slab Concrete Pour (95%)',
    project: 'Metro Line 3 Sub-Station',
    location: 'Basement Level B2',
    milestone: 'Slab',
    claimedPercentage: 95,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    mockResult: {
      claimedMilestone: 'Basement Level B2 Slab Pour',
      assessmentStatus: 'Evidence Supports Claim',
      confidenceScore: 96,
      estimatedProgressRange: '92% - 98%',
      visibleEvidence: [
        'M35 RMC pour finished with needle vibrator compaction',
        'Curing ponding bunds established'
      ],
      missingEvidence: [
        '7-day cube strength report pending laboratory release'
      ],
      recommendation: 'Slab pour complete. Release 90% milestone billing after 7-day cube report.',
      notes: 'Verified by Site Supervisor Rajesh Varma.'
    }
  }
];

export const INITIAL_MATERIAL_AUDITS = [
  {
    id: 'MAT-AUD-101',
    project: 'Riverside Commercial Tower A',
    material: 'OPC 53 Grade Cement',
    challanNo: 'CH-8842',
    supplier: 'UltraTech Cement Distributors',
    challanQty: 500,
    receivedQty: 480,
    unit: 'Bags',
    openingStock: 120,
    closingPhysicalStock: 210,
    recordedConsumption: 390,
    estimatedUsed: 390,
    consumptionVariance: 0,
    variancePercent: 0,
    status: 'Normal Variance',
    timestamp: '2026-10-08 14:30'
  },
  {
    id: 'MAT-AUD-102',
    project: 'Riverside Commercial Tower A',
    material: 'TMT 16mm Steel Bars',
    challanNo: 'CH-9104',
    supplier: 'TATA Tiscon Rebars',
    challanQty: 15,
    receivedQty: 15,
    unit: 'Tons',
    openingStock: 5,
    closingPhysicalStock: 8,
    recordedConsumption: 12,
    estimatedUsed: 12,
    consumptionVariance: 3.2,
    variancePercent: 26.6,
    status: 'High Discrepancy',
    timestamp: '2026-10-09 11:15'
  }
];

export const INITIAL_ANOMALIES = [
  {
    id: 'ANOM-101',
    project: 'Riverside Commercial Tower A',
    material: 'TMT 16mm Steel Bars',
    anomalyType: 'Excess Consumption Discrepancy',
    expectedValue: '12 Tons (Recorded in Daily Log)',
    observedValue: '15.2 Tons (Store Stock Reconciled)',
    variance: '+3.2 Tons (+26.6%)',
    severity: 'High',
    explanation: 'Store ledger reconciliation shows 3.2 Tons uncertified excess consumption compared to concrete pour log certification.',
    recommendedAction: 'Verify steel binder wastage log and conduct physical stock count of rebar yard B.',
    status: 'Open',
    detectedAt: '2026-10-09 11:15'
  },
  {
    id: 'ANOM-102',
    project: 'Metro Line 3 Sub-Station',
    material: 'M35 Ready Mix Concrete',
    anomalyType: 'Compressive Strength Test Deficit',
    expectedValue: '35 MPa at 28 Days',
    observedValue: '31.2 MPa (Core Sample #4)',
    variance: '-3.8 MPa (-10.8%)',
    severity: 'Medium',
    explanation: '7-day cube testing indicates lower hydration strength curve than mix design allowance.',
    recommendedAction: 'Perform non-destructive rebound hammer test on Grid C2 columns.',
    status: 'Under Investigation',
    detectedAt: '2026-10-07 16:45'
  }
];

export const INITIAL_AUDITOR_REVIEWS = [
  {
    id: 'AUD-REV-201',
    project: 'Riverside Commercial Tower A',
    milestone: 'Ground Floor Columns Steel Placement',
    submittedBy: 'Rajesh Varma (Site Supervisor)',
    auditType: 'Computer-Vision Photo & Rebar Verification',
    claimedPercentage: 90,
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800',
    aiConfidence: 94.8,
    detectedItems: ['Vertical Rebar 20mm (16/16 Present)', 'Tie Spacing 150mm (Compliant)', 'Concrete Cover 40mm'],
    status: 'Pending Review',
    submittedAt: '2026-10-09 09:20'
  },
  {
    id: 'AUD-REV-202',
    project: 'Metro Line 3 Sub-Station',
    milestone: 'Basement Retaining Wall Concrete Pour',
    submittedBy: 'Suresh Mehta (Store Incharge)',
    auditType: 'Material Reconciliation & Challan Audit',
    claimedPercentage: 100,
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    aiConfidence: 98.2,
    detectedItems: ['M40 Grade RMC Batch Verified', 'Slump 120mm Verified', 'No Segregation Detected'],
    status: 'Approved',
    submittedAt: '2026-10-08 17:10'
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'REP-2026-101',
    title: 'Basement Retaining Wall Compliance Certificate',
    project: 'Metro Line 3 Sub-Station',
    milestone: 'Basement Retaining Wall Concrete Pour',
    auditId: 'AUD-REV-202',
    auditType: 'Material Reconciliation & Structural Certification',
    generatedDate: '2026-10-08 17:30',
    auditor: 'Pooja Iyer, Lead Quality Auditor',
    contractor: 'Metro Infrastructure Corp',
    verdict: 'Approved for Billing',
    status: 'Certification Completed',
    keyFindings: [
      'Auditor Verdict: Approved',
      'Structural integrity matches 100% of engineering specification.',
      'Material challan reconciliation clean with 0% net unexplained variance.'
    ],
    reconciliationData: {
      material: 'M40 Ready Mix Concrete',
      challanQty: '450 m³',
      receivedQty: '450 m³',
      openingStock: '0 m³',
      closingStock: '0 m³',
      consumedRecorded: '450 m³',
      consumedPhysical: '450 m³',
      variance: '0%'
    }
  }
];
