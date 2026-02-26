import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Stethoscope,
    Send,
    User,
    Bot,
    AlertTriangle,
    ArrowRight,
    ChevronLeft,
    Sparkles,
    Info
} from 'lucide-react'
import { aiAPI } from '../../services/apiClient'

export const SymptomChecker = () => {
    const navigate = useNavigate()
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            content: 'Hello! I am your AI Symptom Checker. Please describe what symptoms you are feeling today.',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [showAnalysis, setShowAnalysis] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        if (e) e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = {
            sender: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await aiAPI.symptomCheck([...messages, userMessage])

            const aiResponse = {
                sender: 'ai',
                content: response.data.message,
                timestamp: new Date(),
                data: response.data
            }

            setMessages(prev => [...prev, aiResponse])

            if (response.data.flowStep === 'result') {
                setResult(response.data)
                setShowAnalysis(true)
            }
        } catch (error) {
            console.error('Symptom check error:', error)
            setMessages(prev => [...prev, {
                sender: 'ai',
                content: 'I encountered an error. Please try again or consult a doctor.',
                timestamp: new Date()
            }])
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div style={styles.container}>
            {/* Chat Header */}
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <div style={styles.headerContent}>
                    <h2 style={styles.title}>AI Symptom Checker</h2>
                    <p style={styles.status}>
                        <Sparkles size={12} style={{ marginRight: '4px' }} />
                        Always Active
                    </p>
                </div>
                {result && (
                    <button
                        style={styles.analysisToggle}
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        title="View Analysis"
                    >
                        <Info size={20} />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div style={styles.messagesContainer}>
                {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender === 'user'
                    return (
                        <div key={index} style={{ width: '100%' }}>
                            <div
                                style={{
                                    ...styles.messageRow,
                                    ...(isOwnMessage ? styles.messageRowOwn : styles.messageRowOther),
                                }}
                            >
                                {!isOwnMessage && (
                                    <div style={styles.avatar}>
                                        <Bot size={18} />
                                    </div>
                                )}
                                <div
                                    style={{
                                        ...styles.messageBubble,
                                        ...(isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther),
                                    }}
                                >
                                    <p style={styles.messageContent}>{msg.content}</p>
                                    <span style={styles.messageTime}>{formatTime(msg.timestamp)}</span>
                                </div>
                                {isOwnMessage && (
                                    <div style={{ ...styles.avatar, background: 'var(--primary-color)' }}>
                                        <User size={18} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {loading && (
                    <div style={styles.messageRow}>
                        <div style={styles.avatar}><Bot size={18} /></div>
                        <div style={{ ...styles.messageBubble, ...styles.messageBubbleOther }}>
                            <div style={styles.loadingDots}>
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Analysis Overlay/Sidebar */}
            {result && showAnalysis && (
                <div style={styles.analysisOverlay}>
                    <div style={styles.analysisHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Stethoscope color="var(--primary-color)" />
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Health Analysis</h3>
                        </div>
                        <button style={styles.closeBtn} onClick={() => setShowAnalysis(false)}>×</button>
                    </div>

                    <div style={{ ...styles.urgencyBadge, background: result.urgencyLevel === 'High' ? '#fee2e2' : '#f0f9ff', color: result.urgencyLevel === 'High' ? '#b91c1c' : '#0369a1' }}>
                        <AlertTriangle size={16} />
                        <span>Urgency: {result.urgencyLevel}</span>
                    </div>

                    <div style={styles.analysisSection}>
                        <h4 style={styles.sectionTitle}>Possible Conditions</h4>
                        <ul style={styles.conditionList}>
                            {result.possibleConditions.map((c, i) => (
                                <li key={i} style={styles.conditionItem}>{c}</li>
                            ))}
                        </ul>
                    </div>

                    {result.suggestDoctor && (
                        <div style={styles.suggestionBox}>
                            <p style={{ fontSize: '13px', marginBottom: '12px' }}>We recommend booking a consultation with a specialist for a proper diagnosis.</p>
                            <button
                                style={styles.primaryButton}
                                onClick={() => navigate('/patient/doctors')}
                            >
                                Book a Doctor <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    )}

                    <p style={styles.disclaimer}>
                        Note: This AI analysis is for informational purposes only.
                    </p>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} style={styles.inputContainer}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms..."
                    disabled={loading}
                    style={styles.input}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    style={{
                        ...styles.sendBtn,
                        opacity: loading || !input.trim() ? 0.5 : 1
                    }}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--gradient)',
        color: 'white',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10,
    },
    backBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: '18px',
        fontWeight: '700',
        margin: '0',
    },
    status: {
        fontSize: '12px',
        margin: '0',
        opacity: '0.9',
        display: 'flex',
        alignItems: 'center',
    },
    analysisToggle: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        padding: '8px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    messageRow: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        width: '100%',
    },
    messageRowOther: {
        justifyContent: 'flex-start',
    },
    messageRowOwn: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--gradient)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: '20px',
        position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    messageBubbleOther: {
        background: 'white',
        color: 'var(--text-color)',
        borderBottomLeftRadius: '4px',
    },
    messageBubbleOwn: {
        background: 'var(--primary-color)',
        color: 'white',
        borderBottomRightRadius: '4px',
    },
    messageContent: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        lineHeight: '1.5',
    },
    messageTime: {
        fontSize: '10px',
        opacity: '0.7',
        display: 'block',
        textAlign: 'right',
    },
    loadingDots: {
        display: 'flex',
        gap: '4px',
        fontSize: '20px',
        lineHeight: '10px',
        color: 'var(--text-light)',
    },
    inputContainer: {
        display: 'flex',
        gap: '12px',
        padding: '16px',
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        fontSize: '14px',
        outline: 'none',
        background: '#f1f5f9',
    },
    sendBtn: {
        background: 'var(--gradient)',
        border: 'none',
        color: 'white',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 102, 204, 0.3)',
    },
    analysisOverlay: {
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        right: '20px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        padding: '20px',
        zIndex: 50,
        maxHeight: '70%',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out',
    },
    analysisHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        color: '#64748b',
        cursor: 'pointer',
    },
    urgencyBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px',
    },
    analysisSection: {
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#475569',
        marginBottom: '10px',
    },
    conditionList: {
        margin: 0,
        paddingLeft: '20px',
    },
    conditionItem: {
        fontSize: '14px',
        color: '#1e293b',
        marginBottom: '6px',
    },
    suggestionBox: {
        background: '#f8fafc',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    primaryButton: {
        width: '100%',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    disclaimer: {
        fontSize: '11px',
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: '16px',
        fontStyle: 'italic',
    }
}

export default SymptomChecker
