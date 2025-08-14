import React, { useState } from 'react';
import { FiShield, FiUser, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const MakeAdmin = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const { user, isAuthenticated } = useAuth();
    const isAdmin = isAuthenticated && user?.role === 'admin';

    const makeAdmin = async (e) => {
        e.preventDefault();

        if (!email) {
            setResult({ success: false, message: 'Please enter an email address' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.post(`${API_BASE_URL}/api/make-admin`, {
                email
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setResult({
                success: true,
                message: `Success! ${email} is now an admin. You can now access the admin dashboard.`
            });
        } catch (error) {
            console.error('Make admin error:', error);
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to make user admin. Make sure the email exists.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Check authentication and admin status
    if (!isAuthenticated) {
        return (
            <div style={{
                maxWidth: '500px',
                margin: '40px auto',
                padding: '32px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <FiShield style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Authentication Required</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Please log in to access admin promotion features.
                </p>
                <Link
                    to="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500'
                    }}
                >
                    Sign In
                    <FiArrowRight />
                </Link>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{
                maxWidth: '500px',
                margin: '40px auto',
                padding: '32px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <FiShield style={{ fontSize: '64px', color: '#ef4444', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Admin Access Required</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Only existing admins can promote other users to admin status.
                </p>
                <Link
                    to="/admin"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500'
                    }}
                >
                    Go to Admin Dashboard
                    <FiArrowRight />
                </Link>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '32px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
            }}>
                <FiShield style={{ color: '#2563eb', fontSize: '32px' }} />
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                        Admin Promotion
                    </h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
                        Promote a user account to admin status
                    </p>
                </div>
            </div>

            <div style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#059669'
            }}>
                <strong>✅ Admin Access Confirmed</strong><br />
                You are logged in as {user?.firstName} {user?.lastName} with admin privileges.
            </div>

            <form onSubmit={makeAdmin}>
                <div style={{ marginBottom: '20px' }}>
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
                        placeholder="Enter the email address to make admin"
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

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: loading ? '#94a3b8' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <FiUser />
                    {loading ? 'Promoting to Admin...' : 'Make Admin'}
                </button>
            </form>

            {result && (
                <div style={{
                    marginTop: '20px',
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

            <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1e40af'
            }}>
                <strong>Note:</strong> This is a temporary development feature. In production, admin roles should be managed through a secure process.
            </div>
        </div>
    );
};

export default MakeAdmin;