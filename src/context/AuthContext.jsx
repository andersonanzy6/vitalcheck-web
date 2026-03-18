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
      initializeSocket()
    } else if (window.socketRef?.connected) {
      window.socketRef?.disconnect()
      window.socketRef = null
    }
  }, [token, user])

  const initializeSocket = () => {
    try {
      // Don't reinitialize if already connected
      if (window.socketRef?.connected) {
        console.log('[Auth] Socket.IO already connected');
        return;
      }

      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('[Auth] Initializing Socket.IO at:', socketUrl);
      
      window.socketRef = io(socketUrl, {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      window.socketRef.on('connect', () => {
        console.log('[Auth] ✅ Socket.IO connected globally:', window.socketRef.id);
      });

      window.socketRef.on('connect_error', (error) => {
        console.error('[Auth] Socket connection error:', error.message);
      });

      window.socketRef.on('disconnect', (reason) => {
        console.warn('[Auth] Socket disconnected:', reason);
      });
    } catch (err) {
      console.error('[Auth] Error initializing socket:', err);
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
