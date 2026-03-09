import { useState, useEffect, useRef } from 'react'
import { useHMSActions, useHMSStore, selectPeers } from '@100mslive/react-sdk'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, Volume1 } from 'lucide-react'

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
    if (callType === 'audio') return

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
      <div style={styles.callEndedOverlay}>
        <div style={styles.callEndedCard}>
          <p style={styles.callEndedTitle}>Call Ended</p>
          <p style={styles.callEndedDuration}>Duration: {formatTime(callDuration)}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Audio Call Layout */}
      {callType === 'audio' && (
        <div style={styles.audioContainer}>
          {/* Header */}
          <div style={styles.audioHeader}>
            <button
              onClick={onCallEnd}
              style={styles.backButton}
              title="Minimize call"
            >
              ← Minimize
            </button>
          </div>

          {/* Main Content */}
          <div style={styles.audioContent}>
            {/* Animated Avatar */}
            <div style={styles.avatarWrapper}>
              <div style={styles.pulsing}></div>
              <div style={styles.avatar}>
                {targetUserId.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Call Info */}
            <div style={styles.callInfo}>
              <h2 style={styles.callerName}>{targetUserId}</h2>
              <p style={styles.callStatus}>
                <span style={styles.onlineDot}></span> On Call
              </p>
              <p style={styles.callDuration}>{formatTime(callDuration)}</p>
            </div>

            {/* Volume Indicator */}
            <div style={styles.volumeIndicator}>
              {isMuted ? (
                <Volume1 size={20} style={{ color: '#9CA3AF' }} />
              ) : (
                <Volume2 size={20} style={{ color: '#1A73E8' }} />
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={styles.audioControls}>
            <button
              onClick={handleMuteToggle}
              style={{
                ...styles.controlButton,
                ...(isMuted ? styles.controlButtonActive : styles.controlButtonInactive),
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              <span style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={handleEndCall}
              style={{ ...styles.controlButton, ...styles.endCallButton }}
              title="End Call"
            >
              <PhoneOff size={24} />
              <span style={styles.controlLabel}>End Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Call Layout */}
      {callType === 'video' && (
        <div style={styles.videoContainer}>
          {/* Remote video (main) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.remoteVideo}
          />

          {/* Local video (small, top-right) */}
          <div style={styles.localVideoWrapper}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={styles.localVideo}
            />
            <span style={styles.localVideoLabel}>You</span>
          </div>

          {/* Top Bar - Participant Info */}
          <div style={styles.videoTopBar}>
            <div style={styles.participantInfo}>
              <span style={styles.participantName}>{targetUserId}</span>
              <span style={styles.callTimer}>{formatTime(callDuration)}</span>
            </div>
          </div>

          {/* Controls Overlay */}
          <div style={styles.videoControlsContainer}>
            <div style={styles.videoControls}>
              <button
                onClick={handleMuteToggle}
                style={{
                  ...styles.videoButton,
                  ...(isMuted ? styles.videoButtonActive : {}),
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              <button
                onClick={handleVideoToggle}
                style={{
                  ...styles.videoButton,
                  ...(isVideoOn ? {} : styles.videoButtonActive),
                }}
                title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
              </button>

              <button
                onClick={handleEndCall}
                style={{ ...styles.videoButton, ...styles.videoEndCallButton }}
                title="End Call"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    background: '#ffffff',
  },

  // Audio Call Styles
  audioContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  audioHeader: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  audioContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '20px',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
    width: '140px',
    height: '140px',
  },
  pulsing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  avatar: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '56px',
    fontWeight: 'bold',
    color: 'white',
    border: '4px solid white',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },
  callInfo: {
    textAlign: 'center',
    color: 'white',
  },
  callerName: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  callStatus: {
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '0 0 16px 0',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10B981',
    display: 'inline-block',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  callDuration: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'monospace',
  },
  volumeIndicator: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '12px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioControls: {
    display: 'flex',
    gap: '16px',
    padding: '30px 20px',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  controlButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
    color: 'white',
    minWidth: '100px',
  },
  controlButtonInactive: {
    background: 'rgba(255, 255, 255, 0.15)',
  },
  controlButtonActive: {
    background: '#EF4444',
  },
  controlLabel: {
    fontSize: '12px',
    opacity: 0.95,
  },
  endCallButton: {
    background: '#DC2626',
    color: 'white',
  },

  // Video Call Styles
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#000000',
    overflow: 'hidden',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  localVideoWrapper: {
    position: 'absolute',
    bottom: '100px',
    right: '16px',
    width: '120px',
    height: '160px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '3px solid white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    background: '#1a1a1a',
  },
  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  localVideoLabel: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  videoTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '16px 20px',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, transparent 100%)',
    display: 'flex',
    justifyContent: 'center',
  },
  participantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '12px 20px',
    borderRadius: '20px',
  },
  participantName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
  },
  callTimer: {
    color: '#FBBF24',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  videoControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '24px 20px',
    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
    display: 'flex',
    justifyContent: 'center',
  },
  videoControls: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  videoButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)',
  },
  videoButtonActive: {
    background: '#EF4444',
  },
  videoEndCallButton: {
    background: '#DC2626',
    padding: 0,
  },
  callEndedOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  callEndedCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    padding: '32px 24px',
    textAlign: 'center',
    maxWidth: '320px',
  },
  callEndedTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  callEndedDuration: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
}

export default ActiveCall
