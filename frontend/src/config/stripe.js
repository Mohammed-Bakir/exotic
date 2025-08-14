import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe(
    import.meta.env.PROD
        ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        : 'pk_test_your_stripe_publishable_key_here'
);

export default stripePromise;