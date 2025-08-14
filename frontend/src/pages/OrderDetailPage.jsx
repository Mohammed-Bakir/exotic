import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiPackage, FiTruck, FiCheck, FiX, FiClock,
    FiRefreshCw, FiMapPin, FiCreditCard, FiPhone, FiMail,
    FiCalendar, FiShoppingBag
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function OrderDetailPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const { isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch order details
    const fetchOrder = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('exotic-token');
            const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrder(response.data.order);
            } else {
                showError('Order not found');
                navigate('/orders');
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
            showError('Failed to load order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && orderId) {
            fetchOrder();
        }
    }, [isAuthenticated, orderId]);

    // Cancel order
    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancelling(true);
            const token = localStorage.getItem('exotic-token');
            const response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrder(response.data.order);
                showSuccess('Order cancelled successfully');
            } else {
                showError(response.data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            showError(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    // Reorder items
    const handleReorder = () => {
        order.items.forEach(item => {
            addToCart({
                _id: item.product,
                title: item.title,
                price: item.price,
                images: [item.image]
            }, item.quantity, item.selectedColor);
        });
        showSuccess(`${order.items.length} items added to cart!`);
        navigate('/cart');
    };

    // Get status info
    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { color: '#f59e0b', icon: FiClock, text: 'Pending', description: 'Your order is being processed' },
            confirmed: { color: '#3b82f6', icon: FiCheck, text: 'Confirmed', description: 'Your order has been confirmed' },
            processing: { color: '#8b5cf6', icon: FiRefreshCw, text: 'Processing', description: 'Your order is being prepared' },
            shipped: { color: '#10b981', icon: FiTruck, text: 'Shipped', description: 'Your order is on the way' },
            delivered: { color: '#059669', icon: FiCheck, text: 'Delivered', description: 'Your order has been delivered' },
            cancelled: { color: '#ef4444', icon: FiX, text: 'Cancelled', description: 'Your order has been cancelled' }
        };
        return statusMap[status] || statusMap.pending;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get order progress
    const getOrderProgress = (status) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(status);
        return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <FiRefreshCw style={{ fontSize: '48px', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: '#64748b' }}>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <FiPackage style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Order Not Found</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    The order you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Link
                    to="/orders"
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
                    <FiArrowLeft />
                    Back to Orders
                </Link>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link
                    to="/orders"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#2563eb',
                        textDecoration: 'none',
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <FiArrowLeft />
                    Back to Orders
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
                            Order #{order.orderNumber}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>
                            Placed on {formatDate(order.orderDate)}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {canCancel && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    border: '1px solid #ef4444',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#ef4444',
                                    cursor: cancelling ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    opacity: cancelling ? 0.6 : 1
                                }}
                            >
                                {cancelling ? <FiRefreshCw className="spin" /> : <FiX />}
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}

                        <button
                            onClick={handleReorder}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                border: '1px solid #2563eb',
                                borderRadius: '6px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <FiShoppingBag />
                            Reorder
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
                {/* Main Content */}
                <div>
                    {/* Order Status */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: `${statusInfo.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <StatusIcon style={{ fontSize: '24px', color: statusInfo.color }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                                    {statusInfo.text}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>
                                    {statusInfo.description}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {order.status !== 'cancelled' && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${getOrderProgress(order.status)}%`,
                                        height: '100%',
                                        backgroundColor: statusInfo.color,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '8px',
                                    fontSize: '12px',
                                    color: '#64748b'
                                }}>
                                    <span>Pending</span>
                                    <span>Confirmed</span>
                                    <span>Processing</span>
                                    <span>Shipped</span>
                                    <span>Delivered</span>
                                </div>
                            </div>
                        )}

                        {/* Estimated Delivery */}
                        {order.estimatedDelivery && order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FiCalendar style={{ color: '#2563eb' }} />
                                <span style={{ fontSize: '14px' }}>
                                    Estimated delivery: {formatDate(order.estimatedDelivery)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                            Order Items ({order.items.length})
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        gap: '16px',
                                        padding: '16px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                                            Color: {item.selectedColor}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#64748b' }}>
                                                Quantity: {item.quantity}
                                            </span>
                                            <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiMapPin style={{ color: '#2563eb' }} />
                            Shipping Address
                        </h3>
                        <div style={{ color: '#475569', lineHeight: '1.6' }}>
                            <p style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            <p>{order.shippingAddress.address}</p>
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                                <p style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiPhone size={14} />
                                    {order.shippingAddress.phone}
                                </p>
                            )}
                            <p style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiMail size={14} />
                                {order.shippingAddress.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Order Summary */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                            Order Summary
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Shipping</span>
                                <span>${order.shippingCost.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                                    <span>Discount</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '12px',
                                borderTop: '1px solid #e2e8f0',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCreditCard style={{ color: '#2563eb' }} />
                            Payment Method
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span>
                            <span style={{
                                padding: '2px 8px',
                                backgroundColor: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7',
                                color: order.paymentStatus === 'paid' ? '#166534' : '#92400e',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                textTransform: 'capitalize'
                            }}>
                                {order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                            Order Information
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Order ID</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{order._id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Shipping Method</span>
                                <span style={{ textTransform: 'capitalize' }}>
                                    {order.shippingMethod} Shipping
                                </span>
                            </div>
                            {order.trackingNumber && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Tracking Number</span>
                                    <span style={{ fontFamily: 'monospace' }}>{order.trackingNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;