import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Auth Context
const AuthContext = createContext();

// API base URL
const API_URL = 'http://localhost:5002/api';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Check authentication status
    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('exotic-token');
            if (!token) {
                setLoading(false);
                return;
            }

            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Verify token with backend
            const response = await axios.get(`${API_URL}/auth/me`);

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                // Token is invalid, remove it
                localStorage.removeItem('exotic-token');
                delete axios.defaults.headers.common['Authorization'];
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('exotic-token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);

            if (response.data.success) {
                const { token, user } = response.data;

                // Store token
                localStorage.setItem('exotic-token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Update state
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    // Login user
    const login = async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);

            if (response.data.success) {
                const { token, user } = response.data;

                // Store token
                localStorage.setItem('exotic-token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Update state
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please try again.'
            };
        }
    };

    // Logout user
    const logout = () => {
        // Remove token
        localStorage.removeItem('exotic-token');
        delete axios.defaults.headers.common['Authorization'];

        // Clear state
        setUser(null);
        setIsAuthenticated(false);
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            const response = await axios.put(`${API_URL}/auth/profile`, userData);

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed. Please try again.'
            };
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        try {
            const response = await axios.put(`${API_URL}/auth/change-password`, passwordData);

            if (response.data.success) {
                return { success: true, message: 'Password changed successfully' };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Password change failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Password change failed. Please try again.'
            };
        }
    };

    // Force refresh user data from server
    const refreshUserData = async () => {
        try {
            const token = localStorage.getItem('exotic-token');
            if (!token) {
                return { success: false, message: 'No token found' };
            }

            // Verify token with backend to get fresh user data
            const response = await axios.get(`${API_URL}/auth/me`);

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, user: response.data.user };
            } else {
                return { success: false, message: 'Failed to refresh user data' };
            }
        } catch (error) {
            console.error('Refresh user data failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to refresh user data'
            };
        }
    };

    const value = {
        // State
        user,
        loading,
        isAuthenticated,

        // Actions
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        checkAuthStatus,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;