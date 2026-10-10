<<<<<<< HEAD
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
=======
// BuildVerify AI - Sample Data & Initial State for Construction Audits

export const INITIAL_PROJECTS = [
  { id: 'PRJ-101', name: 'Skyline Heights Tower B', location: 'Sector 62, Gurgaon', contractor: 'Apex Infracon Pvt Ltd', client: 'Skyline Real Estate Developers', status: 'Active' },
  { id: 'PRJ-102', name: 'Metro Corridor Phase 2', location: 'Pier 42 - 58, Outer Ring Road', contractor: 'L&T Heavy Civil Infra', client: 'Delhi Metro Rail Corp', status: 'Active' },
  { id: 'PRJ-103', name: 'Riverfront Commercial Hub', location: 'Block C, Gomti Nagar', contractor: 'Shapoorji Pallonji EPC', client: 'Urban Development Authority', status: 'Active' },
  { id: 'PRJ-104', name: 'Greenfield Warehouse Park', location: 'Plot 18, Chakan Industrial Area', contractor: 'Prestige Warehousing Ltd', client: 'Nexus Logistics Hub', status: 'Review Pending' }
];

export const INITIAL_DASHBOARD_STATS = {
  totalMilestones: 34,
  verifiedMilestones: 22,
  pendingReviews: 8,
  materialDiscrepancies: 4,
  progressPercentage: 68.5,
  totalAuditedSpend: '$4,820,000'
};

export const MILESTONE_PROGRESS_DATA = [
  { name: 'Foundation & Footings', claimed: 100, verified: 100, variance: 0 },
  { name: 'Substructure Columns', claimed: 100, verified: 95, variance: -5 },
  { name: 'Basement 1 Slab', claimed: 100, verified: 100, variance: 0 },
  { name: 'Podium Level Slab', claimed: 90, verified: 85, variance: -5 },
  { name: 'Tower Floor 1-5 Columns', claimed: 85, verified: 80, variance: -5 },
  { name: 'Tower Floor 6 Slab Pour', claimed: 75, verified: 60, variance: -15 },
  { name: 'External Brick Masonry L3', claimed: 65, verified: 45, variance: -20 },
  { name: 'Internal Gypsum Plastering', claimed: 40, verified: 25, variance: -15 }
];

export const MATERIAL_CONSUMPTION_DATA = [
  { material: 'OPC 53 Cement (Bags)', planned: 12000, recorded: 12850, reconciled: 13420, unit: 'Bags' },
  { material: 'Fe500D TMT Steel (MT)', planned: 450, recorded: 462, reconciled: 478, unit: 'Tonnes' },
  { material: 'RMC M30 Grade (m³)', planned: 2800, recorded: 2890, reconciled: 2940, unit: 'm³' },
  { material: 'River Sand Zone II (MT)', planned: 950, recorded: 1040, reconciled: 1110, unit: 'Tonnes' },
  { material: 'Red Clay Bricks (1k pcs)', planned: 180, recorded: 195, reconciled: 215, unit: '1k units' }
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
];

