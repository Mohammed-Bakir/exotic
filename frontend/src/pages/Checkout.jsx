import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiShield, FiArrowLeft, FiCheck, FiLoader } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Checkout = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [formData, setFormData] = useState({
        // Shipping Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',

        // Payment Information
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: '',

        // Order Options
        shippingMethod: 'standard',
        saveInfo: false
    });

    // Get cart and auth data
    const { cartItems, getCartTotal, getShippingCost, getTax, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    // Calculate totals using cart context
    const subtotal = getCartTotal();
    const shippingCost = formData.shippingMethod === 'express' ? 9.99 : getShippingCost();
    const tax = getTax();
    const total = subtotal + shippingCost + tax;

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            showError('Your cart is empty');
            navigate('/cart');
        }
    }, [cartItems, navigate, showError]);

    // Pre-fill user data if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            }));
        }
    }, [isAuthenticated, user]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            showError('Please log in to place an order');
            navigate('/login');
            return;
        }

        setProcessingPayment(true);

        try {
            // Prepare order data
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id && item._id.length === 24 ? item._id : '507f1f77bcf86cd799439011', // Use valid ObjectId or default
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor || 'Default',
                    image: item.image || item.images?.[0] || '/placeholder-image.jpg'
                })),
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country
                },
                paymentMethod: 'card',
                shippingMethod: formData.shippingMethod,
                subtotal: subtotal,
                shippingCost: shippingCost,
                tax: tax,
                total: total
            };

            // Submit order to backend
            const token = localStorage.getItem('exotic-token');
            const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });



            if (response.data.success) {
                // Clear cart and show success
                clearCart();
                showSuccess('🎉 Order placed successfully! Check your email for confirmation.');

                // Redirect to order confirmation or home
                navigate('/', {
                    state: {
                        orderSuccess: true,
                        orderId: response.data.order._id
                    }
                });
            } else {
                showError(response.data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showError(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link to="/cart" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    marginBottom: '16px'
                }}>
                    <FiArrowLeft /> Back to Cart
                </Link>
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Checkout</h1>

                {/* Progress Steps */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                    {[1, 2, 3].map(step => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: currentStep >= step ? '#2563eb' : '#e2e8f0',
                                color: currentStep >= step ? 'white' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>
                                {currentStep > step ? <FiCheck /> : step}
                            </div>
                            <span style={{
                                marginLeft: '8px',
                                color: currentStep >= step ? '#1e293b' : '#94a3b8',
                                fontWeight: currentStep === step ? '600' : '400'
                            }}>
                                {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
                            </span>
                            {step < 3 && (
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    backgroundColor: currentStep > step ? '#2563eb' : '#e2e8f0',
                                    marginLeft: '16px'
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                {/* Main Content */}
                <div style={{ flex: '1 1 600px' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Shipping Information */}
                        {currentStep === 1 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Shipping Information</h2>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Country *
                                    </label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="United States">United States</option>
                                        <option value="Canada">Canada</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                    </select>
                                </div>

                                <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Shipping Method</h3>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '16px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        marginBottom: '12px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.shippingMethod === 'standard' ? '#f0f9ff' : 'white'
                                    }}>
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            value="standard"
                                            checked={formData.shippingMethod === 'standard'}
                                            onChange={handleInputChange}
                                            style={{ marginRight: '12px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                                <FiTruck style={{ marginRight: '8px' }} />
                                                Standard Shipping (3-5 business days)
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                                                {subtotal > 50 ? 'Free' : '$5.99'}
                                            </div>
                                        </div>
                                    </label>

                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '16px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.shippingMethod === 'express' ? '#f0f9ff' : 'white'
                                    }}>
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            value="express"
                                            checked={formData.shippingMethod === 'express'}
                                            onChange={handleInputChange}
                                            style={{ marginRight: '12px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                                <FiTruck style={{ marginRight: '8px' }} />
                                                Express Shipping (1-2 business days)
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '14px' }}>$9.99</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Information */}
                        {currentStep === 2 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Payment Information</h2>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Card Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        placeholder="1234 5678 9012 3456"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Expiry Date *
                                        </label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleInputChange}
                                            placeholder="MM/YY"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            CVV *
                                        </label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={formData.cvv}
                                            onChange={handleInputChange}
                                            placeholder="123"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Name on Card *
                                    </label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '6px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <FiShield style={{ color: '#2563eb', marginRight: '8px' }} />
                                        <span style={{ fontWeight: '500' }}>Secure Payment</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                                        Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                                    </p>
                                </div>

                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    marginBottom: '24px'
                                }}>
                                    <input
                                        type="checkbox"
                                        name="saveInfo"
                                        checked={formData.saveInfo}
                                        onChange={handleInputChange}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Save this information for next time
                                </label>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {currentStep === 3 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Review Your Order</h2>

                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    marginBottom: '24px'
                                }}>
                                    <h3 style={{ marginBottom: '16px' }}>Shipping Address</h3>
                                    <p>
                                        {formData.firstName} {formData.lastName}<br />
                                        {formData.address}<br />
                                        {formData.city}, {formData.state} {formData.zipCode}<br />
                                        {formData.country}
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    marginBottom: '24px'
                                }}>
                                    <h3 style={{ marginBottom: '16px' }}>Payment Method</h3>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiCreditCard style={{ marginRight: '8px' }} />
                                        <span>**** **** **** {formData.cardNumber.slice(-4)}</span>
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    marginBottom: '24px'
                                }}>
                                    <h3 style={{ marginBottom: '16px' }}>Shipping Method</h3>
                                    <p>
                                        {formData.shippingMethod === 'standard'
                                            ? 'Standard Shipping (3-5 business days)'
                                            : 'Express Shipping (1-2 business days)'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '32px'
                        }}>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="btn btn-secondary"
                                    style={{ padding: '12px 24px' }}
                                >
                                    Previous
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="btn btn-primary"
                                    style={{ padding: '12px 24px', marginLeft: 'auto' }}
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: '12px 24px', marginLeft: 'auto' }}
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? (
                                        <>
                                            <FiLoader style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Order Summary Sidebar */}
                <div style={{ flex: '1 1 300px' }}>
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '24px',
                        borderRadius: '8px',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>

                        {/* Cart Items */}
                        <div style={{ marginBottom: '20px' }}>
                            {cartItems.map(item => (
                                <div key={item._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    paddingBottom: '16px',
                                    borderBottom: '1px solid #e2e8f0'
                                }}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            marginRight: '12px'
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity}</div>
                                    </div>
                                    <div style={{ fontWeight: '500' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Shipping</span>
                                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '18px',
                                fontWeight: '700',
                                paddingTop: '16px',
                                borderTop: '1px solid #e2e8f0'
                            }}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;