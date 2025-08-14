import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        if (!amount || amount < 50) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be at least 50 cents'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment intent'
        });
    }
});

// Confirm payment (webhook endpoint)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('✅ Payment succeeded:', paymentIntent.id);
            // Here you would update your database, send confirmation emails, etc.
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('❌ Payment failed:', failedPayment.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Get payment details
router.get('/payment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const paymentIntent = await stripe.paymentIntents.retrieve(id);

        res.json({
            success: true,
            payment: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                created: paymentIntent.created
            }
        });

    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve payment'
        });
    }
});

export default router;