import React, { useState } from 'react';
import { Settings as SettingsIcon, Server, Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export default function Settings({ backendConnected, onRefreshBackendStatus, onResetData, onShowToast }) {
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveApiUrl = async () => {
    setIsTesting(true);
    setApiBaseUrl(apiUrl);
    if (onRefreshBackendStatus) {
      await onRefreshBackendStatus();
    }
    setIsTesting(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Backend Endpoint Updated',
        message: `API base URL set to ${apiUrl}`
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-[#29231D] font-['Outfit']">System Settings & API Config</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D6B238]/20 text-[#29231D]">PRAMAAN AI</span>
        </div>
        <p className="text-xs text-[#6F7889] font-medium mt-1">
          Configure backend API server connection, state reset, and PRAMAAN AI audit engine parameters.
        </p>
      </div>

      {/* Backend API Connection Card */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#29231D] text-[#D6B238] flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">FastAPI Backend Connection</h3>
              <p className="text-xs text-[#6F7889]">REST API backend service status & endpoint configuration</p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            backendConnected
              ? 'bg-[#727C3E]/20 text-[#727C3E]'
              : 'bg-[#C84B31]/20 text-[#C84B31]'
          }`}>
            {backendConnected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{backendConnected ? 'Connected (Live)' : 'Disconnected (Backend Offline)'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E4D8BE] space-y-3">
          <label className="text-xs font-bold text-[#29231D] block">API Base URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              className="flex-1 bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl px-4 py-2 text-xs font-mono text-[#29231D] focus:outline-none focus:border-[#D6B238]"
              placeholder="http://127.0.0.1:8000"
            />
            <button
              onClick={handleSaveApiUrl}
              disabled={isTesting}
              className="btn-gold text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Save & Test'}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#6F7889]">
            Default local API server runs on <code className="bg-[#EDE5D6] px-1.5 py-0.5 rounded text-[#29231D]">http://127.0.0.1:8000</code>.
          </p>
        </div>
      </div>

      {/* Workspace Data Management */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D6B238]/20 text-[#29231D] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">Workspace Cache Management</h3>
            <p className="text-xs text-[#6F7889]">Manage and clear local browser-cached audit states and drafts</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E4D8BE] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#29231D]">Clear Local Audit Cache</p>
            <p className="text-[11px] text-[#6F7889]">Clears all local drafts and restores an empty, clean audit workspace.</p>
          </div>
          <button
            onClick={() => {
              if (onResetData) onResetData();
              if (onShowToast) {
                onShowToast({
                  type: 'success',
                  title: 'Cache Cleared',
                  message: 'Local workspace data and drafts reset to clean state.'
                });
              }
            }}
            className="btn-secondary-sandstone text-xs px-4 py-2 rounded-xl font-bold text-[#29231D] border border-[#E4D8BE] hover:bg-[#EDE5D6] cursor-pointer"
          >
            Clear Workspace Data
          </button>
        </div>
      </div>
    </div>
  );
}
