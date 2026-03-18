import { useState, useEffect } from 'react'
import { useHMSActions } from '@100mslive/react-sdk'
import { Phone, Video, X } from 'lucide-react'
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

export const CallManager = ({ currentUserId, targetUserId, targetUserName }) => {
  const hmsActions = useHMSActions()
  const [activeCall, setActiveCall] = useState(null)
  const [callingState, setCallingState] = useState(null) // { callType, roomId, startTime }
  const socketRef = window.socketRef

  useEffect(() => {
    if (!socketRef) return

    // Listen for call acceptance
    const handleCallAccepted = async () => {
      console.log('Call accepted by remote user')
      if (callingState) {
        try {
          // Get token for already-created room
          const response = await axios.post(
            getAPIUrl('/call/join-room'),
            { roomId: callingState.roomId },
            { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
          )

          const { token } = response.data

          // Join the room
          await hmsActions.join({
            userName: currentUserId,
            authToken: token,
            settings: {
              isAudioMuted: false,
              isVideoMuted: callingState.callType === 'audio',
            },
          })

          setActiveCall({ roomId: callingState.roomId, callType: callingState.callType })
          setCallingState(null)
        } catch (error) {
          console.error('Error joining accepted call:', error)
          alert('Failed to join call. Please try again.')
          setCallingState(null)
        }
      }
    }

    // Listen for call rejection
    const handleCallRejected = () => {
      console.log('Call rejected by remote user')
      setCallingState(null)
      alert('Call was declined')
    }

    socketRef.on('call-accepted', handleCallAccepted)
    socketRef.on('call-declined', handleCallRejected)
    socketRef.on('call-missed', handleCallRejected)

    return () => {
      socketRef.off('call-accepted', handleCallAccepted)
      socketRef.off('call-declined', handleCallRejected)
      socketRef.off('call-missed', handleCallRejected)
    }
  }, [socketRef, callingState, currentUserId, hmsActions])

  const handleCallClick = async (callType) => {
    try {
      // Create room via API
      const response = await axios.post(
        getAPIUrl('/call/create-room'),
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      )

      const { roomId, token } = response.data

      // Set calling state (ringing phase)
      setCallingState({ callType, roomId, startTime: Date.now() })

      // Emit socket event to notify target user with call invitation
      if (socketRef) {
        console.log('[Call] Emitting call-user to:', targetUserId);
        socketRef.emit('call-user', {
          targetUserId,
          roomId,
          callType,
          callerName: targetUserName || currentUserId,
        })
      }
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Failed to start call. Please try again.')
    }
  }

  const handleCancelCall = () => {
    if (!callingState) return

    // Notify remote user that call was cancelled
    if (socketRef) {
      socketRef.emit('call-cancelled', {
        targetUserId,
      })
    }

    setCallingState(null)
  }

  if (activeCall) {
    return (
      <ActiveCall
        callType={activeCall.callType}
        roomId={activeCall.roomId}
        targetUserId={targetUserId}
        onCallEnd={() => setActiveCall(null)}
      />
    )
  }

  // Show calling/ringing UI
  if (callingState) {
    return (
      <div style={styles.callingOverlay}>
        <div style={styles.callingCard}>
          <div style={styles.callingHeader}>
            <h3 style={styles.callingTitle}>Calling...</h3>
            <p style={styles.callingTarget}>{targetUserName}</p>
          </div>

          <div style={styles.pulsingContainer}>
            <div style={styles.pulseDot}></div>
            <div style={{ ...styles.pulseDot, animationDelay: '0.3s' }}></div>
            <div style={{ ...styles.pulseDot, animationDelay: '0.6s' }}></div>
          </div>

          <p style={styles.ringingText}>
            {callingState.callType === 'video' ? '📹 Video Call' : '📞 Audio Call'}
          </p>

          <button
            onClick={handleCancelCall}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc2626'
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ef4444'
              e.target.style.transform = 'scale(1)'
            }}
            title="Cancel Call"
          >
            <X size={20} style={{ marginRight: '8px' }} />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <button
        onClick={() => handleCallClick('audio')}
        style={styles.button}
        onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
        title="Start Audio Call"
      >
        <Phone size={20} style={styles.icon} />
      </button>
      <button
        onClick={() => handleCallClick('video')}
        style={styles.button}
        onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
        title="Start Video Call"
      >
        <Video size={20} style={styles.icon} />
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '0',
  },
  icon: {
    color: 'white',
  },
  // Calling state styles
  callingOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 55,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
  },
  callingCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px 24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    maxWidth: '280px',
    animation: 'slideUp 0.3s ease-out',
  },
  callingHeader: {
    marginBottom: '24px',
  },
  callingTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
  },
  callingTarget: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--primary-color)',
  },
  pulsingContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
    height: '24px',
    alignItems: 'center',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--primary-color)',
    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  ringingText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
}

export default CallManager
