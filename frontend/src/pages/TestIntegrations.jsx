import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiCreditCard, FiImage, FiUpload, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import stripePromise from '../config/stripe';

// Stripe Payment Test Component
const StripePaymentTest = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [amount, setAmount] = useState(1000); // $10.00 in cents

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setResult(null);

        try {
            // Create payment intent on backend
            const { data } = await axios.post(`${API_BASE_URL}/api/payments/create-intent`, {
                amount,
                currency: 'usd'
            });

            // Confirm payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (error) {
                setResult({ success: false, message: error.message });
            } else if (paymentIntent.status === 'succeeded') {
                setResult({ success: true, message: 'Payment successful!', paymentIntent });
            }
        } catch (error) {
            setResult({ success: false, message: error.response?.data?.message || 'Payment failed' });
        }

        setLoading(false);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <FiCreditCard style={{ marginRight: '8px', color: '#3b82f6' }} />
                <h3 style={{ margin: 0, color: '#1e293b' }}>Stripe Payment Test</h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Amount (cents):
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                        min="50"
                        step="1"
                    />
                    <small style={{ color: '#64748b' }}>
                        ${(amount / 100).toFixed(2)} USD
                    </small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Card Details:
                    </label>
                    <div style={{
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: '#fafafa'
                    }}>
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading ? '#94a3b8' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {loading ? (
                        <>
                            <FiLoader style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                            Processing...
                        </>
                    ) : (
                        `Pay $${(amount / 100).toFixed(2)}`
                    )}
                </button>
            </form>

            {result && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: result.success ? '#dcfce7' : '#fef2f2',
                    border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {result.success ? (
                        <FiCheck style={{ color: '#16a34a', marginRight: '8px' }} />
                    ) : (
                        <FiX style={{ color: '#dc2626', marginRight: '8px' }} />
                    )}
                    <span style={{ color: result.success ? '#16a34a' : '#dc2626' }}>
                        {result.message}
                    </span>
                </div>
            )}

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
                <strong>Test Cards:</strong><br />
                Success: 4242 4242 4242 4242<br />
                Decline: 4000 0000 0000 0002<br />
                Use any future date and any 3-digit CVC
            </div>
        </div>
    );
};

// Cloudinary Image Upload Test Component
const CloudinaryUploadTest = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setResult(null);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setResult({ success: false, message: 'Please select a file first' });
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await axios.post(`${API_BASE_URL}/api/uploads/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResult({
                success: true,
                message: 'Image uploaded successfully!',
                data: response.data
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Upload failed'
            });
        }

        setUploading(false);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <FiImage style={{ marginRight: '8px', color: '#10b981' }} />
                <h3 style={{ margin: 0, color: '#1e293b' }}>Cloudinary Upload Test</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Select Image:
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}
                />
            </div>

            {preview && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Preview:
                    </label>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db'
                        }}
                    />
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: uploading ? '#94a3b8' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {uploading ? (
                    <>
                        <FiLoader style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                        Uploading...
                    </>
                ) : (
                    <>
                        <FiUpload style={{ marginRight: '8px' }} />
                        Upload to Cloudinary
                    </>
                )}
            </button>

            {result && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: result.success ? '#dcfce7' : '#fef2f2',
                    border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: result.success && result.data ? '8px' : '0'
                    }}>
                        {result.success ? (
                            <FiCheck style={{ color: '#16a34a', marginRight: '8px' }} />
                        ) : (
                            <FiX style={{ color: '#dc2626', marginRight: '8px' }} />
                        )}
                        <span style={{ color: result.success ? '#16a34a' : '#dc2626' }}>
                            {result.message}
                        </span>
                    </div>

                    {result.success && result.data && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <strong>Upload Details:</strong><br />
                            URL: <a href={result.data.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                                {result.data.url}
                            </a><br />
                            Public ID: {result.data.public_id}<br />
                            Format: {result.data.format}<br />
                            Size: {Math.round(result.data.bytes / 1024)} KB
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Main Test Page Component
const TestIntegrations = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ color: '#1e293b', marginBottom: '8px' }}>
                        Integration Testing
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Test Stripe payments and Cloudinary image uploads
                    </p>
                </div>

                <Elements stripe={stripePromise}>
                    <StripePaymentTest />
                </Elements>

                <CloudinaryUploadTest />

                <div style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginTop: '24px',
                    fontSize: '14px',
                    color: '#64748b'
                }}>
                    <strong>Setup Requirements:</strong><br />
                    1. Add VITE_STRIPE_PUBLISHABLE_KEY to frontend .env<br />
                    2. Add STRIPE_SECRET_KEY to backend .env<br />
                    3. Add Cloudinary credentials to backend .env<br />
                    4. Ensure backend routes /api/payments and /api/uploads exist
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default TestIntegrations;