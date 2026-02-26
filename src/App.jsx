import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './components/MainLayout'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Patient Pages
import { PatientHome } from './pages/patient/Home'
import { DoctorsPage } from './pages/patient/Doctors'
import { AppointmentsPage } from './pages/patient/Appointments'
import { MessagesPage } from './pages/patient/Messages'
import { NotificationsPage } from './pages/patient/Notifications'
import { ProfilePage } from './pages/patient/Profile'
import { SymptomChecker } from './pages/patient/SymptomChecker'
import { PaymentsPage } from './pages/patient/Payments'

// Doctor Pages
import { DoctorHome } from './pages/doctor/Home'
import { DoctorAppointmentsPage } from './pages/doctor/Appointments'
import { DoctorMessagesPage } from './pages/doctor/Messages'
import { DoctorNotificationsPage } from './pages/doctor/Notifications'
import { DoctorProfilePage } from './pages/doctor/Profile'

// Shared Pages
import { ChatScreen } from './pages/shared/ChatScreen'
import { DoctorDetailPage } from './pages/shared/DoctorDetail'
import { BookingFlowPage } from './pages/shared/BookingFlow'
import { MedicalRecordsPage } from './pages/shared/MedicalRecords'
import { AppointmentDetailPage } from './pages/shared/AppointmentDetail'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Navigate to="/patient/home" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient Routes */}
            <Route
              path="/patient/*"
              element={
                <PrivateRoute requiredRole="patient">
                  <MainLayout>
                    <Routes>
                      <Route path="home" element={<PatientHome />} />
                      <Route path="doctors" element={<DoctorsPage />} />
                      <Route path="appointments" element={<AppointmentsPage />} />
                      <Route path="messages" element={<MessagesPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="symptom-checker" element={<SymptomChecker />} />
                      <Route path="payments" element={<PaymentsPage />} />
                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/*"
              element={
                <PrivateRoute requiredRole="doctor">
                  <MainLayout>
                    <Routes>
                      <Route path="home" element={<DoctorHome />} />
                      <Route path="appointments" element={<DoctorAppointmentsPage />} />
                      <Route path="messages" element={<DoctorMessagesPage />} />
                      <Route path="notifications" element={<DoctorNotificationsPage />} />
                      <Route path="profile" element={<DoctorProfilePage />} />
                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              }
            />

            {/* Shared Routes - No Layout */}
            <Route
              path="/shared/chat/:doctorId"
              element={
                <PrivateRoute>
                  <ChatScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/shared/doctor-detail/:doctorId"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <DoctorDetailPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/booking/:doctorId"
              element={
                <PrivateRoute requiredRole="patient">
                  <MainLayout>
                    <BookingFlowPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/medical-records"
              element={
                <PrivateRoute requiredRole="patient">
                  <MainLayout>
                    <MedicalRecordsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/appointment-detail/:appointmentId"
              element={
                <PrivateRoute requiredRole="patient">
                  <MainLayout>
                    <AppointmentDetailPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/shared/appointment-detail/:appointmentId"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <AppointmentDetailPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
