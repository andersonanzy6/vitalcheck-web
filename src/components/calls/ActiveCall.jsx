import { useState, useEffect, useRef } from 'react'
import { useHMSActions, useHMSStore, selectPeers } from '@100mslive/react-sdk'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'

export const ActiveCall = ({ callType, roomId, targetUserId, onCallEnd }) => {
  const hmsActions = useHMSActions()
  const peers = useHMSStore(selectPeers)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(callType !== 'audio')
  const [callEnded, setCallEnded] = useState(false)
  const socketRef = window.socketRef
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  // Timer for call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Listen for remote call-ended event
  useEffect(() => {
    if (!socketRef) return

    socketRef.on('call-ended', () => {
      setCallEnded(true)
      handleEndCall()
    })

    return () => {
      socketRef.off('call-ended')
    }
  }, [socketRef])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleMuteToggle = async () => {
    try {
      await hmsActions.setLocalAudioEnabled(!isMuted)
      setIsMuted(!isMuted)
    } catch (error) {
      console.error('Error toggling audio:', error)
    }
  }

  const handleVideoToggle = async () => {
    if (callType === 'audio') return // Video toggle only for video calls

    try {
      await hmsActions.setLocalVideoEnabled(!isVideoOn)
      setIsVideoOn(!isVideoOn)
    } catch (error) {
      console.error('Error toggling video:', error)
    }
  }

  const handleEndCall = async () => {
    try {
      await hmsActions.leave()

      // Notify remote user
      if (socketRef) {
        socketRef.emit('call-ended', {
          targetUserId,
        })
      }

      onCallEnd()
    } catch (error) {
      console.error('Error ending call:', error)
      onCallEnd()
    }
  }

  if (callEnded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-900 mb-4">Call Ended</p>
          <p className="text-gray-600">Duration: {formatTime(callDuration)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Audio Call Layout */}
      {callType === 'audio' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
          {/* Avatar/Name Card */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-semibold">
                {targetUserId.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-semibold">{targetUserId}</p>
              <p className="text-gray-300 text-sm">Audio Call • {formatTime(callDuration)}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleMuteToggle}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              title="End Call"
            >
              <PhoneOff size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Video Call Layout */}
      {callType === 'video' && (
        <div className="flex-1 relative">
          {/* Remote video (main) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video (small, bottom-right) */}
          <div className="absolute bottom-4 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden border-4 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={handleMuteToggle}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <button
              onClick={handleVideoToggle}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <Video size={28} /> : <VideoOff size={28} />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              title="End Call"
            >
              <PhoneOff size={28} />
            </button>
          </div>

          {/* Call duration display */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-6 py-2 rounded-full text-lg font-semibold">
            {formatTime(callDuration)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveCall
