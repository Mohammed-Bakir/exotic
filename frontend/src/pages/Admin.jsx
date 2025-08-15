import React, { useState, useEffect } from 'react';
import {
    FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiMail,
    FiRefreshCw, FiCheck, FiX, FiEye, FiShield, FiBarChart2,
    FiClock, FiTruck, FiStar, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmailTest from '../components/EmailTest';
import SimpleAnalytics from '../components/SimpleAnalytics';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Add CSS animations
const styles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.admin-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.admin-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.status-badge {
    transition: all 0.2s ease;
}

.status-badge:hover {
    transform: scale(1.05);
}

.action-button {
    transition: all 0.2s ease;
}

.action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [sortBy, setSortBy] = useState('newest');

    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();

    // Check if user is admin
    const isAdmin = isAuthenticated && user?.role === 'admin';

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            if (error.response?.status === 403) {
                showError('Access denied. Admin privileges required.');
            } else {
                showError('Failed to load dashboard data');
            }
        }
    };

    // Fetch orders
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            showError('Failed to load orders');
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            showError('Failed to load users');
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));

            const token = localStorage.getItem('exotic-token');
            const response = await axios.put(
                `${API_BASE_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                showSuccess(`📧 Order status updated to ${newStatus} and email sent!`);
                setOrders(prev => prev.map(order =>
                    order._id === orderId
                        ? { ...order, status: newStatus }
                        : order
                ));
                // Refresh dashboard data
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            showError(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Update user role
    const updateUserRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.put(
                `${API_BASE_URL}/api/admin/users/${userId}/role`,
                { role: newRole },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                showSuccess(`User role updated to ${newRole}`);
                setUsers(prev => prev.map(u =>
                    u._id === userId ? { ...u, role: newRole } : u
                ));
            }
        } catch (error) {
            console.error('Failed to update user role:', error);
            showError('Failed to update user role');
        }
    };

    // Toggle user status
    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('exotic-token');
            const response = await axios.put(
                `${API_BASE_URL}/api/admin/users/${userId}/status`,
                { isActive: !currentStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
                setUsers(prev => prev.map(u =>
                    u._id === userId ? { ...u, isActive: !currentStatus } : u
                ));
            }
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            showError('Failed to update user status');
        }
    };

    // Toggle order expansion
    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    // Filter and sort orders
    const getFilteredOrders = () => {
        let filtered = orders.filter(order => {
            const matchesSearch = searchTerm === '' ||
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Sort orders
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.orderDate) - new Date(a.orderDate);
                case 'oldest':
                    return new Date(a.orderDate) - new Date(b.orderDate);
                case 'highest':
                    return b.total - a.total;
                case 'lowest':
                    return a.total - b.total;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Filter users
    const getFilteredUsers = () => {
        return users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    };

    useEffect(() => {
        if (isAdmin) {
            setLoading(true);
            Promise.all([
                fetchDashboardData(),
                fetchOrders(),
                fetchUsers()
            ]).finally(() => setLoading(false));
        }
    }, [isAdmin]);

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#10b981',
            delivered: '#059669',
            cancelled: '#ef4444'
        };
        return colors[status] || '#64748b';
    };

    // Get available status transitions
    const getAvailableStatuses = (currentStatus) => {
        const statusFlow = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: []
        };
        return statusFlow[currentStatus] || [];
    };

    if (!isAuthenticated) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <FiShield style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Authentication Required</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Please log in to access the admin panel.
                </p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <FiShield style={{ fontSize: '64px', color: '#ef4444', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Access Denied</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Admin privileges required to access this page.
                </p>
            </div>
        );
    }

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
                    <p style={{ marginTop: '16px', color: '#64748b' }}>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiShield style={{ color: '#2563eb' }} />
                    Admin Dashboard
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px' }}>
                    Welcome back, {user?.firstName}! Manage your e-commerce platform.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-tabs" style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {[
                    { key: 'dashboard', label: 'Dashboard', icon: FiBarChart2, shortLabel: 'Home' },
                    { key: 'products', label: 'Products', icon: FiPackage, shortLabel: 'Products' },
                    { key: 'analytics', label: 'Analytics', icon: FiTrendingUp, shortLabel: 'Stats' },
                    { key: 'orders', label: 'Orders', icon: FiTruck, shortLabel: 'Orders' },
                    { key: 'users', label: 'Users', icon: FiUsers, shortLabel: 'Users' },
                    { key: 'emails', label: 'Email Testing', icon: FiMail, shortLabel: 'Email' }
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="admin-tab"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: activeTab === tab.key ? '#2563eb' : 'transparent',
                                color: activeTab === tab.key ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                minWidth: 'fit-content'
                            }}
                        >
                            <Icon />
                            <span className="desktop-only">{tab.label}</span>
                            <span className="mobile-only" style={{ display: 'none' }}>{tab.shortLabel}</span>
                        </button>
                    );
                })}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
                <div>
                    {/* Statistics Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        <StatCard
                            title="Total Users"
                            value={dashboardData.overview.totalUsers}
                            icon={FiUsers}
                            color="#3b82f6"
                            subtitle={`${dashboardData.overview.todayUsers} new today`}
                        />
                        <StatCard
                            title="Total Orders"
                            value={dashboardData.overview.totalOrders}
                            icon={FiPackage}
                            color="#8b5cf6"
                            subtitle={`${dashboardData.overview.weekOrders} this week`}
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`$${dashboardData.overview.totalRevenue.toFixed(2)}`}
                            icon={FiDollarSign}
                            color="#059669"
                            subtitle={`${dashboardData.overview.monthOrders} orders this month`}
                        />
                        <StatCard
                            title="Growth"
                            value="+12.5%"
                            icon={FiTrendingUp}
                            color="#f59e0b"
                            subtitle="vs last month"
                        />
                    </div>

                    {/* Recent Orders */}
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                            Recent Orders
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {dashboardData.recentOrders.slice(0, 5).map(order => (
                                <div
                                    key={order._id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: '500' }}>#{order.orderNumber}</span>
                                        <span style={{ color: '#64748b', marginLeft: '12px' }}>
                                            {order.user?.firstName} {order.user?.lastName}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: `${getStatusColor(order.status)}15`,
                                            color: getStatusColor(order.status),
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            textTransform: 'capitalize'
                                        }}>
                                            {order.status}
                                        </span>
                                        <span style={{ fontWeight: '600' }}>
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ margin: 0, color: '#1e293b' }}>Product Management</h2>
                            <a
                                href="/admin/add-product"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                            >
                                <FiPackage size={16} />
                                Add New Product
                            </a>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '24px' }}>
                                    0
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Total Products
                                </p>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '24px' }}>
                                    0
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Active Products
                                </p>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '24px' }}>
                                    0
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Draft Products
                                </p>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '24px' }}>
                                    0
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Low Stock
                                </p>
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <FiPackage size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 8px 0', color: '#64748b' }}>
                                No Products Yet
                            </h3>
                            <p style={{ margin: '0 0 16px 0', color: '#94a3b8' }}>
                                Start by adding your first 3D printed product to the store.
                            </p>
                            <a
                                href="/admin/add-product"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <FiPackage size={14} />
                                Add Your First Product
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <SimpleAnalytics />
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                            Order Management ({getFilteredOrders().length})
                        </h3>
                        <button
                            onClick={() => {
                                fetchOrders();
                                showSuccess('Orders refreshed!');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#64748b'
                            }}
                        >
                            <FiRefreshCw size={14} />
                            Refresh
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px'
                    }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="Search orders, customers, or emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Value</option>
                            <option value="lowest">Lowest Value</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {getFilteredOrders().length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px'
                            }}>
                                <FiPackage style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#64748b' }}>No orders found</h3>
                                <p style={{ color: '#9ca3af' }}>
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'Try adjusting your search or filters'
                                        : 'Orders will appear here once customers start placing them'}
                                </p>
                            </div>
                        ) : (
                            getFilteredOrders().map(order => (
                                <div
                                    key={order._id}
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '24px'
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
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                                    Order #{order.orderNumber}
                                                </h4>
                                                <button
                                                    onClick={() => toggleOrderExpansion(order._id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 8px',
                                                        backgroundColor: '#f1f5f9',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#e2e8f0';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#f1f5f9';
                                                    }}
                                                >
                                                    <FiEye size={12} />
                                                    {expandedOrders.has(order._id) ? 'Hide Details' : 'View Details'}
                                                </button>
                                            </div>
                                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                                                Customer: {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                                                Placed: {new Date(order.orderDate).toLocaleDateString()} • {order.items?.length || 0} items
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                padding: '8px 16px',
                                                backgroundColor: `${getStatusColor(order.status)}15`,
                                                color: getStatusColor(order.status),
                                                borderRadius: '20px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                textTransform: 'capitalize',
                                                border: `1px solid ${getStatusColor(order.status)}30`
                                            }}>
                                                {order.status}
                                            </div>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: '#059669'
                                            }}>
                                                ${order.total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collapsible Order Details */}
                                    {expandedOrders.has(order._id) && (
                                        <div style={{
                                            marginBottom: '16px',
                                            animation: 'fadeIn 0.3s ease-in-out'
                                        }}>
                                            {/* Order Items */}
                                            <div style={{
                                                marginBottom: '16px',
                                                padding: '16px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                                                    Order Items ({order.items?.length || 0} items)
                                                </h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {order.items?.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                padding: '8px',
                                                                backgroundColor: 'white',
                                                                borderRadius: '6px',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #e5e7eb'
                                                                }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                                                                    {item.title}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                                    Color: {item.selectedColor} • Qty: {item.quantity}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Order Summary */}
                                                <div style={{
                                                    marginTop: '12px',
                                                    paddingTop: '12px',
                                                    borderTop: '1px solid #e5e7eb',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '12px',
                                                    color: '#64748b'
                                                }}>
                                                    <div>
                                                        <div>Subtotal: ${order.subtotal?.toFixed(2) || '0.00'}</div>
                                                        <div>Shipping: ${order.shippingCost?.toFixed(2) || '0.00'}</div>
                                                        <div>Tax: ${order.tax?.toFixed(2) || '0.00'}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div>Payment: {order.paymentMethod}</div>
                                                        <div>Shipping: {order.shippingMethod}</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                                            Total: ${order.total.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            {order.shippingAddress && (
                                                <div style={{
                                                    marginBottom: '16px',
                                                    padding: '12px',
                                                    backgroundColor: '#f0f9ff',
                                                    borderRadius: '6px',
                                                    border: '1px solid #bae6fd'
                                                }}>
                                                    <h6 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#0369a1' }}>
                                                        Shipping Address
                                                    </h6>
                                                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                                        {order.shippingAddress.address}<br />
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                                        {order.shippingAddress.country}
                                                        {order.shippingAddress.phone && (
                                                            <><br />Phone: {order.shippingAddress.phone}</>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Status Update Actions */}
                                    <div style={{
                                        paddingTop: '16px',
                                        borderTop: '1px solid #f1f5f9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                                            Update Status & Send Email:
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {getAvailableStatuses(order.status).map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateOrderStatus(order._id, status)}
                                                    disabled={updatingStatus[order._id]}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '8px 12px',
                                                        backgroundColor: getStatusColor(status),
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: updatingStatus[order._id] ? 'not-allowed' : 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        textTransform: 'capitalize',
                                                        opacity: updatingStatus[order._id] ? 0.6 : 1
                                                    }}
                                                >
                                                    {updatingStatus[order._id] ? (
                                                        <FiRefreshCw className="spin" size={12} />
                                                    ) : (
                                                        <FiMail size={12} />
                                                    )}
                                                    {updatingStatus[order._id] ? 'Updating...' : `Mark as ${status}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                            User Management ({getFilteredUsers().length})
                        </h3>
                        <button
                            onClick={() => {
                                fetchUsers();
                                showSuccess('Users refreshed!');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#64748b'
                            }}
                        >
                            <FiRefreshCw size={14} />
                            Refresh
                        </button>
                    </div>

                    {/* User Search */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '20px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px'
                    }}>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 200px 100px 100px 150px',
                            gap: '16px',
                            padding: '16px 24px',
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748b'
                        }}>
                            <div>User</div>
                            <div>Email</div>
                            <div>Role</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>
                        {getFilteredUsers().length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                gridColumn: '1 / -1'
                            }}>
                                <FiUsers style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#64748b' }}>No users found</h3>
                                <p style={{ color: '#9ca3af' }}>
                                    {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}
                                </p>
                            </div>
                        ) : (
                            getFilteredUsers().map(u => (
                                <div
                                    key={u._id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 200px 100px 100px 150px',
                                        gap: '16px',
                                        padding: '16px 24px',
                                        borderBottom: '1px solid #f1f5f9',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '500' }}>
                                            {u.firstName} {u.lastName}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            Joined {new Date(u.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        {u.email}
                                    </div>
                                    <div>
                                        <select
                                            value={u.role}
                                            onChange={(e) => updateUserRole(u._id, e.target.value)}
                                            style={{
                                                padding: '4px 8px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                backgroundColor: u.role === 'admin' ? '#fef3c7' : '#f0f9ff',
                                                color: u.role === 'admin' ? '#92400e' : '#1e40af'
                                            }}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: u.isActive ? '#dcfce7' : '#fecaca',
                                            color: u.isActive ? '#166534' : '#dc2626',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => toggleUserStatus(u._id, u.isActive)}
                                            style={{
                                                padding: '4px 8px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                backgroundColor: u.isActive ? '#ef4444' : '#059669',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {u.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Email Testing Tab */}
            {activeTab === 'emails' && (
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                        Email Template Testing
                    </h3>
                    <EmailTest />
                </div>
            )}
        </div>
    );
};

// Statistics Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon style={{ fontSize: '24px', color }} />
        </div>
        <div>
            <h4 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>
                {value}
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2px' }}>
                {title}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
                {subtitle}
            </p>
        </div>
    </div>
);

export default Admin;