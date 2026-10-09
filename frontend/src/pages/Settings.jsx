import React, { useState } from 'react';
import { 
  Server, 
  Sliders, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Database
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';

export default function Settings({ 
  backendConnected, 
  onRefreshBackendStatus, 
  onResetData, 
  onShowToast 
}) {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [tolerances, setTolerances] = useState({
    deliveryTolerance: 2.0,
    consumptionTolerance: 5.0,
    slumpToleranceMinutes: 90,
    highRiskThreshold: 10.0
  });

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    onRefreshBackendStatus?.();
    onShowToast?.({
      type: 'success',
      title: 'Backend URL Saved',
      message: `API base endpoint set to ${apiUrl}`
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await checkBackendHealth();
    setIsTesting(false);
    setTestResult(res);
    onRefreshBackendStatus?.();

    if (res.connected) {
      onShowToast?.({
        type: 'success',
        title: 'Backend Connected',
        message: 'Successfully reached Python Flask REST API.'
      });
    } else {
      onShowToast?.({
        type: 'warning',
        title: 'Backend Unreachable',
        message: 'Could not connect to Flask API. Running in Demo Simulation Mode.'
      });
    }
  };

  const handleSaveTolerances = () => {
    onShowToast?.({
      type: 'success',
      title: 'Tolerances Saved',
      message: 'Updated engineering discrepancy thresholds for anomaly engine.'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE14F]/15 text-[#FFE14F] border border-[#FFE14F]/30 uppercase tracking-wider">
            System Configuration
          </span>
          <span className="text-xs text-[#8b8c8e]">• BuildVerify AI v1.0.4</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">Platform Settings & Backend Integration</h1>
        <p className="text-xs text-[#8b8c8e] mt-1">
          Configure Python Flask REST API endpoints, adjust discrepancy tolerances, and manage demo datasets.
        </p>
      </div>

      {/* Section 1: Backend API Configuration */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#FFE14F]" />
            <h2 className="text-sm font-bold text-white tracking-tight">Python Flask Backend REST API</h2>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            backendConnected 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/15 text-[#FFE14F] border-[#FFE14F]/30'
          }`}>
            {backendConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{backendConnected ? 'Connected (Live API)' : 'Disconnected (Demo Mode)'}</span>
          </span>
        </div>

        <p className="text-xs text-[#8b8c8e] leading-relaxed">
          The frontend connects to the Flask API at the endpoint specified below. If the backend is running, live Vision AI inference, OCR challan extraction, and ReportLab PDF downloads will execute directly through Python.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:5000"
              className="w-full px-3 py-2 text-xs font-mono bg-white/4 border border-white/8 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FFE14F]"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleSaveApiUrl}
              className="px-4 py-2 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold cursor-pointer shadow-md"
            >
              Save URL
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 glass-chip rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs border ${
            testResult.connected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-500/10 border-[#FFE14F]/30 text-amber-200'
          }`}>
            <strong>Result: </strong>
            {testResult.connected ? (
              <span>Successfully connected to Flask API! Endpoints are active.</span>
            ) : (
              <span>{testResult.error || 'Server is not running on this port. The application will continue using transparent demo simulation.'}</span>
            )}
          </div>
        )}

        <div className="bg-white/3 rounded-xl p-3.5 border border-white/6 text-[11px] text-[#8b8c8e] font-mono space-y-1">
          <p className="font-bold text-white">To start the local Flask backend in your terminal:</p>
          <p className="text-[#FFE14F]">python backend/app.py</p>
          <p className="text-[#8b8c8e] font-sans">Listens by default on http://127.0.0.1:5000 with CORS enabled.</p>
        </div>
      </div>

      {/* Section 2: Discrepancy Tolerances */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/6 pb-3">
          <Sliders className="w-4 h-4 text-[#FFE14F]" />
          <h2 className="text-sm font-bold text-white tracking-tight">Engineering Discrepancy Tolerances</h2>
        </div>

        <p className="text-xs text-[#8b8c8e]">
          Set permissible variance limits for delivery weight slips and physical material consumption before an anomaly is automatically flagged.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">
              Weighbridge Delivery Tare Tolerance (±%)
            </label>
            <input
              type="number"
              step="0.5"
              value={tolerances.deliveryTolerance}
              onChange={(e) => setTolerances({ ...tolerances, deliveryTolerance: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white"
            />
            <span className="text-[10px] text-[#8b8c8e]">IS 456 / weighbridge permissible deviation</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">
              Site Consumption Wastage Threshold (±%)
            </label>
            <input
              type="number"
              step="0.5"
              value={tolerances.consumptionTolerance}
              onChange={(e) => setTolerances({ ...tolerances, consumptionTolerance: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white"
            />
            <span className="text-[10px] text-[#8b8c8e]">Standard contractual wastage allowance (default 5%)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">
              RMC Slump Window Limit (Minutes)
            </label>
            <input
              type="number"
              value={tolerances.slumpToleranceMinutes}
              onChange={(e) => setTolerances({ ...tolerances, slumpToleranceMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white"
            />
            <span className="text-[10px] text-[#8b8c8e]">Max hydration transit window before batch rejection</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c8c8cb] mb-1">
              High Severity Trigger Variance (%)
            </label>
            <input
              type="number"
              value={tolerances.highRiskThreshold}
              onChange={(e) => setTolerances({ ...tolerances, highRiskThreshold: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white"
            />
            <span className="text-[10px] text-[#8b8c8e]">Variance above this rate escalates to High severity</span>
          </div>
        </div>

        <button
          onClick={handleSaveTolerances}
          className="px-4 py-2 btn-fastshot-primary text-[#192853] rounded-xl text-xs font-semibold shadow-md cursor-pointer"
        >
          Save Engineering Tolerances
        </button>
      </div>

      {/* Section 3: Reset Demo Dataset */}
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-2 border-b border-white/6 pb-3">
          <Database className="w-4 h-4 text-[#FFE14F]" />
          <h2 className="text-sm font-bold text-white tracking-tight">Prototype Demo State Management</h2>
        </div>

        <p className="text-xs text-[#8b8c8e]">
          Restore initial construction sample data for Skyline Heights Tower B, Metro Corridor Phase 2, and Riverfront Commercial Hub.
        </p>

        <button
          onClick={() => {
            onResetData?.();
            onShowToast?.({
              type: 'info',
              title: 'Data Reset',
              message: 'Sample audit records and anomalies restored to defaults.'
            });
          }}
          className="px-4 py-2 glass-chip rounded-xl text-xs font-semibold cursor-pointer"
        >
          Reset Demo Data to Defaults
        </button>
      </div>
    </div>
  );
}
