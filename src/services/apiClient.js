import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vitalcheck-56uj.onrender.com/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (userData) =>
    apiClient.post('/auth/register', userData),
  logout: () =>
    apiClient.post('/auth/logout'),
}

// Doctor endpoints
export const doctorAPI = {
  getProfile: () =>
    apiClient.get('/auth/profile'),
  updateProfile: (data) =>
    apiClient.put('/auth/profile', data),
  updateDoctorProfileFields: (data) =>
    apiClient.put('/doctors/profile', data),
  getAppointments: () =>
    apiClient.get('/appointments/my-appointments'),
  getAppointmentDetails: (id) =>
    apiClient.get(`/appointments/${id}`),
  updateAppointmentStatus: (id, status) =>
    apiClient.patch(`/appointments/${id}/status`, { status }),
  createProfile: (data) =>
    apiClient.post('/doctors/create', data),
}

// Patient endpoints
export const patientAPI = {
  getProfile: () =>
    apiClient.get('/auth/profile'),
  updateProfile: (data) =>
    apiClient.put('/auth/profile', data),
  getAppointments: () =>
    apiClient.get('/appointments/my-appointments'),
  getAppointmentDetails: (id) =>
    apiClient.get(`/appointments/${id}`),
  bookAppointment: (data) =>
    apiClient.post('/appointments/create', data),
  cancelAppointment: (id) =>
    apiClient.patch(`/appointments/${id}/status`, { status: 'cancelled' }),
  rescheduleAppointment: (id, data) =>
    apiClient.put(`/appointments/${id}/reschedule`, data),
  getDoctors: (filters = {}) =>
    apiClient.get('/doctors', { params: filters }),
  getDoctorDetails: (id) =>
    apiClient.get(`/doctors/${id}`),
}

// Medical records endpoints
export const medicalRecordsAPI = {
  getRecords: () =>
    apiClient.get('/medical-records'),
  addRecord: (data) =>
    apiClient.post('/medical-records', data),
  updateRecord: (id, data) =>
    apiClient.put(`/medical-records/${id}`, data),
  deleteRecord: (id) =>
    apiClient.delete(`/medical-records/${id}`),
}

// Chat endpoints
export const chatAPI = {
  getConversations: () =>
    apiClient.get('/chat/conversations'),
  getMessages: (userId) =>
    apiClient.get(`/chat/conversation/${userId}`),
  sendMessage: (receiverId, text) =>
    apiClient.post('/chat/send', { receiverId, message: text }),
  markAsRead: (userId) =>
    apiClient.patch(`/chat/read/${userId}`),
}

// Notification endpoints
export const notificationAPI = {
  getNotifications: () =>
    apiClient.get('/notifications'),
  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),
  markAsRead: (id) =>
    apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () =>
    apiClient.patch('/notifications/mark-all-read'),
  deleteNotification: (id) =>
    apiClient.delete(`/notifications/${id}`),
}

export default apiClient
