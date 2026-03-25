import { useState, useEffect } from 'react'
import { useHMSActions } from '@100mslive/react-sdk'
import { Phone, PhoneOff, Video } from 'lucide-react'
import ActiveCall from './ActiveCall'
import axios from 'axios'

// Helper function to construct API URLs properly
const getAPIUrl = (endpoint) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://vitalcheck-56uj.onrender.com/api'
  // Remove trailing slash from baseURL if present
  const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${cleanBase}${cleanEndpoint}`
}

export const IncomingCall = ({ currentUserId }) => {
  const hmsActions = useHMSActions()
  const [incomingCall, setIncomingCall] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [timeoutId, setTimeoutId] = useState(null)
  const socketRef = window.socketRef

  useEffect(() => {
    if (!socketRef) return

    // Listen for incoming call
    socketRef.on('incoming-call', (data) => {
      setIncomingCall(data)

      // Set 30-second timeout for auto-decline
      const timeout = setTimeout(() => {
        if (incomingCall) {
          handleMissedCall(data.from)
        }
      }, 30000)
      setTimeoutId(timeout)
    })

    // Listen for call-ended from remote user
    socketRef.on('call-ended', () => {
      if (activeCall) {
        hmsActions.leave()
        setActiveCall(null)
      }
    })

    return () => {
      socketRef.off('incoming-call')
      socketRef.off('call-ended')
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [socketRef, incomingCall, activeCall, hmsActions])

  const handleAcceptCall = async () => {
    try {
      if (!incomingCall) return

      // Clear the timeout
      if (timeoutId) clearTimeout(timeoutId)

      // Get auth token for joining room
      const response = await axios.post(
        getAPIUrl('/call/join-room'),
        { roomId: incomingCall.roomId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      )

      const { token } = response.data

      // Join the room
      await hmsActions.join({
        userName: currentUserId,
        authToken: token,
        settings: {
          isAudioMuted: false,
          isVideoMuted: incomingCall.callType === 'audio',
        },
      })

      // Notify caller
      if (socketRef) {
        socketRef.emit('call-accepted', {
          targetUserId: incomingCall.from,
          roomId: incomingCall.roomId,
        })
      }

      setActiveCall(incomingCall)
      setIncomingCall(null)
    } catch (error) {
      console.error('Error accepting call:', error)
      alert('Failed to join call. Please try again.')
    }
  }

  const handleDeclineCall = () => {
    if (!incomingCall) return

    // Clear the timeout
    if (timeoutId) clearTimeout(timeoutId)

    // Notify caller
    if (socketRef) {
      socketRef.emit('call-declined', {
        targetUserId: incomingCall.from,
      })
    }

    setIncomingCall(null)
  }

  const handleMissedCall = (from) => {
    // Clear the timeout
    if (timeoutId) clearTimeout(timeoutId)

    // Notify caller
    if (socketRef) {
      socketRef.emit('call-missed', {
        targetUserId: from,
      })
    }

    setIncomingCall(null)
  }

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      overflow: 'hidden',
    },
    cardContainer: {
      width: '100%',
      maxWidth: '420px',
      margin: '0 1rem',
    },
    card: {
      background: 'linear-gradient(180deg, #2563eb, #1e40af)',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      padding: '2rem',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    },
    decorationCircle: {
      position: 'absolute',
      width: '384px',
      height: '384px',
      borderRadius: '9999px',
      backgroundColor: '#60a5fa',
      opacity: 0.1,
    },
    content: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
    },
    avatarWrapper: {
      position: 'relative',
      width: '112px',
      height: '112px',
    },
    pulseRing: {
      position: 'absolute',
      inset: 0,
      backgroundColor: '#ffffff',
      borderRadius: '9999px',
      opacity: 0.2,
      animation: 'pulse-ring 2s infinite',
    },
    avatar: {
      width: '112px',
      height: '112px',
      borderRadius: '9999px',
      background: 'linear-gradient(135deg, #93c5fd, #1d4ed8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      fontSize: '2.5rem',
      fontWeight: 'bold',
    },
    callerInfo: {
      textAlign: 'center',
    },
    callerText: {
      margin: 0,
    },
    callIcon: {
      marginTop: '0.5rem',
    },
    actions: {
      width: '100%',
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    },
    button: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.85rem',
      color: '#fff',
      border: 'none',
      borderRadius: '9999px',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.25)',
      transition: 'transform 0.2s ease, background-color 0.2s ease',
    },
    decline: {
      backgroundColor: '#ef4444',
    },
    accept: {
      backgroundColor: '#22c55e',
    },
    icon: {
      color: '#bfdbfe',
    },
    badge: {
      margin: 0,
      fontSize: '0.9rem',
      color: '#bfdbfe',
    },
    title: {
      margin: '0.25rem 0 0.5rem',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#ffffff',
    },
  }

  if (activeCall) {
    return (
      <ActiveCall
        callType={activeCall.callType}
        roomId={activeCall.roomId}
        targetUserId={activeCall.from}
        onCallEnd={() => setActiveCall(null)}
      />
    )
  }

  if (!incomingCall) {
    return null
  }

  return (
    <div style={styles.overlay}>
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{ ...styles.cardContainer, animation: 'slide-up 0.5s ease-out' }}>
        <div style={styles.card}>
          {/* Background decoration */}
          <div style={{ ...styles.decorationCircle, top: '-160px', left: '-160px' }} />
          <div style={{ ...styles.decorationCircle, bottom: '-160px', right: '-160px' }} />

          <div style={styles.content}>
            {/* Avatar and pulse animation */}
            <div style={styles.avatarWrapper}>
              <div style={styles.pulseRing} />
              <div style={styles.avatar}>
                {incomingCall.callerName?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>

            {/* Caller info */}
            <div style={styles.callerInfo}>
              <p style={styles.badge}>Incoming {incomingCall.callType} call</p>
              <p style={styles.title}>{incomingCall.callerName}</p>
              <p style={styles.badge}>Ringing...</p>
            </div>

            {/* Call icon */}
            <div style={styles.callIcon}>
              {incomingCall.callType === 'video' ? (
                <Video size={40} style={styles.icon} />
              ) : (
                <Phone size={40} style={styles.icon} />
              )}
            </div>

            {/* Action buttons */}
            <div style={styles.actions}>
              <button
                onClick={handleDeclineCall}
                style={{ ...styles.button, ...styles.decline }}
              >
                <PhoneOff size={24} />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAcceptCall}
                style={{ ...styles.button, ...styles.accept }}
              >
                <Phone size={24} />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomingCall
