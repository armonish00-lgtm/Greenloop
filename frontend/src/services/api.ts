const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function getImageUrl(path?: string): string {
  if (!path) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('greenloop_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type only if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during network request.');
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  quickLogin: (role: string) => request<any>('/auth/quick-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Listings
  getListings: (params: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<{ count: number; listings: any[] }>(`/listings?${query.toString()}`);
  },
  getListingById: (id: string) => request<{ listing: any }>(`/listings/${id}`),
  createListing: (formData: FormData) => request<any>('/listings', { method: 'POST', body: formData }),
  updateListingStatus: (id: string, status: string) => request<any>(`/listings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteListing: (id: string) => request<any>(`/listings/${id}`, { method: 'DELETE' }),

  // Requests
  createRequest: (body: any) => request<any>('/requests', { method: 'POST', body: JSON.stringify(body) }),
  getMyRequests: () => request<{ requests: any[] }>('/requests/my-requests'),
  getReceivedRequests: () => request<{ requests: any[] }>('/requests/received'),
  updateRequestStatus: (id: string, status: string, paymentMethod?: string) =>
    request<any>(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, paymentMethod }) }),

  // Chat
  getConversations: () => request<{ conversations: any[] }>('/chat/conversations'),
  getMessages: (conversationId: string) => request<any>(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string, isQuickReply?: boolean) =>
    request<any>(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ content, isQuickReply }) }),
  getOrCreateConversation: (body: { listingId?: string; participantId?: string }) =>
    request<{ conversationId: string }>('/chat/get-or-create', { method: 'POST', body: JSON.stringify(body) }),

  // Impact
  getPersonalImpact: () => request<any>('/impact/personal'),
  getCommunityImpact: (neighborhood?: string) => request<any>(`/impact/community${neighborhood ? `?neighborhood=${encodeURIComponent(neighborhood)}` : ''}`),

  // Misc
  getNotifications: () => request<{ notifications: any[] }>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  submitReview: (body: any) => request<any>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  submitVerification: (body: any) => request<any>('/verifications/submit', { method: 'POST', body: JSON.stringify(body) }),
  fileReport: (body: any) => request<any>('/reports', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  getUserOrders: () => request<any>('/reports/user-orders'),

  // Admin
  getAdminOverview: () => request<any>('/admin/overview'),
  getAdminAnalytics: () => request<any>('/admin/analytics'),
  getAdminReports: (status?: string) => request<any>(`/admin/reports${status ? `?status=${status}` : ''}`),
  resolveReport: (id: string, body: any) => request<any>(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  suspendUser: (id: string, body: any) => request<any>(`/admin/users/${id}/suspend`, { method: 'POST', body: JSON.stringify(body) }),
  banUser: (id: string, body: any) => request<any>(`/admin/users/${id}/ban`, { method: 'POST', body: JSON.stringify(body) }),
  getAdminVerifications: () => request<any>('/admin/verifications'),
  updateVerification: (id: string, body: any) => request<any>(`/admin/verifications/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAuditLogs: () => request<any>('/admin/audit-logs'),
};
