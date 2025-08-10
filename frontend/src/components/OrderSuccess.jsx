import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheck, FiShoppingBag, FiMail } from 'react-icons/fi';

const OrderSuccess = () => {
    const location = useLocation();
    const { orderSuccess, orderId } = location.state || {};

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    if (!orderSuccess) {
        return null; // Don't show if not coming from successful order
    }

    return (
        <div style={{
            maxWidth: '600px',
            margin: '60px auto',
            padding: '40px 20px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: 'white',
                fontSize: '32px'
            }}>
                <FiCheck />
            </div>

            <h1 style={{
                fontSize: '32px',
                marginBottom: '16px',
                color: '#1e293b'
            }}>
                Order Placed Successfully!
            </h1>

            <p style={{
                fontSize: '18px',
                color: '#64748b',
                marginBottom: '24px',
                lineHeight: '1.6'
            }}>
                Thank you for your order! We've received your payment and will start processing your items right away.
            </p>

            {orderId && (
                <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '32px'
                }}>
                    <p style={{ margin: '0', fontSize: '14px', color: '#475569' }}>
                        <strong>Order ID:</strong> {orderId}
                    </p>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '24px',
                        color: '#2563eb',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <FiMail />
                    </div>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Confirmation Email</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                        Check your email for order details and tracking information
                    </p>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '24px',
                        color: '#2563eb',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <FiShoppingBag />
                    </div>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Processing Time</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                        Your order will be processed and shipped within 1-2 business days
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link to="/" className="btn btn-primary">
                    Continue Shopping
                </Link>
                <Link to="/orders" className="btn btn-secondary">
                    View Orders
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;