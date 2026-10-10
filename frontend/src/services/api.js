// PRAMAAN AI - API Service with Authentication & RBAC Support
// Connects to FastAPI REST API at http://127.0.0.1:8000

export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export const getApiBaseUrl = () => {
  return localStorage.getItem('PRAMAAN_api_url') || DEFAULT_API_BASE_URL;
};

export const setApiBaseUrl = (url) => {
  localStorage.setItem('PRAMAAN_api_url', url);
};

export const getAuthToken = () => {
  return localStorage.getItem('PRAMAAN_auth_token') || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('PRAMAAN_auth_token', token);
  } else {
    localStorage.removeItem('PRAMAAN_auth_token');
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('PRAMAAN_auth_token');
  localStorage.removeItem('PRAMAAN_cached_user');
};

export const MOCK_USERS = {
  'supervisor@PRAMAAN.ai': {
    id: 'USR-SUP-01',
    full_name: 'Rajesh Varma',
    email: 'supervisor@PRAMAAN.ai',
    role: 'SITE_SUPERVISOR',
    employee_id: 'EMP-SUP-01',
    must_change_password: false,
    assigned_project_ids: ['PRJ-101', 'PRJ-102', 'PRJ-103', 'PRJ-104']
  },
  'store@PRAMAAN.ai': {
    id: 'USR-STR-01',
    full_name: 'Suresh Mehta',
    email: 'store@PRAMAAN.ai',
    role: 'STORE_INCHARGE',
    employee_id: 'EMP-STR-09',
    must_change_password: false,
    assigned_project_ids: ['PRJ-101']
  },
  'auditor@PRAMAAN.ai': {
    id: 'USR-AUD-01',
    full_name: 'Pooja Iyer, PE',
    email: 'auditor@PRAMAAN.ai',
    role: 'AUDIT_MANAGER',
    employee_id: 'EMP-AUD-02',
    must_change_password: false,
    assigned_project_ids: ['PRJ-101', 'PRJ-102', 'PRJ-103']
  },
  'admin@PRAMAAN.ai': {
    id: 'USR-ADM-01',
    full_name: 'Vikramaditya Rao',
    email: 'admin@PRAMAAN.ai',
    role: 'ADMIN',
    employee_id: 'EMP-ADM-00',
    must_change_password: false,
    assigned_project_ids: ['PRJ-101', 'PRJ-102', 'PRJ-103', 'PRJ-104']
  }
};

const getOrCreateMockUser = (email) => {
  const norm = email.toLowerCase().trim();
  if (MOCK_USERS[norm]) return MOCK_USERS[norm];

  let inferredRole = 'SITE_SUPERVISOR';
  if (norm.includes('store') || norm.includes('shop')) inferredRole = 'STORE_INCHARGE';
  else if (norm.includes('audit') || norm.includes('manager')) inferredRole = 'AUDIT_MANAGER';
  else if (norm.includes('admin')) inferredRole = 'ADMIN';

  const namePart = norm.split('@')[0].replace(/[._-]/g, ' ');
  const capitalizedName = namePart ? (namePart.charAt(0).toUpperCase() + namePart.slice(1)) : 'Enterprise User';

  return {
    id: `USR-DEMO-${Math.floor(Math.random() * 8999 + 1000)}`,
    full_name: capitalizedName,
    email: norm,
    role: inferredRole,
    employee_id: 'EMP-DEMO-01',
    must_change_password: false,
    assigned_project_ids: ['PRJ-101', 'PRJ-102', 'PRJ-103', 'PRJ-104']
  };
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
    const res = await fetch(`${baseUrl}/health`, {
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
  const cleanEmail = email.trim().toLowerCase();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        localStorage.setItem('buildverify_cached_user', JSON.stringify(data.user));
      }
      return { success: true, data };
    } else if (res.status === 401 || res.status === 403) {
      return { success: false, error: data.error || 'Invalid credentials. Please verify your email and password.' };
    }
  } catch (err) {
    console.warn('Backend server offline/unreachable. Proceeding with client demo authentication fallback.');
  }

  // Client Demo Fallback Login
  const mockUser = getOrCreateMockUser(cleanEmail);
  const demoToken = `demo_jwt_token_${Date.now()}`;
  setAuthToken(demoToken);
  localStorage.setItem('buildverify_cached_user', JSON.stringify(mockUser));

  return {
    success: true,
    data: {
      success: true,
      token: demoToken,
      user: mockUser,
      message: `Welcome back, ${mockUser.full_name}.`
    }
  };
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
  const token = getAuthToken();
  if (!token) return { success: false, error: 'No token stored' };

  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(true),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        localStorage.setItem('buildverify_cached_user', JSON.stringify(data.user));
      }
      return { success: true, user: data.user };
    }
  } catch (err) {
    // network error fallback
  }

  const cachedUserJson = localStorage.getItem('buildverify_cached_user');
  if (cachedUserJson) {
    try {
      const cachedUser = JSON.parse(cachedUserJson);
      return { success: true, user: cachedUser };
    } catch (e) { }
  }

  const defaultUser = MOCK_USERS['supervisor@buildverify.ai'];
  localStorage.setItem('buildverify_cached_user', JSON.stringify(defaultUser));
  return { success: true, user: defaultUser };
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
