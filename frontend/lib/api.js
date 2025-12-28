/**
 * API Service Layer
 * Centralized client for making requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * GET request wrapper
 */
export function get(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * POST request wrapper
 */
export function post(endpoint, data) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request wrapper
 */
export function put(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request wrapper
 */
export function deleteRequest(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

/**
 * Journal API calls
 */
export const journalAPI = {
  addEntry: (data) => post('/api/addEntry', data),
  getEntries: (userId) => get(`/api/getEntries?user_id=${userId}`),
  analyzeEntries: (userId) => post('/api/analyzeEntries', { user_id: userId }),
};

/**
 * Insights API calls
 */
export const insightsAPI = {
  getInsights: (userId) => get(`/api/getInsights?user_id=${userId}`),
};

/**
 * AI Status API calls
 */
export const aiAPI = {
  checkStatus: () => get('/api/aiStatus'),
};

/**
 * Batch export for easy importing
 */
export default {
  get,
  post,
  put,
  deleteRequest,
  journalAPI,
  insightsAPI,
  aiAPI,
};
