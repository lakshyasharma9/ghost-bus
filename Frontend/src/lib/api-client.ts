import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
};

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.patch('/users/profile', data),
  toggleSellerMode: (enabled) => apiClient.post('/users/toggle-seller-mode', { enabled }),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    apiClient.post('/users/change-password', data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return apiClient.post('/users/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBanner: (file: File) => {
    const fd = new FormData();
    fd.append('banner', file);
    return apiClient.post('/sellers/banner', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submitSellerApplication: (data: {
    firstName: string; lastName: string; address: string; zip: string;
    city: string; country: string; paypalEmail: string; documentType?: string;
    passportFile?: File;
  }) => {
    // Send as JSON — the documentType field carries the full SellerApplication JSON
    return apiClient.post('/users/seller-application', data);
  },
  getSellerApplicationStatus: () => apiClient.get('/users/seller-application/status'),
  submitKyc: (data: FormData) => apiClient.post('/users/kyc', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Track APIs
export const trackAPI = {
  getAll: (params) => apiClient.get('/tracks', { params }),
  getById: (id) => apiClient.get(`/tracks/${id}`),
  create: (data) => apiClient.post('/tracks', data),
  update: (id, data) => apiClient.patch(`/tracks/${id}`, data),
  delete: (id) => apiClient.delete(`/tracks/${id}`),
};

// Follow APIs
export const followAPI = {
  getFollowing: () => apiClient.get('/users/following'),
  toggleFollow: (username: string) => apiClient.post(`/sellers/${username}/follow`),
};

// Wishlist tracks — fetch real track data for a list of IDs
export const wishlistAPI = {
  // Fetch multiple tracks by ID (comma-separated)
  getByIds: (ids: string[]) =>
    apiClient.get('/tracks', { params: { ids: ids.join(','), limit: 50 } }),
};

// Order APIs
export const orderAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
};

// Support APIs
export const supportAPI = {
  createTicket: (data) => apiClient.post('/support/tickets', data),
  getTickets: (params) => apiClient.get('/support/tickets', { params }),
  getTicketById: (id) => apiClient.get(`/support/tickets/${id}`),
  updateTicket: (id, data) => apiClient.patch(`/support/tickets/${id}`, data),
  deleteTicket: (id) => apiClient.delete(`/support/tickets/${id}`),
  getStats: () => apiClient.get('/support/stats'),
};

export default apiClient;
