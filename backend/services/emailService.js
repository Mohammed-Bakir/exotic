import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
    console.log('Using Gmail SMTP with user:', process.env.EMAIL_USER);

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email templates
const emailTemplates = {
    // Welcome email template
    welcome: (userName, userEmail) => ({
        subject: 'Welcome to Exotic - Your 3D Printing Journey Begins!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Exotic</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #64748b; font-size: 14px; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
                    .feature { display: flex; align-items: center; margin: 15px 0; }
                    .feature-icon { background: #f0f9ff; color: #2563eb; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">Welcome to Exotic!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your premium 3D printing marketplace</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hi ${userName}! 👋</h2>
                        <p>Welcome to Exotic, where innovation meets craftsmanship! We're thrilled to have you join our community of 3D printing enthusiasts.</p>
                        
                        <div class="feature">
                            <div class="feature-icon">🎨</div>
                            <div>
                                <strong>Premium Quality Products</strong><br>
                                <span style="color: #64748b;">Discover our curated collection of high-quality 3D printed items</span>
                            </div>
                        </div>
                        
                        <div class="feature">
                            <div class="feature-icon">🚚</div>
                            <div>
                                <strong>Fast & Reliable Shipping</strong><br>
                                <span style="color: #64748b;">Free shipping on orders over $50 with tracking included</span>
                            </div>
                        </div>
                        
                        <div class="feature">
                            <div class="feature-icon">💖</div>
                            <div>
                                <strong>Wishlist & Favorites</strong><br>
                                <span style="color: #64748b;">Save your favorite items and get notified of special offers</span>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">
                                Start Shopping
                            </a>
                        </div>
                        
                        <p>If you have any questions, our support team is here to help. Just reply to this email!</p>
                        
                        <p>Happy shopping!<br>
                        <strong>The Exotic Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Exotic. All rights reserved.</p>
                        <p>You received this email because you created an account at Exotic.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Order confirmation template
    orderConfirmation: (order, user) => ({
        subject: `Order Confirmation #${order.orderNumber} - Thank You!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #64748b; font-size: 14px; }
                    .order-summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .order-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
                    .order-item:last-child { border-bottom: none; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #059669; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
                    .status-badge { background: #fbbf24; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hi ${user.firstName}!</h2>
                        <p>Great news! We've received your order and it's being processed. Here are the details:</p>
                        
                        <div class="order-summary">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <div>
                                    <strong>Order #${order.orderNumber}</strong><br>
                                    <span style="color: #64748b; font-size: 14px;">Placed on ${new Date(order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</span>
                                </div>
                                <span class="status-badge">Processing</span>
                            </div>
                            
                            <h3 style="margin: 20px 0 15px 0; color: #1e293b;">Order Items:</h3>
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <div>
                                        <strong>${item.title}</strong><br>
                                        <span style="color: #64748b; font-size: 14px;">
                                            Color: ${item.selectedColor} • Qty: ${item.quantity}
                                        </span>
                                    </div>
                                    <div style="font-weight: 500;">$${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            `).join('')}
                            
                            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                    <span>Subtotal:</span>
                                    <span>$${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                    <span>Shipping:</span>
                                    <span>$${order.shippingCost.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                    <span>Tax:</span>
                                    <span>$${order.tax.toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>Total:</span>
                                    <span>$${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <h3>Shipping Address:</h3>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0;">
                            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                            ${order.shippingAddress.address}<br>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                            ${order.shippingAddress.country}
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">
                                Track Your Order
                            </a>
                        </div>
                        
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>We'll send you an email when your order ships</li>
                            <li>You can track your order status anytime in your account</li>
                            <li>Estimated delivery: ${order.shippingMethod === 'express' ? '1-2' : '3-5'} business days</li>
                        </ul>
                        
                        <p>Thank you for choosing Exotic!</p>
                        
                        <p>Best regards,<br>
                        <strong>The Exotic Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Exotic. All rights reserved.</p>
                        <p>Need help? Contact us at support@exotic.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Order status update template
    orderStatusUpdate: (order, user, newStatus) => {
        const statusInfo = {
            confirmed: {
                color: '#2563eb',
                title: 'Order Confirmed',
                message: 'Your order has been confirmed and is being prepared.',
                icon: '✅'
            },
            processing: {
                color: '#8b5cf6',
                title: 'Order Processing',
                message: 'Your order is currently being processed and prepared for shipment.',
                icon: '⚙️'
            },
            shipped: {
                color: '#10b981',
                title: 'Order Shipped',
                message: 'Great news! Your order has been shipped and is on its way to you.',
                icon: '🚚'
            },
            delivered: {
                color: '#059669',
                title: 'Order Delivered',
                message: 'Your order has been successfully delivered. We hope you love it!',
                icon: '📦'
            },
            cancelled: {
                color: '#ef4444',
                title: 'Order Cancelled',
                message: 'Your order has been cancelled as requested.',
                icon: '❌'
            }
        };

        const status = statusInfo[newStatus] || statusInfo.confirmed;

        return {
            subject: `${status.title} - Order #${order.orderNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Status Update</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, ${status.color}, ${status.color}dd); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
                        .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #64748b; font-size: 14px; }
                        .status-card { background: ${status.color}15; border: 1px solid ${status.color}40; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 28px;">${status.icon} ${status.title}</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${order.orderNumber}</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hi ${user.firstName}!</h2>
                            
                            <div class="status-card">
                                <h3 style="margin: 0 0 10px 0; color: ${status.color};">${status.title}</h3>
                                <p style="margin: 0; font-size: 16px;">${status.message}</p>
                            </div>
                            
                            ${newStatus === 'shipped' && order.trackingNumber ? `
                                <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <strong>Tracking Information:</strong><br>
                                    Tracking Number: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${order.trackingNumber}</code>
                                </div>
                            ` : ''}
                            
                            ${newStatus === 'delivered' ? `
                                <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <strong>🎉 Enjoy your purchase!</strong><br>
                                    We'd love to hear about your experience. Consider leaving a review!
                                </div>
                            ` : ''}
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">
                                    View Order Details
                                </a>
                            </div>
                            
                            <p>Thank you for choosing Exotic!</p>
                            
                            <p>Best regards,<br>
                            <strong>The Exotic Team</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 Exotic. All rights reserved.</p>
                            <p>Need help? Contact us at support@exotic.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    }
};

// Email service functions
export const emailService = {
    // Send welcome email
    sendWelcomeEmail: async (user) => {
        try {
            const transporter = createTransporter();
            const emailContent = emailTemplates.welcome(user.firstName, user.email);

            const mailOptions = {
                from: `"Exotic" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: emailContent.subject,
                html: emailContent.html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    },

    // Send order confirmation email
    sendOrderConfirmationEmail: async (order, user) => {
        try {
            const transporter = createTransporter();
            const emailContent = emailTemplates.orderConfirmation(order, user);

            const mailOptions = {
                from: `"Exotic" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: emailContent.subject,
                html: emailContent.html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Order confirmation email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            return { success: false, error: error.message };
        }
    },

    // Send order status update email
    sendOrderStatusUpdateEmail: async (order, user, newStatus) => {
        try {
            const transporter = createTransporter();
            const emailContent = emailTemplates.orderStatusUpdate(order, user, newStatus);

            const mailOptions = {
                from: `"Exotic" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: emailContent.subject,
                html: emailContent.html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Order status update email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending order status update email:', error);
            return { success: false, error: error.message };
        }
    },

    // Test email connection
    testEmailConnection: async () => {
        try {
            const transporter = createTransporter();
            await transporter.verify();
            console.log('Email service is ready');
            return { success: true };
        } catch (error) {
            console.error('Email service connection failed:', error);
            return { success: false, error: error.message };
        }
    }
};

export default emailService;