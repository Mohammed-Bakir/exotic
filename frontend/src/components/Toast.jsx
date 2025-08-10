import React, { useEffect, useState } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { useToast, TOAST_TYPES } from '../context/ToastContext';

// Individual Toast Component
const Toast = ({ toast }) => {
    const { removeToast } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Animation effect
    useEffect(() => {
        // Trigger enter animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Handle manual close
    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            removeToast(toast.id);
        }, 300); // Match the CSS transition duration
    };

    // Auto close animation before removal
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
        }, toast.duration - 300); // Start exit animation 300ms before removal

        return () => clearTimeout(timer);
    }, [toast.duration]);

    // Get icon based on toast type
    const getIcon = () => {
        switch (toast.type) {
            case TOAST_TYPES.SUCCESS:
                return <FiCheck />;
            case TOAST_TYPES.ERROR:
                return <FiAlertCircle />;
            case TOAST_TYPES.WARNING:
                return <FiAlertTriangle />;
            case TOAST_TYPES.INFO:
            default:
                return <FiInfo />;
        }
    };

    // Get CSS classes based on toast type
    const getToastClasses = () => {
        const baseClasses = 'toast';
        const typeClass = `toast-${toast.type}`;
        const visibilityClass = isVisible && !isLeaving ? 'toast-visible' : '';
        const leavingClass = isLeaving ? 'toast-leaving' : '';

        return `${baseClasses} ${typeClass} ${visibilityClass} ${leavingClass}`.trim();
    };

    return (
        <div className={getToastClasses()}>
            <div className="toast-icon">
                {getIcon()}
            </div>
            <div className="toast-content">
                <p className="toast-message">{toast.message}</p>
            </div>
            <button
                className="toast-close"
                onClick={handleClose}
                aria-label="Close notification"
            >
                <FiX />
            </button>
        </div>
    );
};

// Toast Container Component
const ToastContainer = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default ToastContainer;