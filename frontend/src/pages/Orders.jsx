import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiX, FiClock, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { user, isAuthenticated } = useAuth();
    const { showError } = useToast();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch orders
    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('exotic-token');
            const response = await axios.get(`http://localhost:5002/api/orders?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
                setCurrentPage(response.data.pagination.current);
                setTotalPages(response.data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            showError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    // Get status color and icon
    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { color: '#f59e0b', icon: FiClock, text: 'Pending' },
            confirmed: { color: '#3b82f6', icon: FiCheck, text: 'Confirmed' },
            processing: { color: '#8b5cf6', icon: FiRefreshCw, text: 'Processing' },
            shipped: { color: '#10b981', icon: FiTruck, text: 'Shipped' },
            delivered: { color: '#059669', icon: FiCheck, text: 'Delivered' },
            cancelled: { color: '#ef4444', icon: FiX, text: 'Cancelled' }
        };
        return statusMap[status] || statusMap.pending;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    <p style={{ marginTop: '16px', color: '#64748b' }}>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiPackage style={{ color: '#2563eb' }} />
                    My Orders
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px' }}>
                    Track and manage your orders
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px'
            }}>
                {[
                    { key: 'all', label: 'All Orders' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'confirmed', label: 'Confirmed' },
                    { key: 'processing', label: 'Processing' },
                    { key: 'shipped', label: 'Shipped' },
                    { key: 'delivered', label: 'Delivered' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: filter === tab.key ? '#2563eb' : 'transparent',
                            color: filter === tab.key ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                }}>
                    <FiPackage style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#475569' }}>
                        {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        {filter === 'all'
                            ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                            : `You don't have any ${filter} orders at the moment.`
                        }
                    </p>
                    {filter === 'all' && (
                        <Link
                            to="/products"
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
                            Start Shopping
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredOrders.map(order => {
                        const statusInfo = getStatusInfo(order.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div
                                key={order._id}
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {/* Order Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '16px',
                                    flexWrap: 'wrap',
                                    gap: '16px'
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            marginBottom: '4px'
                                        }}>
                                            Order #{order.orderNumber}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                                            Placed on {formatDate(order.orderDate)}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            backgroundColor: `${statusInfo.color}15`,
                                            color: statusInfo.color,
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                            <StatusIcon size={14} />
                                            {statusInfo.text}
                                        </div>

                                        <Link
                                            to={`/orders/${order._id}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 16px',
                                                backgroundColor: '#f1f5f9',
                                                color: '#475569',
                                                textDecoration: 'none',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <FiEye size={14} />
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {order.items.slice(0, 3).map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#f8fafc',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <span>{item.title}</span>
                                                <span style={{
                                                    color: '#64748b',
                                                    fontSize: '12px'
                                                }}>
                                                    ×{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                backgroundColor: '#f1f5f9',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                color: '#64748b'
                                            }}>
                                                +{order.items.length - 3} more items
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} •
                                        {order.shippingMethod === 'express' ? ' Express' : ' Standard'} Shipping
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1e293b'
                                    }}>
                                        ${order.total.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '32px'
                }}>
                    <button
                        onClick={() => fetchOrders(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: currentPage === 1 ? '#f8fafc' : 'white',
                            color: currentPage === 1 ? '#94a3b8' : '#475569',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>

                    <span style={{
                        padding: '8px 16px',
                        color: '#64748b',
                        fontSize: '14px'
                    }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => fetchOrders(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: currentPage === totalPages ? '#f8fafc' : 'white',
                            color: currentPage === totalPages ? '#94a3b8' : '#475569',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Orders;