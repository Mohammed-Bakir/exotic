import React, { useState, useEffect } from 'react';
import {
    FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart,
    FiUsers, FiTarget, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';

const SimpleAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    // Mock data for demonstration
    const mockData = {
        overview: {
            totalRevenue: 15420.50,
            revenueChange: 12.5,
            totalOrders: 234,
            ordersChange: 8.3,
            totalCustomers: 156,
            customersChange: 15.2,
            avgOrderValue: 65.90,
            avgOrderChange: -2.1
        },
        dailyStats: [
            { date: '2024-01-15', revenue: 1200, orders: 18, customers: 12 },
            { date: '2024-01-16', revenue: 1450, orders: 22, customers: 15 },
            { date: '2024-01-17', revenue: 980, orders: 15, customers: 8 },
            { date: '2024-01-18', revenue: 1680, orders: 25, customers: 18 },
            { date: '2024-01-19', revenue: 2100, orders: 32, customers: 22 },
            { date: '2024-01-20', revenue: 1890, orders: 28, customers: 19 },
            { date: '2024-01-21', revenue: 2250, orders: 35, customers: 25 }
        ],
        topProducts: [
            { name: 'Geometric Desk Organizer', sales: 45, revenue: 1124.55 },
            { name: 'Honeycomb Wall Planter', sales: 38, revenue: 759.62 },
            { name: 'Low-Poly Vase', sales: 32, revenue: 959.68 },
            { name: 'Minimalist Phone Stand', sales: 28, revenue: 419.72 },
            { name: 'Abstract Wall Art', sales: 24, revenue: 719.76 }
        ],
        orderStatus: [
            { status: 'Delivered', count: 145, percentage: 62 },
            { status: 'Shipped', count: 32, percentage: 14 },
            { status: 'Processing', count: 28, percentage: 12 },
            { status: 'Pending', count: 29, percentage: 12 }
        ]
    };

    // Fetch analytics data
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('exotic-token');
            const response = await axios.get(`http://localhost:5002/api/admin/analytics?range=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                // Transform the API data to match our component structure
                const apiData = response.data.data;
                const transformedData = {
                    overview: {
                        totalRevenue: apiData.overview?.totalRevenue || 0,
                        revenueChange: apiData.overview?.revenueChange || 0,
                        totalOrders: apiData.overview?.totalOrders || 0,
                        ordersChange: apiData.overview?.ordersChange || 0,
                        totalCustomers: apiData.overview?.totalCustomers || 0,
                        customersChange: apiData.overview?.customersChange || 0,
                        avgOrderValue: apiData.overview?.avgOrderValue || 0,
                        avgOrderChange: apiData.overview?.avgOrderChange || 0
                    },
                    dailyStats: (apiData.revenueChart || []).map(item => ({
                        date: item.date,
                        revenue: item.revenue || 0,
                        orders: item.orders || 0,
                        customers: Math.floor(item.orders * 0.7) // Estimate customers from orders
                    })),
                    topProducts: apiData.topProducts || [],
                    orderStatus: apiData.orderStatus || [],
                    customerSegments: apiData.customerSegments || []
                };
                setAnalyticsData(transformedData);
                console.log('Analytics data loaded successfully:', transformedData);
            } else {
                console.warn('API returned unsuccessful response, using mock data');
                setAnalyticsData(mockData);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            // Use mock data as fallback
            setAnalyticsData(mockData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const data = analyticsData || mockData;

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
                    <p style={{ marginTop: '16px', color: '#64748b' }}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Analytics Header */}
            <div className="analytics-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                        Business Analytics
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                        Track your performance and growth metrics
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FiRefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="metrics-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <MetricCard
                    title="Total Revenue"
                    value={`$${data.overview.totalRevenue.toLocaleString()}`}
                    change={data.overview.revenueChange}
                    icon={FiDollarSign}
                    color="#059669"
                />
                <MetricCard
                    title="Total Orders"
                    value={data.overview.totalOrders.toLocaleString()}
                    change={data.overview.ordersChange}
                    icon={FiShoppingCart}
                    color="#2563eb"
                />
                <MetricCard
                    title="Total Customers"
                    value={data.overview.totalCustomers.toLocaleString()}
                    change={data.overview.customersChange}
                    icon={FiUsers}
                    color="#7c3aed"
                />
                <MetricCard
                    title="Avg Order Value"
                    value={`$${data.overview.avgOrderValue.toFixed(2)}`}
                    change={data.overview.avgOrderChange}
                    icon={FiTarget}
                    color="#f59e0b"
                />
            </div>

            {/* Daily Performance Table */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                        Daily Performance
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Revenue</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Orders</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Customers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.dailyStats.map((day, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                                            {new Date(day.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                                            ${day.revenue.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                                            {day.orders}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                                            {day.customers}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Status */}
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                        Order Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {data.orderStatus.map((status, index) => {
                            const colors = ['#059669', '#2563eb', '#f59e0b', '#ef4444'];
                            return (
                                <div key={index}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                            {status.status}
                                        </span>
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                                            {status.count} ({status.percentage}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${status.percentage}%`,
                                            height: '100%',
                                            backgroundColor: colors[index],
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                    Top Products
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.topProducts.map((product, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    backgroundColor: '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {product.sales} sales
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#059669', fontSize: '16px' }}>
                                ${product.revenue.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: change >= 0 ? '#dcfce7' : '#fecaca',
                color: change >= 0 ? '#166534' : '#dc2626',
                fontSize: '12px',
                fontWeight: '500'
            }}>
                {change >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {Math.abs(change)}%
            </div>
        </div>
        <div>
            <h4 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>
                {value}
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
                {title}
            </p>
        </div>
    </div>
);

export default SimpleAnalytics;