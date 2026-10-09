// BuildVerify AI - API Service with Authentication & RBAC Support
// Connects to Python Flask REST API at http://127.0.0.1:5000

export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:5000';

export const getApiBaseUrl = () => {
  return localStorage.getItem('buildverify_api_url') || DEFAULT_API_BASE_URL;
};

export const setApiBaseUrl = (url) => {
  localStorage.setItem('buildverify_api_url', url);
};

export const getAuthToken = () => {
  return localStorage.getItem('buildverify_auth_token') || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('buildverify_auth_token', token);
  } else {
    localStorage.removeItem('buildverify_auth_token');
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('buildverify_auth_token');
};

/**
 * Helper to generate request headers including Bearer token
 */
const getAuthHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const checkBackendHealth = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { connected: true, baseUrl, data };
    }
    return { connected: false, baseUrl, error: `HTTP ${res.status}: ${res.statusText}` };
  } catch (err) {
    return {
      connected: false,
      baseUrl,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Backend server unreachable at ' + baseUrl
    };
  }
};

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export const authLogin = async (email, password) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }
    if (data.token) {
      setAuthToken(data.token);
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const authLogout = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(true)
    });
  } catch (e) {
    // ignore network errors on logout
  } finally {
    clearAuthToken();
  }
  return { success: true };
};

export const authGetMe = async () => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  if (!token) return { success: false, error: 'No token stored' };

  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) {
      clearAuthToken();
      throw new Error(data.error || 'Session expired.');
    }
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const authChangePassword = async (oldPassword, newPassword) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update password.');
    }
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const authForgotPassword = async (email) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==========================================
// USER MANAGEMENT APIs (Main Supervisor Only)
// ==========================================

export const getUsers = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: 'GET',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const createUser = async (userData) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updateUser = async (userId, userData) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ is_active: isActive })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle status');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const resetUserPassword = async (userId) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/users/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==========================================
// PROJECTS & ASSIGNMENTS APIs
// ==========================================

export const getProjects = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'GET',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const createProject = async (projectData) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(projectData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create project');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const getProjectAssignments = async (projectId) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/assignments`, {
      method: 'GET',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch assignments');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==========================================
// AUDIT LOGS APIs
// ==========================================

export const getAuditLogs = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/audit-logs`, {
      method: 'GET',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==========================================
// AUDIT & RECONCILIATION APIs
// ==========================================

export const auditPhoto = async (formData) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/audit-photo`, {
      method: 'POST',
      headers: getAuthHeaders(false), // FormData handles multipart boundaries
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message || 'Failed to connect to AI Photo Audit service'
    };
  }
};

export const auditChallan = async (formData) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/audit-challan`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message || 'Failed to connect to Challan OCR service'
    };
  }
};

export const reconcileMaterials = async (payload) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/reconcile-materials`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message || 'Failed to submit reconciliation to backend'
    };
  }
};

export const getAudits = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/audits`, {
      headers: getAuthHeaders(true)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message
    };
  }
};

export const submitAuditorDecision = async (id, decisionPayload) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/audits/${id}/decision`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(decisionPayload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message
    };
  }
};

export const getDashboardData = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: getAuthHeaders(true)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message
    };
  }
};

export const getReport = async (id) => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/reports/${id}`, {
      headers: getAuthHeaders(true)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data, source: 'backend' };
  } catch (err) {
    return {
      success: false,
      source: 'backend_failed',
      error: err.message
    };
  }
};

export const downloadReportPdfUrl = (id) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/reports/${id}/pdf`;
};
