import { useState } from 'react'
import { useHMSActions } from '@100mslive/react-sdk'
import { Phone, Video } from 'lucide-react'
import ActiveCall from './ActiveCall'
import axios from 'axios'

export const CallManager = ({ currentUserId, targetUserId, targetUserName }) => {
  const hmsActions = useHMSActions()
  const [activeCall, setActiveCall] = useState(null)
  const socketRef = window.socketRef

  const handleCallClick = async (callType) => {
    try {
      // Create room via API
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/call/create-room`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      )

      const { roomId, token } = response.data

      // Emit socket event to notify target user
      if (socketRef) {
        socketRef.emit('call-user', {
          targetUserId,
          roomId,
          callType,
          callerName: currentUserId,
        })
      }

      // Join the room
      await hmsActions.join({
        userName: currentUserId,
        authToken: token,
        settings: {
          isAudioMuted: false,
          isVideoMuted: callType === 'audio',
        },
      })

      setActiveCall({ roomId, callType })
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Failed to start call. Please try again.')
    }
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
}

export default CallManager
