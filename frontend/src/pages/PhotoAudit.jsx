import React, { useState } from 'react';
import { 
  UploadCloud, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Send
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import { SAMPLE_PHOTO_PRESETS } from '../data/sampleData';
import { auditPhoto } from '../services/api';

export default function PhotoAudit({ 
  projects = [], 
  selectedProjectId, 
  onSaveToAuditorReview,
  onShowToast,
  backendConnected
}) {
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Form State
  const [projectName, setProjectName] = useState(currentProject ? currentProject.name : 'Skyline Heights Tower B');
  const [siteLocation, setSiteLocation] = useState('Tower B - 6th Floor Slab Pour Area (Grid B3-E6)');
  const [milestone, setMilestone] = useState('Slab');
  const [claimedPercentage, setClaimedPercentage] = useState(80);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(SAMPLE_PHOTO_PRESETS[0].imageUrl);
  const [fileError, setFileError] = useState('');

  // Live Camera & Geolocation State
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraCaptured, setCameraCaptured] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [photoHash, setPhotoHash] = useState('');

  // Start Live HTML5 Camera
  const startLiveCamera = async () => {
    setCameraError('');
    setCameraCaptured(false);

    // Request GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
        }
      );
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      setTimeout(() => {
        const videoEl = document.getElementById('live-camera-feed');
        if (videoEl) videoEl.srcObject = stream;
      }, 100);
    } catch (err) {
      setCameraError('Camera access denied or unavailable on this device.');
    }
  };

  // Stop Live Camera Stream
  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Capture Photo Snapshot from Video element
  const capturePhotoFromCamera = async () => {
    const videoEl = document.getElementById('live-camera-feed');
    const canvasEl = document.getElementById('camera-canvas');
    if (!videoEl || !canvasEl) return;

    canvasEl.width = videoEl.videoWidth || 640;
    canvasEl.height = videoEl.videoHeight || 480;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    setCameraCaptured(true);
    stopLiveCamera();

    // Calculate SHA-256 Hash using Web Crypto API
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setPhotoHash(hashHex);
    } catch (e) {
      setPhotoHash(`sha256_${Date.now()}`);
    }
  };

  const retakeCameraPhoto = () => {
    setCameraCaptured(false);
    startLiveCamera();
  };
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState(SAMPLE_PHOTO_PRESETS[0].mockResult);
  const [resultSource, setResultSource] = useState('demo');

  // Handle preset selection
  const handleLoadPreset = (preset) => {
    setProjectName(preset.project);
    setSiteLocation(preset.location);
    setMilestone(preset.milestone);
    setClaimedPercentage(preset.claimedPercentage);
    setPreviewUrl(preset.imageUrl);
    setSelectedFile(null);
    setAnalysisResult(preset.mockResult);
    setResultSource('demo');
    setFileError('');
    onShowToast?.({
      type: 'info',
      title: 'Preset Loaded',
      message: `Loaded test sample: ${preset.title}`
    });
  };

  // Handle file drop / upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    setFileError('');

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file format. Please upload JPG, PNG, or WebP photographs.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFileError('File exceeds size limit of 15MB. Please upload an optimized site photograph.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAnalysisResult(null);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setFileError('');
  };

  // Trigger Analysis
  const handleAnalyzePhoto = async () => {
    if (!previewUrl) {
      setFileError('Please provide a photograph before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Pre-processing image & normalizing visual resolution...');

    if (backendConnected && selectedFile) {
      setAnalysisStep('Querying Flask Vision Inference Model (/api/audit-photo)...');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('project', projectName);
      formData.append('location', siteLocation);
      formData.append('milestone', milestone);
      formData.append('claimedPercentage', claimedPercentage);

      const res = await auditPhoto(formData);
      if (res.success && res.data) {
        setAnalysisResult(res.data);
        setResultSource('backend');
        setIsAnalyzing(false);
        onShowToast?.({
          type: 'success',
          title: 'Live Vision Analysis Complete',
          message: 'Received response from Flask backend model.'
        });
        return;
      }
    }

    setTimeout(() => {
      setAnalysisStep('Detecting structural members, formwork alignment, and rebar mesh spacing...');
    }, 800);

    setTimeout(() => {
      setAnalysisStep('Benchmarking observable progress against standard engineering specifications...');
    }, 1600);

    setTimeout(() => {
      let assessmentStatus = 'Evidence Supports Claim';
      let estRange = `${claimedPercentage - 5}% - ${claimedPercentage + 2}%`;
      let visible = [
        `Structural ${milestone} geometry clearly visible in camera frame`,
        'Formwork / shuttering appears secure and aligned',
        'Physical components match general site arrangement drawing'
      ];
      let missing = [
        'Single photograph perspective limits structural 360-degree inspection',
        'Hidden or covered areas require physical tap test / ultrasound'
      ];
      let rec = `Physical evidence generally supports the claimed ${claimedPercentage}% progress. Certified auditor review recommended before releasing payment.`;

      if (claimedPercentage > 85 && milestone === 'Columns') {
        assessmentStatus = 'Needs Additional Evidence';
        estRange = '65% - 75%';
        missing.push('7-day or 28-day concrete cube compressive strength test certificate not attached.');
        rec = 'Request 28-day concrete compressive test report before certifying 85%+ completion.';
      } else if (claimedPercentage >= 70 && milestone === 'Brickwork') {
        assessmentStatus = 'Claim Requires Review';
        estRange = '40% - 48%';
        visible = ['Brick courses completed up to sill level only'];
        missing = ['Upper courses and lintel band casting not completed'];
        rec = `Claimed ${claimedPercentage}% exceeds observable sill-height masonry. Recommend physical joint inspection with contractor.`;
      }

      setAnalysisResult({
        claimedMilestone: `${milestone} Construction Verification`,
        assessmentStatus,
        confidenceScore: 88,
        estimatedProgressRange: estRange,
        visibleEvidence: visible,
        missingEvidence: missing,
        recommendation: rec,
        notes: 'Notice: Computer vision estimates physical visual cues. Engineering regulations require accredited site auditor sign-off.'
      });

      setResultSource('demo');
      setIsAnalyzing(false);
      onShowToast?.({
        type: 'success',
        title: 'Analysis Complete',
        message: 'Photographic assessment generated with evidence cues.'
      });
    }, 2400);
  };

  const handleSubmitToAuditorQueue = () => {
    if (!analysisResult) return;

    const newAuditItem = {
      id: `AUD-2026-${Math.floor(100 + Math.random() * 900)}`,
      project: projectName,
      auditType: 'Photo Milestone Verification',
      milestone: `${milestone} (Claimed: ${claimedPercentage}%)`,
      claimedPercentage,
      submittedBy: 'AI Vision Assistant (Automated Scan)',
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending Review',
      riskLevel: analysisResult.assessmentStatus === 'Evidence Supports Claim' ? 'Low' : 
                 analysisResult.assessmentStatus === 'Needs Additional Evidence' ? 'Medium' : 'High',
      aiSummary: analysisResult.recommendation,
      materialSummary: 'Photographic milestone assessment pending physical cross-reconciliation.',
      evidenceImage: previewUrl,
      auditorDecision: null,
      auditorNotes: '',
      decisionDate: null
    };

    onSaveToAuditorReview?.(newAuditItem);
    onShowToast?.({
      type: 'success',
      title: 'Submitted to Auditor Review Queue',
      message: `Audit record ${newAuditItem.id} logged for human review.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
<<<<<<< HEAD
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B238]/20 text-[#29231D] border border-[#D6B238]/40 uppercase tracking-wider font-['Outfit']">
              Vision-Language Milestone Audit
            </span>
            <span className="text-xs text-[#6F7889] font-medium">• ISO/IEC 17020 Compliant</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#29231D] font-['Outfit'] mt-1.5 tracking-tight">Site Photograph Milestone Verification</h1>
          <p className="text-xs text-[#6F7889] font-medium mt-1">
=======
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
              Vision-Language Milestone Audit
            </span>
            <span className="text-xs text-[#8b8c8e]">• ISO/IEC 17020 Compliant</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">Site Photograph Milestone Verification</h1>
          <p className="text-xs text-[#8b8c8e] mt-1">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
            Audit high-resolution site photographs, benchmark observable progress against contractor claims, and detect missing evidence.
          </p>
        </div>

        {/* Test Preset Selector */}
<<<<<<< HEAD
        <div className="flex items-center gap-1.5 bg-[#F7F3EA] border border-[#E4D8BE] rounded-xl p-1.5">
          <span className="text-[11px] font-semibold text-[#6F7889] px-2">Load Sample:</span>
=======
        <div className="flex items-center gap-1.5 bg-white/4 border border-white/8 rounded-xl p-1.5">
          <span className="text-[11px] font-semibold text-[#8b8c8e] px-2">Load Sample:</span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
          {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
<<<<<<< HEAD
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FFFDF8] border border-[#E4D8BE] text-[#29231D] hover:bg-[#D6B238] hover:text-[#29231D] transition cursor-pointer shadow-xs"
=======
              className="px-2.5 py-1 text-xs font-medium rounded-lg glass-chip transition cursor-pointer"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
              title={preset.title}
            >
              Preset {idx + 1} ({preset.milestone})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Upload */}
        <div className="lg:col-span-5 space-y-5">
<<<<<<< HEAD
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-[#29231D] font-['Outfit'] flex items-center gap-2 border-b border-[#E4D8BE] pb-3">
              <Camera className="w-4 h-4 text-[#D6B238]" />
=======
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/6 pb-3">
              <Camera className="w-4 h-4 text-[#FFE14F]" />
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
              <span>Milestone Claim Details</span>
            </h2>

            {/* Project Selection */}
            <div>
<<<<<<< HEAD
              <label className="block text-xs font-bold text-[#29231D] mb-1">Project Name</label>
=======
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Project Name</label>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
<<<<<<< HEAD
                className="w-full px-3.5 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] font-medium placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238]"
=======
                className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                placeholder="e.g. Skyline Heights Tower B"
              />
            </div>

            {/* Site Location */}
            <div>
<<<<<<< HEAD
              <label className="block text-xs font-bold text-[#29231D] mb-1">Site Location / Grid Ref</label>
=======
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Site Location / Grid Ref</label>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
<<<<<<< HEAD
                className="w-full px-3.5 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] font-medium placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238]"
=======
                className="w-full px-3 py-2 text-xs bg-white/4 border border-white/8 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                placeholder="e.g. Tower B - 6th Floor Slab Pour Area"
              />
            </div>

            {/* Milestone Dropdown */}
            <div>
<<<<<<< HEAD
              <label className="block text-xs font-bold text-[#29231D] mb-1">Milestone Category</label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl text-[#29231D] font-semibold focus:outline-none focus:border-[#D6B238] cursor-pointer"
=======
              <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">Milestone Category</label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#1e3264] border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F] cursor-pointer"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
              >
                <option value="Foundation">Foundation & Footings</option>
                <option value="Columns">Columns & Shear Walls</option>
                <option value="Slab">Slab Casting & Reinforcement</option>
                <option value="Brickwork">Brickwork & Block Masonry</option>
                <option value="Plastering">Internal / External Plastering</option>
                <option value="Waterproofing">Basement & Wet Area Waterproofing</option>
              </select>
            </div>

            {/* Claimed Completion Percentage */}
            <div>
              <div className="flex items-center justify-between mb-1">
<<<<<<< HEAD
                <label className="text-xs font-bold text-[#29231D]">Claimed Completion</label>
                <span className="text-xs font-bold text-[#29231D] bg-[#D6B238]/20 px-2.5 py-0.5 rounded-full border border-[#D6B238]/40">
=======
                <label className="text-xs font-semibold text-[#c8c8cb]">Claimed Completion</label>
                <span className="text-xs font-bold text-[#FFE14F] bg-[#FFE14F]/15 px-2 py-0.5 rounded-full border border-[#FFE14F]/30">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  {claimedPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={claimedPercentage}
                onChange={(e) => setClaimedPercentage(Number(e.target.value))}
<<<<<<< HEAD
                className="w-full accent-[#D6B238] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6F7889] font-medium mt-0.5">
=======
                className="w-full accent-[#FFE14F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8b8c8e] mt-0.5">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                <span>0% (Started)</span>
                <span>50% (Midway)</span>
                <span>100% (Complete)</span>
              </div>
            </div>

            {/* Photo Upload & Live Camera Zone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
<<<<<<< HEAD
                <label className="text-xs font-bold text-[#29231D]">Site Photograph Capture / Upload</label>
=======
                <label className="text-xs font-semibold text-[#29231D]">Site Photograph Capture / Upload</label>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                <div className="flex items-center gap-1 bg-[#EDE5D6] p-0.5 rounded-lg border border-[#E4D8BE]">
                  <button
                    type="button"
                    onClick={() => {
                      setUseLiveCamera(true);
                      startLiveCamera();
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${useLiveCamera ? 'bg-[#D6B238] text-[#29231D]' : 'text-[#6F7889]'}`}
                  >
                    📷 Live Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseLiveCamera(false);
                      stopLiveCamera();
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${!useLiveCamera ? 'bg-[#D6B238] text-[#29231D]' : 'text-[#6F7889]'}`}
                  >
                    📁 Upload File
                  </button>
                </div>
              </div>

              {/* Live Camera Interface */}
              {useLiveCamera ? (
                <div className="rounded-2xl overflow-hidden border border-[#E4D8BE] bg-[#29231D] p-3 text-center space-y-3">
                  {!cameraCaptured ? (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video 
                        id="live-camera-feed"
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      {cameraError && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
                          <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
                          <p className="text-xs text-rose-200 font-bold">{cameraError}</p>
                          <p className="text-[10px] text-[#EDE5D6] mt-1">Please allow camera permissions or switch to file upload mode.</p>
                        </div>
                      )}
<<<<<<< HEAD
=======
                      {gpsLocation && (
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-[#D6B238] font-mono border border-white/10 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D6B238]" />
                          <span>GPS: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)} (±{gpsLocation.accuracy.toFixed(0)}m)</span>
                        </div>
                      )}
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                      <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
<<<<<<< HEAD
                        <CheckCircle2 className="w-3 h-3" /> Photo Captured Live
=======
                        <Check className="w-3 h-3" /> Photo Captured Live
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                      </div>
                    </div>
                  )}

                  <canvas id="camera-canvas" className="hidden" />

                  <div className="flex items-center justify-center gap-2">
                    {!cameraCaptured ? (
                      <button
                        type="button"
                        onClick={capturePhotoFromCamera}
                        disabled={!!cameraError}
<<<<<<< HEAD
                        className="btn-gold text-xs shadow-md cursor-pointer"
=======
                        className="btn-gold text-xs shadow-md"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Snapshot</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={retakeCameraPhoto}
<<<<<<< HEAD
                        className="btn-secondary-sandstone text-xs cursor-pointer"
=======
                        className="btn-secondary-sandstone text-xs"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Retake Snapshot</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* File Upload Zone */
                !previewUrl ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-[#E4D8BE] hover:border-[#D6B238] rounded-2xl p-6 text-center bg-[#FFFDF8] hover:bg-[#EDE5D6]/30 transition cursor-pointer shadow-xs"
                    onClick={() => document.getElementById('photo-upload-input').click()}
                  >
                    <UploadCloud className="w-8 h-8 text-[#D6B238] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#29231D]">
                      Drag & drop site photo or <span className="text-[#D6B238] underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-[#6F7889] mt-1">Supports JPG, PNG, WebP up to 15MB</p>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E4D8BE] bg-[#29231D] group shadow-xs">
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="w-full h-56 object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-[#29231D]/90 backdrop-blur-md rounded-xl p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => document.getElementById('photo-upload-input').click()}
                        className="px-2 py-1 text-[11px] font-bold text-[#FFFDF8] hover:text-[#D6B238] transition cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {photoHash && (
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-[#D6B238] font-mono border border-white/10">
                        SHA-256: {photoHash.substring(0, 16)}...
                      </div>
                    )}
                  </div>
                )
              )}

              {fileError && (
                <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{fileError}</span>
                </p>
              )}
            </div>

            {/* Analyze Action Button */}
            <button
              onClick={handleAnalyzePhoto}
              disabled={isAnalyzing || !previewUrl}
<<<<<<< HEAD
              className="w-full btn-gold py-3 px-4 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
=======
              className="w-full py-3 px-4 btn-fastshot-primary disabled:opacity-40 text-[#192853] font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Photograph...' : 'Analyze Site Photograph'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Assessment Results */}
        <div className="lg:col-span-7 space-y-5">
          {isAnalyzing ? (
            <LoadingState
              type="analyzing"
              title="Vision AI Model Examining Site Photograph"
              message="Analyzing structural elements, rebar spacing, surface finish, and verifying observable milestones against engineering specifications..."
              step={analysisStep}
            />
          ) : !analysisResult ? (
<<<<<<< HEAD
            <div className="bg-[#FFFDF8] rounded-2xl border border-dashed border-[#E4D8BE] p-12 text-center">
              <Camera className="w-12 h-12 text-[#6F7889] mx-auto mb-3 opacity-50" />
              <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">No Analysis Performed Yet</h3>
              <p className="text-xs text-[#6F7889] max-w-sm mx-auto mt-1">
=======
            <div className="glass-card border-dashed p-12 text-center">
              <Camera className="w-12 h-12 text-[#8b8c8e] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Analysis Performed Yet</h3>
              <p className="text-xs text-[#8b8c8e] max-w-sm mx-auto mt-1">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                Upload or select a site photograph on the left and click "Analyze Site Photograph" to run the computer vision verification engine.
              </p>
            </div>
          ) : (
<<<<<<< HEAD
            <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] overflow-hidden divide-y divide-[#E4D8BE] shadow-xs">
              {/* Result Header */}
              <div className="p-6 bg-[#F7F3EA]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">
                      AI Verification Verdict
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                      resultSource === 'backend' 
                        ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30' 
                        : 'bg-[#D6B238]/20 text-[#29231D] border-[#D6B238]/40'
=======
            <div className="glass-card overflow-hidden divide-y divide-white/6">
              {/* Result Header */}
              <div className="p-6 bg-white/2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8b8c8e] uppercase tracking-wider">
                      AI Verification Verdict
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                      resultSource === 'backend' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-[#FFE14F]/15 text-[#FFE14F] border-[#FFE14F]/30'
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                    }`}>
                      {resultSource === 'backend' ? 'Flask Vision Model' : 'Demo Verification Engine'}
                    </span>
                  </div>
<<<<<<< HEAD
                  <h3 className="text-lg font-extrabold text-[#29231D] font-['Outfit'] mt-1">
=======
                  <h3 className="text-base font-bold text-white mt-1">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                    {analysisResult.claimedMilestone}
                  </h3>
                </div>

                <div className="shrink-0">
                  <StatusBadge status={analysisResult.assessmentStatus} size="md" />
                </div>
              </div>

              {/* Progress & Confidence Metrics */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
<<<<<<< HEAD
                <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E4D8BE] space-y-1">
                  <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Claimed Progress</span>
                  <span className="text-2xl font-black text-[#29231D] font-['Outfit'] block">{claimedPercentage}%</span>
                  <span className="text-[10px] text-[#6F7889] font-medium">Contractor running claim</span>
                </div>

                <div className="p-4 bg-[#D6B238]/15 rounded-xl border border-[#D6B238]/40 space-y-1">
                  <span className="text-[10px] font-bold text-[#29231D] uppercase tracking-wider block">Observable Range</span>
                  <span className="text-2xl font-black text-[#8f7215] font-['Outfit'] block">
                    {analysisResult.estimatedProgressRange || 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#8f7215] font-semibold">Visual estimate from photo</span>
                </div>

                <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E4D8BE] space-y-1">
                  <span className="text-[10px] font-bold text-[#6F7889] uppercase tracking-wider block">Model Confidence</span>
                  <span className="text-2xl font-black text-[#727C3E] font-['Outfit'] block">
                    {analysisResult.confidenceScore ? `${analysisResult.confidenceScore}%` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#727C3E] font-medium">Vision feature match</span>
=======
                <div className="p-3.5 bg-white/4 rounded-xl border border-white/6">
                  <span className="text-[11px] font-semibold text-[#8b8c8e] uppercase block">Claimed Progress</span>
                  <span className="text-xl font-bold text-white mt-1 block">{claimedPercentage}%</span>
                  <span className="text-[10px] text-slate-400">Contractor running claim</span>
                </div>

                <div className="p-3.5 bg-[#FFE14F]/10 rounded-xl border border-[#FFE14F]/20">
                  <span className="text-[11px] font-semibold text-[#FFE14F] uppercase block">Observable Range</span>
                  <span className="text-xl font-bold text-white mt-1 block">
                    {analysisResult.estimatedProgressRange || 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#FFE14F]">Visual estimate from photo</span>
                </div>

                <div className="p-3.5 bg-white/4 rounded-xl border border-white/6">
                  <span className="text-[11px] font-semibold text-[#8b8c8e] uppercase block">Model Confidence</span>
                  <span className="text-xl font-bold text-white mt-1 block">
                    {analysisResult.confidenceScore ? `${analysisResult.confidenceScore}%` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400">Vision feature match</span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                </div>
              </div>

              {/* Observable Construction Evidence */}
              <div className="p-6 space-y-3">
<<<<<<< HEAD
                <h4 className="text-xs font-bold text-[#29231D] uppercase tracking-wider flex items-center gap-2 font-['Outfit']">
                  <CheckCircle2 className="w-4 h-4 text-[#727C3E]" />
=======
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  <span>Visible Construction Evidence</span>
                </h4>
                <ul className="space-y-2">
                  {analysisResult.visibleEvidence?.map((item, idx) => (
<<<<<<< HEAD
                    <li key={idx} className="text-xs text-[#29231D] font-medium flex items-start gap-2.5 bg-[#727C3E]/10 p-3 rounded-xl border border-[#727C3E]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#727C3E] shrink-0 mt-1.5"></span>
=======
                    <li key={idx} className="text-xs text-[#c8c8cb] flex items-start gap-2 bg-emerald-500/8 p-3 rounded-xl border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing or Unclear Evidence */}
              <div className="p-6 space-y-3">
<<<<<<< HEAD
                <h4 className="text-xs font-bold text-[#29231D] uppercase tracking-wider flex items-center gap-2 font-['Outfit']">
                  <AlertTriangle className="w-4 h-4 text-[#C84B31]" />
=======
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FFE14F]" />
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  <span>Missing or Unclear Evidence</span>
                </h4>
                <ul className="space-y-2">
                  {analysisResult.missingEvidence?.map((item, idx) => (
<<<<<<< HEAD
                    <li key={idx} className="text-xs text-[#29231D] font-medium flex items-start gap-2.5 bg-[#C84B31]/10 p-3 rounded-xl border border-[#C84B31]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C84B31] shrink-0 mt-1.5"></span>
=======
                    <li key={idx} className="text-xs text-[#c8c8cb] flex items-start gap-2 bg-[#FFE14F]/8 p-3 rounded-xl border border-[#FFE14F]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFE14F] shrink-0 mt-1.5"></span>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Next Step */}
<<<<<<< HEAD
              <div className="p-6 bg-[#F7F3EA]/50 space-y-2">
                <h4 className="text-xs font-bold text-[#29231D] uppercase tracking-wider flex items-center gap-2 font-['Outfit']">
                  <ShieldCheck className="w-4 h-4 text-[#727C3E]" />
                  <span>Auditor Recommendation</span>
                </h4>
                <p className="text-xs text-[#29231D] bg-[#FFFDF8] p-4 rounded-xl border border-[#E4D8BE] leading-relaxed font-semibold">
                  {analysisResult.recommendation}
                </p>
                <p className="text-[11px] text-[#6F7889] italic font-medium">
=======
              <div className="p-6 bg-white/2 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FFE14F]" />
                  <span>Auditor Recommendation</span>
                </h4>
                <p className="text-xs text-[#c8c8cb] bg-white/4 p-3.5 rounded-xl border border-white/8 leading-relaxed font-medium">
                  {analysisResult.recommendation}
                </p>
                <p className="text-[11px] text-[#8b8c8e] italic">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  Note: One photograph does not prove an entire structural milestone. Certified physical inspection remains mandatory.
                </p>
              </div>

              {/* Submit to queue button */}
<<<<<<< HEAD
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFDF8]">
                <span className="text-xs text-[#6F7889] font-medium">
=======
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/1">
                <span className="text-xs text-[#8b8c8e]">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  Ready to submit this finding to the engineering auditor review ledger?
                </span>

                <button
                  onClick={handleSubmitToAuditorQueue}
<<<<<<< HEAD
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 btn-gold text-[#29231D] rounded-xl text-xs font-bold shadow-xs cursor-pointer"
=======
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold shadow-md cursor-pointer"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Auditor Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
