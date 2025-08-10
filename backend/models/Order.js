import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    selectedColor: {
        type: String,
        default: 'Default'
    },
    image: {
        type: String,
        required: true
    }
});

const shippingAddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'United States'
    }
});

const orderSchema = new mongoose.Schema({
    // Order identification
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },

    // User information
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Order items
    items: [orderItemSchema],

    // Shipping information
    shippingAddress: shippingAddressSchema,
    shippingMethod: {
        type: String,
        enum: ['standard', 'express'],
        default: 'standard'
    },

    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },

    // Payment information
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: String, // Stripe payment intent ID or similar

    // Order status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Tracking
    trackingNumber: String,
    estimatedDelivery: Date,

    // Timestamps
    orderDate: {
        type: Date,
        default: Date.now
    },
    shippedDate: Date,
    deliveredDate: Date,

    // Notes
    customerNotes: String,
    adminNotes: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // Find the last order of the day
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const lastOrder = await this.constructor.findOne({
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        }).sort({ createdAt: -1 });

        let sequence = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const lastSequence = parseInt(lastOrder.orderNumber.slice(-3));
            sequence = lastSequence + 1;
        }

        this.orderNumber = `EX${year}${month}${day}${sequence.toString().padStart(3, '0')}`;
    }
    next();
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

// Virtual for order total items count
orderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.model('Order', orderSchema);