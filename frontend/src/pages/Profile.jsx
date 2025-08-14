import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiShield } from 'react-icons/fi';

const Profile = () => {
    const { user, updateProfile, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            showError('First name and last name are required');
            return;
        }

        setLoading(true);
        try {
            const result = await updateProfile(formData);
            if (result.success) {
                showSuccess('Profile updated successfully!');
                setIsEditing(false);
            } else {
                showError(result.message || 'Failed to update profile');
            }
        } catch (error) {
            showError('Failed to update profile');
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || ''
        });
        setIsEditing(false);
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '20px'
            }}>
                <div>
                    <h2>Please Sign In</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        You need to be signed in to view your profile.
                    </p>
                    <a href="/login" style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500'
                    }}>
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <h1 style={{
                            margin: 0,
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FiUser size={28} />
                            My Profile
                        </h1>

                        {user?.role === 'admin' && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#92400e'
                            }}>
                                <FiShield size={16} />
                                Administrator
                            </div>
                        )}
                    </div>

                    <p style={{ color: '#64748b', margin: 0 }}>
                        Manage your account information and preferences
                    </p>
                </div>

                {/* Profile Information */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px'
                    }}>
                        <h2 style={{ margin: 0, color: '#1e293b' }}>
                            Account Information
                        </h2>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <FiEdit2 size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        backgroundColor: loading ? '#94a3b8' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FiSave size={16} />
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FiX size={16} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {/* First Name Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter your first name"
                                />
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    color: '#374151'
                                }}>
                                    {user?.firstName || 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Last Name Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter your last name"
                                />
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    color: '#374151'
                                }}>
                                    {user?.lastName || 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Email Address
                            </label>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '16px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FiMail size={16} />
                                {user?.email}
                                <span style={{ fontSize: '12px', marginLeft: 'auto' }}>
                                    (Cannot be changed)
                                </span>
                            </div>
                        </div>

                        {/* Account Created */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Member Since
                            </label>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '16px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FiCalendar size={16} />
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '24px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '24px' }}>
                            0
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Total Orders
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '24px' }}>
                            0
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Wishlist Items
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '24px' }}>
                            {user?.role === 'admin' ? 'Admin' : 'Customer'}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Account Type
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;