// API endpoints prefix
export const API_BASE_URL = 'https://vitalcheck-56uj.onrender.com/api'

// Appointment types
export const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'checkup', label: 'Checkup' },
]

// Appointment statuses
export const APPOINTMENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Blood types
export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

// User roles
export const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme_mode',
}

// API timeouts
export const API_TIMEOUT = 10000

// Pagination
export const ITEMS_PER_PAGE = 10

// Common strings
export const STRINGS = {
  LOADING: 'Loading...',
  ERROR: 'An error occurred',
  SUCCESS: 'Operation successful',
  CONFIRM: 'Are you sure?',
}
