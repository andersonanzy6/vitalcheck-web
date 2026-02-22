import { useAuth } from '../context/AuthContext.jsx'

export const useAuthCheck = () => {
  const { isLoggedIn, user, loading } = useAuth()
  
  return {
    isAuthenticated: isLoggedIn,
    user,
    isLoading: loading,
    isDoctor: user?.role === 'doctor',
    isPatient: user?.role === 'patient',
  }
}
