import React, { createContext, useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Initialize Socket.IO when authenticated
  useEffect(() => {
    if (token && user) {
      console.log('[Auth] User logged in, initializing socket...');
      initializeSocket()
    } else if (window.socketRef?.connected) {
      console.log('[Auth] User logged out, disconnecting socket...');
      window.socketRef?.disconnect()
      window.socketRef = null
    }
  }, [token, user])

  const initializeSocket = () => {
    try {
      // Don't reinitialize if already connected
      if (window.socketRef?.connected) {
        console.log('[Auth] Socket.IO already connected:', window.socketRef.id);
        return;
      }

      // Close existing socket if it exists but is disconnected
      if (window.socketRef) {
        console.log('[Auth] Cleaning up old socket instance');
        window.socketRef.disconnect();
        window.socketRef = null;
      }

      // CRITICAL: Use correct production URL for Socket.IO
      // Must be the base URL without /api suffix
      const socketUrl = import.meta.env.VITE_API_URL 
        || 'https://vitalcheck-56uj.onrender.com';
      
      console.log('[Auth] Socket.IO connecting to:', socketUrl);
      console.log('[Auth] Token present:', !!token);
      
      window.socketRef = io(socketUrl, {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'],
      });

      window.socketRef.on('connect', () => {
        console.log('[Auth] ✅ Socket.IO CONNECTED:', window.socketRef.id);
      });

      window.socketRef.on('connect_error', (error) => {
        console.error('[Auth] ❌ Socket connection error:', error.message || error);
      });

      window.socketRef.on('disconnect', (reason) => {
        console.warn('[Auth] ⚠️ Socket disconnected:', reason);
      });

      window.socketRef.on('auth-error', (data) => {
        console.error('[Auth] ❌ Socket auth error:', data);
      });
    } catch (err) {
      console.error('[Auth] ❌ Exception initializing socket:', err);
    }
  }

  // Check if user is already logged in on app start
  useEffect(() => {
    bootstrapAsync()
  }, [])

  const bootstrapAsync = async () => {
    try {
      const savedToken = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (userData, authToken) => {
    try {
      localStorage.setItem('authToken', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(authToken)
      setUser(userData)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Error saving auth data:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        loading,
        isLoggedIn,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
