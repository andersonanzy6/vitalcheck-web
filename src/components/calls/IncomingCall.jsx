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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
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
        .pulse-ring {
          animation: pulse-ring 2s infinite;
        }
        .slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
      
      <div className="w-full max-w-sm mx-4 slide-up">
        <div className="bg-gradient-to-b from-blue-600 to-blue-800 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full -top-40 -left-40 opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full -bottom-40 -right-40 opacity-10"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Avatar and pulse animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full opacity-20 pulse-ring"></div>
              <div className="w-28 h-28 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold">
                  {incomingCall.callerName?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            </div>

            {/* Caller info */}
            <div className="text-center">
              <p className="text-blue-100 text-sm font-medium mb-1">Incoming {incomingCall.callType} call</p>
              <p className="text-4xl font-bold mb-2">{incomingCall.callerName}</p>
              <p className="text-blue-100 text-sm">Ringing...</p>
            </div>

            {/* Call icon */}
            <div className="mt-2">
              {incomingCall.callType === 'video' ? (
                <Video size={40} className="text-blue-100" />
              ) : (
                <Phone size={40} className="text-blue-100" />
              )}
            </div>

            {/* Action buttons */}
            <div className="w-full flex gap-4 mt-8 pt-6 border-t border-white/20">
              <button
                onClick={handleDeclineCall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <PhoneOff size={24} />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
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
