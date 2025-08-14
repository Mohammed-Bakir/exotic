import React, { useState } from 'react';
import {
    useStripe,
    useElements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement
} from '@stripe/react-stripe-js';
import { FiCreditCard, FiLock, FiLoader } from 'react-icons/fi';
import { usePayment } from '../../context/PaymentContext';
import { useToast } from '../../context/ToastContext';

const StripePaymentForm = ({ orderId, orderTotal, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { createPaymentIntent, loading: paymentLoading } = usePayment();
    const { showToast } = useToast();

    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState({
        cardNumber: false,
        cardExpiry: false,
        cardCvc: false
    });

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                fontFamily: 'system-ui, -apple-system, sans-serif',
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };

    const handleCardChange = (element, field) => (event) => {
        setCardComplete(prev => ({
            ...prev,
            [field]: event.complete
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // Create payment intent
            const { clientSecret } = await createPaymentIntent(orderId);

            // Confirm payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                }
            });

            if (error) {
                console.error('Payment error:', error);
                showToast(error.message, 'error');
                onError && onError(error);
            } else if (paymentIntent.status === 'succeeded') {
                showToast('Payment successful!', 'success');
                onSuccess && onSuccess(paymentIntent);
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            showToast('Payment processing failed', 'error');
            onError && onError(error);
        } finally {
            setProcessing(false);
        }
    };

    const isFormComplete = Object.values(cardComplete).every(Boolean);
    const isLoading = processing || paymentLoading || !stripe;

    return (
        <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <FiCreditCard style={{ fontSize: '24px', color: '#3b82f6', marginRight: '12px' }} />
                <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                        Payment Details
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        Total: ${orderTotal?.toFixed(2)}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                    }}>
                        Card Number
                    </label>
                    <div style={{
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb'
                    }}>
                        <CardNumberElement
                            options={cardElementOptions}
                            onChange={handleCardChange('cardNumber', 'cardNumber')}
                        />
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            Expiry Date
                        </label>
                        <div style={{
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <CardExpiryElement
                                options={cardElementOptions}
                                onChange={handleCardChange('cardExpiry', 'cardExpiry')}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            CVC
                        </label>
                        <div style={{
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <CardCvcElement
                                options={cardElementOptions}
                                onChange={handleCardChange('cardCvc', 'cardCvc')}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '24px',
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <FiLock style={{ color: '#0369a1', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#0369a1' }}>
                        Your payment information is secure and encrypted
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={!isFormComplete || isLoading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: isFormComplete && !isLoading ? '#3b82f6' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isFormComplete && !isLoading ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isLoading ? (
                        <>
                            <FiLoader style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                            Processing...
                        </>
                    ) : (
                        `Pay $${orderTotal?.toFixed(2)}`
                    )}
                </button>
            </form>

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default StripePaymentForm;