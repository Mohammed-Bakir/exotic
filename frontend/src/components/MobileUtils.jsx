import React, { useState, useEffect } from 'react';

// Hook to detect mobile device
export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
};

// Hook to detect screen size
export const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setScreenSize({
                width,
                height,
                isMobile: width <= 768,
                isTablet: width > 768 && width <= 1024,
                isDesktop: width > 1024
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSize;
};

// Mobile-responsive container component
export const ResponsiveContainer = ({ children, className = '', style = {} }) => {
    const { isMobile } = useScreenSize();

    const containerStyle = {
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 20px',
        ...style
    };

    return (
        <div className={`responsive-container ${className}`} style={containerStyle}>
            {children}
        </div>
    );
};

// Mobile-responsive grid component
export const ResponsiveGrid = ({
    children,
    columns = { mobile: 1, tablet: 2, desktop: 3 },
    gap = { mobile: '16px', tablet: '20px', desktop: '24px' },
    className = '',
    style = {}
}) => {
    const { isMobile, isTablet, isDesktop } = useScreenSize();

    let gridColumns = columns.mobile;
    let gridGap = gap.mobile;

    if (isTablet) {
        gridColumns = columns.tablet;
        gridGap = gap.tablet;
    } else if (isDesktop) {
        gridColumns = columns.desktop;
        gridGap = gap.desktop;
    }

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: gridGap,
        ...style
    };

    return (
        <div className={`responsive-grid ${className}`} style={gridStyle}>
            {children}
        </div>
    );
};

// Mobile-responsive button component
export const ResponsiveButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    fullWidthOnMobile = true,
    className = '',
    style = {},
    ...props
}) => {
    const { isMobile } = useScreenSize();

    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        ...style
    };

    // Size styles
    const sizeStyles = {
        small: {
            padding: isMobile ? '10px 16px' : '8px 16px',
            fontSize: isMobile ? '14px' : '12px',
            minHeight: isMobile ? '44px' : 'auto'
        },
        medium: {
            padding: isMobile ? '12px 24px' : '12px 24px',
            fontSize: isMobile ? '16px' : '14px',
            minHeight: isMobile ? '48px' : 'auto'
        },
        large: {
            padding: isMobile ? '16px 32px' : '16px 32px',
            fontSize: isMobile ? '18px' : '16px',
            minHeight: isMobile ? '52px' : 'auto'
        }
    };

    // Variant styles
    const variantStyles = {
        primary: {
            backgroundColor: '#2563eb',
            color: 'white'
        },
        secondary: {
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0'
        },
        danger: {
            backgroundColor: '#ef4444',
            color: 'white'
        },
        success: {
            backgroundColor: '#10b981',
            color: 'white'
        }
    };

    const buttonStyle = {
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: (isMobile && fullWidthOnMobile) ? '100%' : 'auto'
    };

    return (
        <button
            className={`responsive-button ${className}`}
            style={buttonStyle}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

// Mobile-responsive card component
export const ResponsiveCard = ({
    children,
    padding = { mobile: '16px', desktop: '24px' },
    className = '',
    style = {}
}) => {
    const { isMobile } = useScreenSize();

    const cardStyle = {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: isMobile ? '8px' : '12px',
        padding: isMobile ? padding.mobile : padding.desktop,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        ...style
    };

    return (
        <div className={`responsive-card ${className}`} style={cardStyle}>
            {children}
        </div>
    );
};

// Mobile-responsive text component
export const ResponsiveText = ({
    children,
    variant = 'body',
    className = '',
    style = {}
}) => {
    const { isMobile } = useScreenSize();

    const textStyles = {
        h1: {
            fontSize: isMobile ? '28px' : '32px',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: isMobile ? '16px' : '20px'
        },
        h2: {
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '600',
            lineHeight: '1.3',
            marginBottom: isMobile ? '12px' : '16px'
        },
        h3: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            lineHeight: '1.3',
            marginBottom: isMobile ? '10px' : '12px'
        },
        body: {
            fontSize: isMobile ? '16px' : '14px',
            lineHeight: '1.6',
            marginBottom: isMobile ? '12px' : '8px'
        },
        small: {
            fontSize: isMobile ? '14px' : '12px',
            lineHeight: '1.5',
            color: '#64748b'
        }
    };

    const textStyle = {
        ...textStyles[variant],
        ...style
    };

    const Tag = variant.startsWith('h') ? variant : 'p';

    return (
        <Tag className={`responsive-text ${className}`} style={textStyle}>
            {children}
        </Tag>
    );
};

// Mobile navigation helper
export const MobileNavigation = ({ isOpen, onClose, children }) => {
    const { isMobile } = useScreenSize();

    if (!isMobile) return null;

    return (
        <>
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 998
                    }}
                    onClick={onClose}
                />
            )}
            <div
                style={{
                    position: 'fixed',
                    top: '60px',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'all 0.3s ease',
                    zIndex: 999,
                    padding: '20px',
                    maxHeight: 'calc(100vh - 60px)',
                    overflowY: 'auto'
                }}
            >
                {children}
            </div>
        </>
    );
};

export default {
    useIsMobile,
    useScreenSize,
    ResponsiveContainer,
    ResponsiveGrid,
    ResponsiveButton,
    ResponsiveCard,
    ResponsiveText,
    MobileNavigation
};