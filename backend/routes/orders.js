import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
    try {


        const {
            items,
            shippingAddress,
            shippingMethod,
            subtotal,
            shippingCost,
            tax,
            discount,
            total,
            paymentMethod,
            customerNotes
        } = req.body;

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address and payment method are required'
            });
        }

        // Validate required fields in shipping address
        const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode', 'country'];
        for (const field of requiredFields) {
            if (!shippingAddress[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required in shipping address`
                });
            }
        }

        // Generate order number manually as backup
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `EX${year}${month}${day}${sequence}`;

        // Create order
        const order = new Order({
            user: req.user.id,
            orderNumber,
            items,
            shippingAddress,
            shippingMethod: shippingMethod || 'standard',
            subtotal,
            shippingCost,
            tax,
            discount: discount || 0,
            total,
            paymentMethod,
            customerNotes
        });

        await order.save();

        // Populate user information
        await order.populate('user', 'firstName lastName email');

        // Send order confirmation email (don't wait for it to complete)
        emailService.sendOrderConfirmationEmail(order, order.user).catch(error => {
            console.error('Failed to send order confirmation email:', error);
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order creation'
        });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'firstName lastName email');

        const total = await Order.countDocuments({ user: req.user.id });

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

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order'
        });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel shipped or delivered orders'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        const previousStatus = order.status;
        order.status = 'cancelled';
        await order.save();

        // Populate user information for email
        await order.populate('user', 'firstName lastName email');

        // Send order status update email (don't wait for it to complete)
        emailService.sendOrderStatusUpdateEmail(order, order.user, 'cancelled').catch(error => {
            console.error('Failed to send order cancellation email:', error);
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling order'
        });
    }
});

// @route   POST /api/orders/:id/payment
// @desc    Process payment for an order (simulation)
// @access  Private
router.post('/:id/payment', auth, async (req, res) => {
    try {
        const { paymentDetails } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Order is already paid'
            });
        }

        // Simulate payment processing
        // In a real app, you would integrate with Stripe, PayPal, etc.
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for simulation

        if (paymentSuccess) {
            const previousStatus = order.status;
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.paymentId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Set estimated delivery (5-7 business days for standard, 1-2 for express)
            const deliveryDays = order.shippingMethod === 'express' ? 2 : 7;
            order.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

            await order.save();

            // Populate user information for email
            await order.populate('user', 'firstName lastName email');

            // Send order status update email if status changed
            if (previousStatus !== 'confirmed') {
                emailService.sendOrderStatusUpdateEmail(order, order.user, 'confirmed').catch(error => {
                    console.error('Failed to send order confirmation email:', error);
                });
            }

            res.json({
                success: true,
                message: 'Payment processed successfully',
                order
            });
        } else {
            order.paymentStatus = 'failed';
            await order.save();

            res.status(400).json({
                success: false,
                message: 'Payment failed. Please try again or use a different payment method.'
            });
        }

    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during payment processing'
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin functionality)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const previousStatus = order.status;

        // Don't update if status is the same
        if (previousStatus === status) {
            return res.json({
                success: true,
                message: 'Order status is already ' + status,
                order
            });
        }

        // Update order status
        order.status = status;

        // Set tracking number for shipped orders (simulation)
        if (status === 'shipped' && !order.trackingNumber) {
            order.trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }

        // Set delivery date for delivered orders
        if (status === 'delivered') {
            order.deliveredDate = new Date();
        }

        await order.save();

        // Populate user information for email
        await order.populate('user', 'firstName lastName email');

        // Send status update email (don't wait for it to complete)
        emailService.sendOrderStatusUpdateEmail(order, order.user, status).catch(error => {
            console.error('Failed to send order status update email:', error);
        });

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating order status'
        });
    }
});

// @route   GET /api/orders/number/:orderNumber
// @desc    Get order by order number (for order tracking)
// @access  Public
router.get('/number/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.orderNumber
        }).populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Return limited information for public tracking
        const publicOrderInfo = {
            orderNumber: order.orderNumber,
            status: order.status,
            orderDate: order.orderDate,
            estimatedDelivery: order.estimatedDelivery,
            trackingNumber: order.trackingNumber,
            shippingMethod: order.shippingMethod,
            items: order.items.map(item => ({
                title: item.title,
                quantity: item.quantity,
                selectedColor: item.selectedColor
            }))
        };

        res.json({
            success: true,
            order: publicOrderInfo
        });

    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while tracking order'
        });
    }
});

export default router;