export const SAMPLE_PHOTO_PRESETS = [
  {
<<<<<<< HEAD
    id: 'PRESET-1',
    title: 'Column Steel Placement (80%)',
    project: 'Riverside Commercial Tower A',
    location: 'Grid A1-B4 Ground Floor',
    milestone: 'Columns',
    claimedPercentage: 80,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800',
    mockResult: {
      claimedMilestone: 'Ground Floor Columns Verification',
=======
    id: 'preset-slab-mesh',
    title: 'Tower B - 6th Floor Slab Reinforcement Grid',
    project: 'Skyline Heights Tower B',
    location: 'Grid B3 to E6, 6th Floor Pour Area',
    milestone: 'Slab',
    claimedPercentage: 80,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    mockResult: {
      claimedMilestone: 'Slab Reinforcement Grid & Conduiting',
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
      assessmentStatus: 'Evidence Supports Claim',
      confidenceScore: 92,
      estimatedProgressRange: '75% - 82%',
      visibleEvidence: [
<<<<<<< HEAD
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
=======
        'Dual-layer 12mm Fe500D bottom mesh installed at 150mm c/c spacing',
        'PVC electrical conduit runs secured with binding wire at regular intervals',
        'PVC cover blocks (25mm) positioned under bottom rebar reinforcement',
        'Drop panel reinforcement placed around interior columns C3 & C4'
      ],
      missingEvidence: [
        'Shear stud reinforcement around elevator core perimeter partially obscured by cover tarp',
        'Formwork kickers on eastern cantilever slab edge not captured in camera perspective'
      ],
      recommendation: 'Visual evidence supports >75% slab preparation claim. Recommend supplementary spot-check photo of eastern perimeter formwork alignment before issuing pour permit.',
      notes: 'Model analysis indicates high concordance with engineer drawings REV-04.'
    }
  },
  {
    id: 'preset-column-pour',
    title: 'Metro Pier 48 - Column De-shuttering & Surface Finish',
    project: 'Metro Corridor Phase 2',
    location: 'Pier 48 North Column Stem',
    milestone: 'Columns',
    claimedPercentage: 95,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    mockResult: {
      claimedMilestone: 'Substructure Column Concrete Pour & Curing',
      assessmentStatus: 'Needs Additional Evidence',
      confidenceScore: 78,
      estimatedProgressRange: '60% - 70%',
      visibleEvidence: [
        'Formwork successfully removed from main column shaft',
        'Column plumbness appears visually vertical along primary axis',
        'Wet burlap sacking visible on upper 2 meters indicating active curing'
      ],
      missingEvidence: [
        'Hessian curing wrapping is missing on lower 1.8 meters of stem',
        'Minor surface honeycombing detected near base joint; requires rebound hammer non-destructive testing',
        'Curing date-tag stamp not legible at this resolution'
      ],
      recommendation: 'Request high-resolution macro shot of column base pour line and mandatory submission of 7-day cube test lab certificate before approving 95% milestone claim.',
      notes: 'Uncured bottom section poses potential moisture loss risk under current 34°C ambient weather.'
    }
  },
  {
    id: 'preset-brickwork-l3',
    title: 'Riverfront Hub - External Brickwork Masonry Level 3',
    project: 'Riverfront Commercial Hub',
    location: 'South Facade, Floor 3 Grid 1-7',
    milestone: 'Brickwork',
    claimedPercentage: 70,
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    mockResult: {
      claimedMilestone: 'External Red Clay Brick Masonry (230mm)',
      assessmentStatus: 'Claim Requires Review',
      confidenceScore: 84,
      estimatedProgressRange: '40% - 48%',
      visibleEvidence: [
        'Brick courses completed up to sill height (approx 900mm from FFL)',
        '1:4 cement-sand mortar bedding visible in horizontal bed joints',
        'DPC (Damp Proof Course) membrane visible at plinth level'
      ],
      missingEvidence: [
        'Contractor claimed 70% completion (lintel level complete), but lintel band and upper masonry are entirely missing',
        'Wall tie anchors connecting to RCC column face are not observable at specified 400mm vertical intervals'
      ],
      recommendation: 'Claimed 70% exceeds visible progress by ~25%. Flag for joint physical inspection with sub-contractor representative before releasing running bill #07 payment.',
      notes: 'Discrepancy exceeds standard 10% threshold.'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    }
  }
];

export const INITIAL_MATERIAL_AUDITS = [
  {
<<<<<<< HEAD
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
=======
    id: 'MAT-2026-081',
    date: '2026-10-06',
    project: 'Skyline Heights Tower B',
    material: 'Ultratech OPC 53 Cement',
    unit: 'Bags',
    supplier: 'Apex Building Solutions Ltd',
    challanNo: 'CH-2026-8841',
    challanQty: 1000,
    receivedQty: 960,
    deliveryDiscrepancy: -40,
    openingStock: 250,
    deliveredQty: 960,
    supplierReturns: 10,
    closingPhysicalStock: 320,
    availableMaterial: 1200, // 250 + 960 - 10
    estimatedUsed: 880,      // 1200 - 320
    recordedConsumption: 760,
    consumptionVariance: 120, // 880 - 760
    variancePercent: 15.8,
    status: 'High Discrepancy',
    verifiedBy: 'S. Mehta (Site Stores)',
    notes: '40 bags damaged during transport; 120 bags consumption variance exceeds 5% wastage allowance. Requires batching plant log audit.'
  },
  {
    id: 'MAT-2026-082',
    date: '2026-10-07',
    project: 'Metro Corridor Phase 2',
    material: 'Tata Tiscon Fe500D 20mm Rebar',
    unit: 'Tonnes',
    supplier: 'Tata Tiscon Direct Infra',
    challanNo: 'CH-TT-99321',
    challanQty: 42.5,
    receivedQty: 42.4,
    deliveryDiscrepancy: -0.1,
    openingStock: 12.0,
    deliveredQty: 42.4,
    supplierReturns: 0.0,
    closingPhysicalStock: 18.2,
    availableMaterial: 54.4,
    estimatedUsed: 36.2,
    recordedConsumption: 35.8,
    consumptionVariance: 0.4,
    variancePercent: 1.1,
    status: 'Verified Normal',
    verifiedBy: 'A. Rao (QC Lead)',
    notes: 'Weighbridge slip matches challan within permissible ±0.25% weighbridge tolerance. Consumption aligned with Bar Bending Schedule (BBS).'
  },
  {
    id: 'MAT-2026-083',
    date: '2026-10-08',
    project: 'Riverfront Commercial Hub',
    material: 'Ready Mix Concrete M30',
    unit: 'm³',
    supplier: 'ACC Concrete Express',
    challanNo: 'RMC-ACC-4412',
    challanQty: 180,
    receivedQty: 172,
    deliveryDiscrepancy: -8,
    openingStock: 0,
    deliveredQty: 172,
    supplierReturns: 4,
    closingPhysicalStock: 0,
    availableMaterial: 168,
    estimatedUsed: 168,
    recordedConsumption: 154,
    consumptionVariance: 14,
    variancePercent: 9.1,
    status: 'Moderate Discrepancy',
    verifiedBy: 'K. Verma (Field Eng)',
    notes: 'Transit mixer rejected due to initial slump loss past 90 mins limit (4 m³ returned). Slump variance at pump hopper requires batch sheet reconciliation.'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  }
];

export const INITIAL_ANOMALIES = [
  {
    id: 'ANOM-101',
<<<<<<< HEAD
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
=======
    project: 'Skyline Heights Tower B',
    material: 'Ultratech OPC 53 Cement',
    anomalyType: 'Consumption Exceeds Allowance',
    expectedValue: '760 Bags (Pour Design + 3% allowance)',
    observedValue: '880 Bags (Physical Stock Reconciliation)',
    variance: '+120 Bags (+15.8%)',
    severity: 'High',
    explanation: 'Physical stock reconciliation indicates 880 bags depleted from site store, whereas recorded daily site pour log only accounts for 760 bags. Discrepancy exceeds standard 5% mortar/grout tolerance.',
    recommendedAction: 'Audit Subcontractor C-3 cement issuance register; cross-reference batching plant automated scale logs for the 6th floor slab pour.',
    status: 'Under Investigation',
    detectedAt: '2026-10-06 17:40'
  },
  {
    id: 'ANOM-102',
    project: 'Riverfront Commercial Hub',
    material: 'Ready Mix Concrete M30',
    anomalyType: 'Delivery Discrepancy & Slump Rejection',
    expectedValue: '180 m³ Declared on Challan',
    observedValue: '168 m³ Usable Delivered Concrete',
    variance: '-12 m³ (-6.7%)',
    severity: 'Medium',
    explanation: 'Delivery batch slip indicated 180 m³, but site gate weighed in 172 m³. Furthermore, 1 transit mixer (4 m³) was rejected at site entry due to exceeding the 120-minute hydration window.',
    recommendedAction: 'Issue debit note to ACC Concrete Express for 8 m³ shortfall and ensure credit adjustment for 4 m³ returned batch before billing clearance.',
    status: 'Open',
    detectedAt: '2026-10-08 14:15'
  },
  {
    id: 'ANOM-103',
    project: 'Metro Corridor Phase 2',
    material: 'River Sand Zone II',
    anomalyType: 'Repeated Weight Shortages',
    expectedValue: '35.0 MT per Tipper Vehicle',
    observedValue: '32.1 MT Average Net Weight',
    variance: '-2.9 MT / trip (-8.3%)',
    severity: 'High',
    explanation: 'Three consecutive deliveries from supplier Apex Minerals exhibited net weighbridge tare shortages exceeding the standard moisture bulk tolerance.',
    recommendedAction: 'Conduct random weight verification at independent calibrated public weighbridge; suspend supplier delivery slot pending calibration audit.',
    status: 'Open',
    detectedAt: '2026-10-07 11:20'
  },
  {
    id: 'ANOM-104',
    project: 'Greenfield Warehouse Park',
    material: 'Structural Steel I-Beams (ISMB 350)',
    anomalyType: 'Missing Mill Test Certificate & Heat No.',
    expectedValue: 'Valid MTC with Heat #9928A',
    observedValue: 'Challan missing Heat Stamp & Ingot Tag',
    variance: 'Documentary Non-compliance',
    severity: 'Low',
    explanation: 'Structural steel delivery arrived at site with delivery challan but lacked the mandatory certified manufacturer Mill Test Certificate (MTC) matching bundle tags.',
    recommendedAction: 'Quarantine steel stack at designated laydown yard; withhold installation permit until supplier submits NABL certified chemical & tensile test certificate.',
    status: 'Resolved',
    detectedAt: '2026-10-05 09:30'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  }
];

export const INITIAL_AUDITOR_REVIEWS = [
  {
<<<<<<< HEAD
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
=======
    id: 'AUD-2026-041',
    project: 'Skyline Heights Tower B',
    auditType: 'Photo Milestone Verification',
    milestone: 'Tower Floor 6 Slab Pour Preparation',
    claimedPercentage: 80,
    submittedBy: 'Er. Rajesh Sharma (Site Incharge)',
    submissionDate: '2026-10-08 16:30',
    status: 'Pending Review',
    riskLevel: 'Medium',
    aiSummary: 'Evidence supports ~75% reinforcement completion. Missing visual check on eastern edge formwork kickers.',
    materialSummary: 'Cement consumption discrepancy (+15.8%) flagged on same pour zone.',
    evidenceImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    auditorDecision: null,
    auditorNotes: '',
    decisionDate: null
  },
  {
    id: 'AUD-2026-042',
    project: 'Metro Corridor Phase 2',
    auditType: 'Material Reconciliation',
    milestone: 'Pier 42-48 Foundation Pile Caps',
    claimedPercentage: 100,
    submittedBy: 'Er. Sandeep Nair (Quantity Surveyor)',
    submissionDate: '2026-10-07 18:10',
    status: 'Approved',
    riskLevel: 'Low',
    aiSummary: 'Rebar BBS reconciliation confirmed within 1.1% tolerance. Cube testing reports passed at 28-day 45MPa.',
    materialSummary: 'Tata Tiscon 42.4 MT steel reconciled against weighbridge slips.',
    evidenceImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    auditorDecision: 'Approved',
    auditorNotes: 'All NABL test certificates verified. Weight slips match challan. Approved for payment certification.',
    decisionDate: '2026-10-08 10:15'
  },
  {
    id: 'AUD-2026-043',
    project: 'Riverfront Commercial Hub',
    auditType: 'Photo Milestone Verification',
    milestone: 'External Brick Masonry Level 3',
    claimedPercentage: 70,
    submittedBy: 'Vikas Gupta (Contractor Rep)',
    submissionDate: '2026-10-08 11:45',
    status: 'More Evidence Required',
    riskLevel: 'High',
    aiSummary: 'Visible progress corresponds to 40%-48%. Upper courses and lintel band not started despite 70% claim.',
    materialSummary: 'Brick batch challan indicates 25,000 bricks delivered, but only ~14,000 visible in laid work.',
    evidenceImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    auditorDecision: 'More Evidence Required',
    auditorNotes: 'Submitted photos only verify sill-height masonry. Please submit panoramic elevations of grids 4 through 7 and lintel casting records to substantiate 70% claim.',
    decisionDate: '2026-10-08 15:20'
  },
  {
    id: 'AUD-2026-044',
    project: 'Greenfield Warehouse Park',
    auditType: 'Challan OCR & Inventory Audit',
    milestone: 'Pre-Engineered Building Rafters',
    claimedPercentage: 50,
    submittedBy: 'Amitabh Sen (Store Keeper)',
    submissionDate: '2026-10-05 14:00',
    status: 'Rejected',
    riskLevel: 'High',
    aiSummary: 'OCR extracted challan missing Heat Numbers and Mill Test Certificates for 18 ISMB 350 rafters.',
    materialSummary: 'Weight tolerance discrepancy (-8.3%) detected across 3 transport trucks.',
    evidenceImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    auditorDecision: 'Rejected',
    auditorNotes: 'Cannot certify milestone or release supplier invoice without verifiable MTCs complying with IS 2062 Grade E250 specifications.',
    decisionDate: '2026-10-06 11:30'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
  }
];

export const INITIAL_REPORTS = [
  {
<<<<<<< HEAD
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
=======
    id: 'REP-2026-001',
    title: 'Milestone & Material Comprehensive Audit - Floor 6 Slab',
    project: 'Skyline Heights Tower B',
    milestone: 'Tower Floor 6 Slab Pour Preparation',
    auditId: 'AUD-2026-041',
    auditType: 'Integrated Photo & Material Audit',
    generatedDate: '2026-10-08 19:00',
    auditor: 'Pooja Iyer, Lead Quality Auditor',
    contractor: 'Apex Infracon Pvt Ltd',
    verdict: 'Conditional Review',
    status: 'Review Completed',
    keyFindings: [
      'Visual rebar density conforms to drawing REV-04 across grids B3 to E6.',
      'Material inventory analysis flagged an unexplained +120 bags (+15.8%) cement variance.',
      'Formwork edge kickers require supplementary photographic sign-off before concrete pour.'
    ],
    reconciliationData: {
      material: 'Ultratech OPC 53 Cement',
      challanQty: '1000 Bags',
      receivedQty: '960 Bags',
      openingStock: '250 Bags',
      closingStock: '320 Bags',
      consumedRecorded: '760 Bags',
      consumedPhysical: '880 Bags',
      variance: '+120 Bags (+15.8%)'
    }
  },
  {
    id: 'REP-2026-002',
    title: 'Foundation Pile Cap Rebar & Concrete Certification',
    project: 'Metro Corridor Phase 2',
    milestone: 'Pier 42-48 Foundation Pile Caps',
    auditId: 'AUD-2026-042',
    auditType: 'Material Reconciliation & Structural Certification',
    generatedDate: '2026-10-08 10:30',
    auditor: 'Pooja Iyer, Lead Quality Auditor',
    contractor: 'L&T Heavy Civil Infra',
    verdict: 'Approved for Billing',
    status: 'Approved',
    keyFindings: [
      '42.4 Tonnes Fe500D steel fully reconciled against digital weighbridge tickets (1.1% variance).',
      '28-day concrete cube compression tests met M45 strength criterion (avg 49.2 MPa).',
      'Milestone 100% completion verified with geometric survey coordinates.'
    ],
    reconciliationData: {
      material: 'Tata Tiscon Fe500D 20mm Rebar',
      challanQty: '42.5 MT',
      receivedQty: '42.4 MT',
      openingStock: '12.0 MT',
      closingStock: '18.2 MT',
      consumedRecorded: '35.8 MT',
      consumedPhysical: '36.2 MT',
      variance: '+0.4 MT (+1.1%)'
    }
  },
  {
    id: 'REP-2026-003',
    title: 'Interim Masonry Claim Audit - South Elevation',
    project: 'Riverfront Commercial Hub',
    milestone: 'External Brick Masonry Level 3',
    auditId: 'AUD-2026-043',
    auditType: 'Photographic & Quantity Progress Audit',
    generatedDate: '2026-10-08 16:00',
    auditor: 'Pooja Iyer, Lead Quality Auditor',
    contractor: 'Shapoorji Pallonji EPC',
    verdict: 'More Evidence Required',
    status: 'Action Required',
    keyFindings: [
      'Claimed 70% completion is not substantiated by observable evidence (estimated 40%-48%).',
      'Brick delivery count of 25,000 units is only partially consumed into in-situ masonry (~14,000 units).',
      'Contractor requested to furnish supplementary photos of completed lintel sections before invoice certification.'
    ],
    reconciliationData: {
      material: 'Red Clay Bricks Class I',
      challanQty: '25,000 Pcs',
      receivedQty: '25,000 Pcs',
      openingStock: '5,000 Pcs',
      closingStock: '16,000 Pcs',
      consumedRecorded: '20,000 Pcs',
      consumedPhysical: '14,000 Pcs',
      variance: '-6,000 Pcs (-30.0%)'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    }
  }
];
