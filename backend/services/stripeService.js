import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeService = {
    // Create payment intent
    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata
            });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error('Stripe createPaymentIntent error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Retrieve payment intent
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                success: true,
                paymentIntent
            };
        } catch (error) {
            console.error('Stripe getPaymentIntent error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Create customer
    async createCustomer(email, name, metadata = {}) {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
                metadata
            });

            return {
                success: true,
                customer
            };
        } catch (error) {
            console.error('Stripe createCustomer error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Create product
    async createProduct(name, description, images = []) {
        try {
            const product = await stripe.products.create({
                name,
                description,
                images
            });

            return {
                success: true,
                product
            };
        } catch (error) {
            console.error('Stripe createProduct error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Create price for product
    async createPrice(productId, unitAmount, currency = 'usd') {
        try {
            const price = await stripe.prices.create({
                product: productId,
                unit_amount: unitAmount,
                currency,
            });

            return {
                success: true,
                price
            };
        } catch (error) {
            console.error('Stripe createPrice error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Refund payment
    async refundPayment(paymentIntentId, amount = null) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount // If null, refunds the full amount
            });

            return {
                success: true,
                refund
            };
        } catch (error) {
            console.error('Stripe refundPayment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Verify webhook signature
    verifyWebhookSignature(payload, signature, secret) {
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, secret);
            return {
                success: true,
                event
            };
        } catch (error) {
            console.error('Stripe webhook verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

export default stripeService;