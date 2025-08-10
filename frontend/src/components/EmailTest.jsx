import React, { useState } from 'react';
import { FiMail, FiSend, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import axios from 'axios';

const EmailTest = () => {
    const [email, setEmail] = useState('');
    const [emailType, setEmailType] = useState('welcome');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    const sendTestEmail = async (e) => {
        e.preventDefault();

        if (!email) {
            setResult({ success: false, message: 'Please enter an email address' });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.post('http://localhost:5002/api/admin/test-email', {
                email,
                type: emailType
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const templateNames = {
                'welcome': 'Welcome Email Template',
                'order-confirmation': 'Order Confirmation Template',
                'status-update': 'Order Status Update Template'
            };

            setResult({
                success: true,
                message: `${templateNames[emailType]} sent successfully! Check your inbox for the professional email.`
            });
        } catch (error) {
            console.error('Test email error:', error);
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to send test email. Check your email configuration.'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
            }}>
                <FiMail style={{ color: '#2563eb', fontSize: '24px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    Test Email Configuration
                </h3>
            </div>

            <p style={{ color: '#64748b', marginBottom: '20px' }}>
                Test your professional email templates with realistic sample data. Choose from welcome emails, order confirmations, or status updates.
            </p>

            <form onSubmit={sendTestEmail}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        fontSize: '14px'
                    }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        fontSize: '14px'
                    }}>
                        Email Template
                    </label>
                    <select
                        value={emailType}
                        onChange={(e) => setEmailType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="welcome">Welcome Email Template</option>
                        <option value="order-confirmation">Order Confirmation Template</option>
                        <option value="status-update">Order Status Update Template</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: sending ? '#94a3b8' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    {sending ? (
                        <>
                            <FiLoader className="spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <FiSend />
                            Send Test Email
                        </>
                    )}
                </button>
            </form>

            {result && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {result.success ? (
                        <FiCheck style={{ color: '#059669' }} />
                    ) : (
                        <FiX style={{ color: '#dc2626' }} />
                    )}
                    <span style={{
                        color: result.success ? '#059669' : '#dc2626',
                        fontSize: '14px'
                    }}>
                        {result.message}
                    </span>
                </div>
            )}
        </div>
    );
};

export default EmailTest;