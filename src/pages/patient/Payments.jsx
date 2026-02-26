import { useState, useEffect } from 'react';
import {
    CreditCard,
    History,
    Plus,
    Trash2,
    ExternalLink,
    ChevronRight,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { paymentAPI } from '../../services/apiClient';

export const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const response = await paymentAPI.getHistory();
            setPayments(response.data.payments || []);
        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle2 size={14} /> };
            case 'pending':
                return { bg: '#fff3e0', color: '#ef6c00', icon: <Clock size={14} /> };
            case 'failed':
                return { bg: '#ffebee', color: '#c62828', icon: <XCircle size={14} /> };
            default:
                return { bg: '#f5f5f5', color: '#616161', icon: <AlertCircle size={14} /> };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Payments & Billing</h1>
                <p style={styles.subtitle}>Manage your payment methods and view transaction history.</p>
            </div>

            {/* Payment Methods Section */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Saved Methods</h2>
                    <button style={styles.addBtn}>
                        <Plus size={16} /> Add Method
                    </button>
                </div>

                <div style={styles.methodsGrid}>
                    <div style={styles.methodCard}>
                        <div style={styles.methodInfo}>
                            <div style={{ ...styles.methodIcon, background: '#f0f7ff' }}>
                                <CreditCard color="#0066cc" size={24} />
                            </div>
                            <div>
                                <p style={styles.methodName}>Visa ending in 4242</p>
                                <p style={styles.methodExpiry}>Expires 12/26</p>
                            </div>
                        </div>
                        <div style={styles.badge}>Default</div>
                    </div>

                    <div style={styles.methodCard}>
                        <div style={styles.methodInfo}>
                            <div style={{ ...styles.methodIcon, background: '#fff9eb' }}>
                                <DollarSign color="#f59e0b" size={24} />
                            </div>
                            <div>
                                <p style={styles.methodName}>PayPal (johndoe@example.com)</p>
                                <p style={styles.methodExpiry}>Connected</p>
                            </div>
                        </div>
                        <button style={styles.iconBtn} title="Remove">
                            <Trash2 size={16} color="#ef4444" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Transaction History Section */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Transaction History</h2>
                    <button style={styles.refreshBtn} onClick={fetchPaymentHistory} disabled={loading}>
                        <History size={16} /> {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loadingState}>
                        <div className="spinner"></div>
                        <p>Loading transactions...</p>
                    </div>
                ) : error ? (
                    <div style={styles.errorState}>
                        <AlertCircle size={40} color="#ef4444" />
                        <p>{error}</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div style={styles.emptyState}>
                        <History size={40} color="var(--text-light)" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div style={styles.historyList}>
                        {payments.map((payment) => {
                            const status = getStatusStyle(payment.status);
                            return (
                                <div key={payment._id} style={styles.historyItem}>
                                    <div style={styles.historyMain}>
                                        <div style={styles.doctorAvatar}>
                                            {payment.doctorId?.name?.charAt(0) || 'D'}
                                        </div>
                                        <div style={styles.historyDetails}>
                                            <p style={styles.historyName}>
                                                Dr. {payment.doctorId?.name || 'Medical Specialist'}
                                            </p>
                                            <p style={styles.historyMeta}>
                                                {formatDate(payment.createdAt)} • {payment.paymentMethod}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={styles.historyRight}>
                                        <div style={styles.amountContainer}>
                                            <p style={styles.amount}>${payment.amount}</p>
                                            <div style={{
                                                ...styles.statusBadge,
                                                background: status.bg,
                                                color: status.color
                                            }}>
                                                {status.icon}
                                                <span>{payment.status}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} color="var(--text-light)" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        flex: 1,
        overflowY: 'auto',
    },
    header: {
        marginBottom: '32px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '8px',
    },
    subtitle: {
        color: 'var(--text-light)',
        fontSize: '16px',
    },
    section: {
        marginBottom: '40px',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text-color)',
    },
    addBtn: {
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 102, 204, 0.2)',
    },
    refreshBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
    },
    methodsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
    },
    methodCard: {
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        ':hover': {
            borderColor: 'var(--primary-color)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }
    },
    methodInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    methodIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodName: {
        fontSize: '15px',
        fontWeight: '600',
        color: 'var(--text-color)',
        marginBottom: '2px',
    },
    methodExpiry: {
        fontSize: '13px',
        color: 'var(--text-light)',
    },
    badge: {
        background: '#e0f2fe',
        color: '#0369a1',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    iconBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
    },
    historyList: {
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    historyItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background 0.2s ease',
        cursor: 'pointer',
        ':last-child': {
            borderBottom: 'none',
        },
        // Hover handled by JS for inline styles or ignored for simplicity
    },
    historyMain: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    doctorAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--gradient)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '16px',
    },
    historyDetails: {
        flex: 1,
    },
    historyName: {
        fontSize: '15px',
        fontWeight: '600',
        color: 'var(--text-color)',
        marginBottom: '2px',
    },
    historyMeta: {
        fontSize: '13px',
        color: 'var(--text-light)',
    },
    historyRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    amountContainer: {
        textAlign: 'right',
    },
    amount: {
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '4px',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    loadingState: {
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-light)',
    },
    errorState: {
        padding: '40px',
        textAlign: 'center',
        color: '#ef4444',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
    },
    emptyState: {
        padding: '60px',
        textAlign: 'center',
        color: 'var(--text-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    }
};

export default PaymentsPage;
