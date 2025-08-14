import React from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const UserDebug = () => {
    const { user, isAuthenticated, refreshUserData } = useAuth();

    return (
        <div style={{
            maxWidth: '600px',
            margin: '40px auto',
            padding: '24px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontFamily: 'monospace'
        }}>
            <h2 style={{ marginBottom: '20px' }}>User Debug Information</h2>

            <div style={{ marginBottom: '16px' }}>
                <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <strong>User Object:</strong>
                <pre style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontSize: '12px'
                }}>
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <strong>User Role:</strong> {user?.role || 'Not set'}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <strong>Is Admin Check:</strong> {(isAuthenticated && user?.role === 'admin') ? 'Yes' : 'No'}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <strong>Token in localStorage:</strong> {localStorage.getItem('exotic-token') ? 'Present' : 'Missing'}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => {
                        console.log('=== USER DEBUG INFO ===');
                        console.log('isAuthenticated:', isAuthenticated);
                        console.log('user:', user);
                        console.log('user.role:', user?.role);
                        console.log('isAdmin:', isAuthenticated && user?.role === 'admin');
                        console.log('token:', localStorage.getItem('exotic-token'));
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Log Debug Info to Console
                </button>

                <button
                    onClick={async () => {
                        try {
                            const token = localStorage.getItem('exotic-token');
                            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            const data = await response.json();
                            console.log('=== FRESH USER DATA FROM SERVER ===');
                            console.log('Response:', data);
                            if (data.success) {
                                console.log('Fresh user role:', data.user.role);
                            }
                        } catch (error) {
                            console.error('Error fetching fresh user data:', error);
                        }
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Check Fresh User Data
                </button>

                <button
                    onClick={async () => {
                        console.log('Refreshing user data...');
                        const result = await refreshUserData();
                        console.log('Refresh result:', result);
                        if (result.success) {
                            console.log('✅ User data refreshed! New role:', result.user.role);
                            alert(`✅ User data refreshed! Your role is now: ${result.user.role}`);
                        } else {
                            console.log('❌ Failed to refresh:', result.message);
                            alert(`❌ Failed to refresh: ${result.message}`);
                        }
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Refresh User Data
                </button>
            </div>
        </div>
    );
};

export default UserDebug;