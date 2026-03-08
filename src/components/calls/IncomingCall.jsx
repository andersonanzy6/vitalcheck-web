import { useState, useEffect } from 'react'
import { useHMSActions } from '@100mslive/react-sdk'
import { Phone, PhoneOff, Video } from 'lucide-react'
import ActiveCall from './ActiveCall'
import axios from 'axios'

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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/call/join-room`,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          {/* Call type icon */}
          <div className="bg-blue-100 p-4 rounded-full">
            {incomingCall.callType === 'video' ? (
              <Video size={32} className="text-blue-500" />
            ) : (
              <Phone size={32} className="text-blue-500" />
            )}
          </div>

          {/* Caller info */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">Incoming {incomingCall.callType} call</p>
            <p className="text-2xl font-semibold text-gray-900">{incomingCall.callerName}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full mt-6">
            <button
              onClick={handleDeclineCall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={20} />
              Decline
            </button>
            <button
              onClick={handleAcceptCall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Phone size={20} />
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomingCall
