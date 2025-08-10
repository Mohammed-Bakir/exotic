import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import adminAuth from '../middleware/adminAuth.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get current date ranges
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Get statistics
        const [
            totalUsers,
            totalOrders,
            totalRevenue,
            todayUsers,
            todayOrders,
            weekOrders,
            monthOrders,
            recentOrders,
            ordersByStatus,
            topProducts
        ] = await Promise.all([
            // Total users
            User.countDocuments(),

            // Total orders
            Order.countDocuments(),

            // Total revenue (excluding cancelled orders)
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),

            // Today's new users
            User.countDocuments({
                createdAt: { $gte: startOfToday }
            }),

            // Today's orders
            Order.countDocuments({
                orderDate: { $gte: startOfToday }
            }),

            // This week's orders
            Order.countDocuments({
                orderDate: { $gte: startOfWeek }
            }),

            // This month's orders
            Order.countDocuments({
                orderDate: { $gte: startOfMonth }
            }),

            // Recent orders (last 10)
            Order.find()
                .populate('user', 'firstName lastName email')
                .sort({ orderDate: -1 })
                .limit(10),

            // Orders by status
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Top products (most ordered, excluding cancelled orders)
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.title',
                        count: { $sum: '$items.quantity' },
                        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        // Format revenue
        const revenue = totalRevenue[0]?.total || 0;

        // Format orders by status
        const statusCounts = {};
        ordersByStatus.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalOrders,
                    totalRevenue: revenue,
                    todayUsers,
                    todayOrders,
                    weekOrders,
                    monthOrders
                },
                recentOrders,
                ordersByStatus: statusCounts,
                topProducts
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Admin only
router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            users,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (admin only)
// @access  Admin only
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        // Build query
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (admin only)
// @access  Admin only
router.put('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role'
        });
    }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/deactivate user (admin only)
// @access  Admin only
router.put('/users/:id/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user status'
        });
    }
});

// @route   POST /api/admin/test-email
// @desc    Send test email (admin only)
// @access  Admin only
router.post('/test-email', adminAuth, async (req, res) => {
    try {
        const { email, type = 'welcome' } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        let result;
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            email: email
        };

        switch (type) {
            case 'welcome':
                result = await emailService.sendWelcomeEmail(testUser);
                break;

            case 'order-confirmation':
                // Create a sample order for testing
                const sampleOrder = {
                    _id: '507f1f77bcf86cd799439011',
                    orderNumber: 'EX240123001',
                    orderDate: new Date(),
                    status: 'confirmed',
                    items: [
                        {
                            title: 'Geometric Desk Organizer',
                            price: 24.99,
                            quantity: 1,
                            selectedColor: 'Black'
                        },
                        {
                            title: 'Honeycomb Wall Planter',
                            price: 19.99,
                            quantity: 2,
                            selectedColor: 'White'
                        }
                    ],
                    shippingAddress: {
                        firstName: 'John',
                        lastName: 'Doe',
                        address: '123 Main Street',
                        city: 'New York',
                        state: 'NY',
                        zipCode: '10001',
                        country: 'United States',
                        phone: '+1 (555) 123-4567',
                        email: email
                    },
                    subtotal: 64.97,
                    shippingCost: 5.99,
                    tax: 5.68,
                    total: 76.64,
                    shippingMethod: 'standard',
                    paymentMethod: 'card'
                };
                result = await emailService.sendOrderConfirmationEmail(sampleOrder, testUser);
                break;

            case 'status-update':
                // Create a sample order for status update testing
                const statusOrder = {
                    _id: '507f1f77bcf86cd799439011',
                    orderNumber: 'EX240123001',
                    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    status: 'shipped',
                    trackingNumber: 'TRK1234567890',
                    items: [
                        {
                            title: 'Low-Poly Vase',
                            price: 29.99,
                            quantity: 1,
                            selectedColor: 'Gold'
                        }
                    ],
                    total: 35.98,
                    shippingMethod: 'express'
                };
                result = await emailService.sendOrderStatusUpdateEmail(statusOrder, testUser, 'shipped');
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email type. Valid types: welcome, order-confirmation, status-update'
                });
        }

        if (result.success !== false) {
            const templateNames = {
                'welcome': 'Welcome Email',
                'order-confirmation': 'Order Confirmation Email',
                'status-update': 'Order Status Update Email'
            };

            res.json({
                success: true,
                message: `${templateNames[type]} sent successfully! Check your inbox.`,
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Admin test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data (admin only)
// @access  Admin only
router.get('/analytics', adminAuth, async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        // Calculate date ranges
        const now = new Date();
        let startDate;

        switch (range) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get previous period for comparison
        const periodLength = now.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);

        // Current period analytics
        const [
            currentRevenue,
            currentOrders,
            currentCustomers,
            previousRevenue,
            previousOrders,
            previousCustomers,
            dailyRevenue,
            topProducts,
            orderStatusData,
            customerSegments
        ] = await Promise.all([
            // Current period revenue
            Order.aggregate([
                {
                    $match: {
                        orderDate: { $gte: startDate, $lte: now },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
            ]),

            // Current period orders
            Order.countDocuments({
                orderDate: { $gte: startDate, $lte: now }
            }),

            // Current period new customers
            User.countDocuments({
                createdAt: { $gte: startDate, $lte: now }
            }),

            // Previous period revenue
            Order.aggregate([
                {
                    $match: {
                        orderDate: { $gte: previousStartDate, $lt: startDate },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
            ]),

            // Previous period orders
            Order.countDocuments({
                orderDate: { $gte: previousStartDate, $lt: startDate }
            }),

            // Previous period new customers
            User.countDocuments({
                createdAt: { $gte: previousStartDate, $lt: startDate }
            }),

            // Daily revenue for chart
            Order.aggregate([
                {
                    $match: {
                        orderDate: { $gte: startDate, $lte: now },
                        status: { $ne: 'cancelled' }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                        },
                        revenue: { $sum: '$total' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } }
            ]),

            // Top products
            Order.aggregate([
                {
                    $match: {
                        orderDate: { $gte: startDate, $lte: now },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.title',
                        sales: { $sum: '$items.quantity' },
                        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                    }
                },
                { $sort: { sales: -1 } },
                { $limit: 5 }
            ]),

            // Order status distribution
            Order.aggregate([
                { $match: { orderDate: { $gte: startDate, $lte: now } } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Customer segments (new vs returning)
            Order.aggregate([
                { $match: { orderDate: { $gte: startDate, $lte: now } } },
                {
                    $lookup: {
                        from: 'orders',
                        let: { userId: '$user' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
                            { $match: { orderDate: { $lt: startDate } } },
                            { $limit: 1 }
                        ],
                        as: 'previousOrders'
                    }
                },
                {
                    $group: {
                        _id: { $cond: [{ $gt: [{ $size: '$previousOrders' }, 0] }, 'returning', 'new'] },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Calculate metrics
        const currentRevenueTotal = currentRevenue[0]?.total || 0;
        const currentOrdersCount = currentOrders || 0;
        const currentCustomersCount = currentCustomers || 0;

        const previousRevenueTotal = previousRevenue[0]?.total || 0;
        const previousOrdersCount = previousOrders || 0;
        const previousCustomersCount = previousCustomers || 0;

        // Calculate percentage changes
        const revenueChange = previousRevenueTotal > 0
            ? ((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100
            : 0;

        const ordersChange = previousOrdersCount > 0
            ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
            : 0;

        const customersChange = previousCustomersCount > 0
            ? ((currentCustomersCount - previousCustomersCount) / previousCustomersCount) * 100
            : 0;

        const avgOrderValue = currentOrdersCount > 0 ? currentRevenueTotal / currentOrdersCount : 0;
        const previousAvgOrderValue = previousOrdersCount > 0 ? previousRevenueTotal / previousOrdersCount : 0;
        const avgOrderChange = previousAvgOrderValue > 0
            ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100
            : 0;

        // Format chart data
        const revenueChart = dailyRevenue.map(item => ({
            date: item._id,
            revenue: item.revenue,
            orders: item.orders
        }));

        // Format top products
        const topProductsFormatted = topProducts.map(product => ({
            name: product._id,
            sales: product.sales,
            revenue: product.revenue
        }));

        // Format order status data
        const totalOrdersForStatus = orderStatusData.reduce((sum, item) => sum + item.count, 0);
        const orderStatusFormatted = orderStatusData.map(item => ({
            status: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            count: item.count,
            percentage: totalOrdersForStatus > 0 ? Math.round((item.count / totalOrdersForStatus) * 100) : 0
        }));

        // Format customer segments
        const totalCustomersForSegments = customerSegments.reduce((sum, item) => sum + item.count, 0);
        const customerSegmentsFormatted = customerSegments.map(segment => ({
            segment: segment._id === 'new' ? 'New Customers' : 'Returning Customers',
            count: segment.count,
            percentage: totalCustomersForSegments > 0 ? Math.round((segment.count / totalCustomersForSegments) * 100) : 0
        }));

        res.json({
            success: true,
            data: {
                overview: {
                    totalRevenue: currentRevenueTotal,
                    revenueChange: Math.round(revenueChange * 10) / 10,
                    totalOrders: currentOrdersCount,
                    ordersChange: Math.round(ordersChange * 10) / 10,
                    totalCustomers: currentCustomersCount,
                    customersChange: Math.round(customersChange * 10) / 10,
                    avgOrderValue: avgOrderValue,
                    avgOrderChange: Math.round(avgOrderChange * 10) / 10
                },
                revenueChart,
                topProducts: topProductsFormatted,
                orderStatus: orderStatusFormatted,
                customerSegments: customerSegmentsFormatted
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics data'
        });
    }
});
export default router;