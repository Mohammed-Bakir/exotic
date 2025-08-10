import React, { createContext, useContext, useState, useCallback } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Generate unique ID for each toast
    const generateId = () => Date.now() + Math.random();

    // Add a new toast
    const showToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 4000) => {
        const id = generateId();
        const newToast = {
            id,
            message,
            type,
            duration
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove toast after duration
        setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    }, []);

    // Remove a specific toast
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Clear all toasts
    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods for different toast types
    const showSuccess = useCallback((message, duration) => {
        return showToast(message, TOAST_TYPES.SUCCESS, duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        return showToast(message, TOAST_TYPES.ERROR, duration);
    }, [showToast]);

    const showWarning = useCallback((message, duration) => {
        return showToast(message, TOAST_TYPES.WARNING, duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration) => {
        return showToast(message, TOAST_TYPES.INFO, duration);
    }, [showToast]);

    const value = {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
        clearAllToasts
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};

// Custom hook to use toast context
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastContext;