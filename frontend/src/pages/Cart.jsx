import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Cart = () => {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        getCartTotal,
        getShippingCost,
        getTax,
        getFinalTotal
    } = useCart();

    const { showSuccess, showError, showInfo } = useToast();
    const navigate = useNavigate();

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [discount, setDiscount] = useState(0);

    // Calculate cart totals using cart context
    const subtotal = getCartTotal();
    const shipping = getShippingCost();
    const tax = getTax();
    const total = getFinalTotal() - discount;

    const handleQuantityChange = (id, newQuantity, selectedColor = 'Default') => {
        if (newQuantity < 1) return;

        const oldSubtotal = subtotal;
        updateQuantity(id, newQuantity, selectedColor);

        // Check if free shipping was just unlocked
        const newSubtotal = getCartTotal();
        if (oldSubtotal < 50 && newSubtotal >= 50) {
            showSuccess(`🚚 Free shipping unlocked!`);
        } else {
            showInfo(`📦 Cart updated`);
        }
    };

    const handleRemoveItem = (id, selectedColor = 'Default') => {
        // Find the item to get its name for the toast
        const item = cartItems.find(item => item._id === id && item.selectedColor === selectedColor);
        removeFromCart(id, selectedColor);
        if (item) {
            showSuccess(`🗑️ ${item.title} removed from cart`);
        }
    };

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === 'exotic10') {
            setDiscount(subtotal * 0.1);
            setPromoApplied(true);
            showSuccess(`🎉 Promo code applied! 10% discount added`);
        } else {
            showError(`❌ Invalid promo code`);
        }
    };

    const handleProceedToCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="cart-container">
            <h1 style={{ marginBottom: '32px' }}>Your Cart</h1>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <div className="empty-cart-icon">
                        <FiShoppingBag />
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any products to your cart yet.</p>
                    <Link to="/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item._id} className="cart-item cart-item-mobile" style={{ position: 'relative' }}>
                                <div className="cart-item-top">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.title} />
                                    </div>

                                    <div className="cart-item-info">
                                        <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 className="cart-item-title">{item.title}</h3>
                                        </Link>
                                        {item.selectedColor && item.selectedColor !== 'Default' && (
                                            <p className="cart-item-color">Color: {item.selectedColor}</p>
                                        )}
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                            ${item.price.toFixed(2)} each
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(item._id, item.selectedColor)}
                                        className="remove-btn"
                                        title="Remove item"
                                        style={{ position: 'absolute', top: '8px', right: '8px' }}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>

                                <div className="cart-item-bottom">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.selectedColor)}
                                            className="quantity-btn"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1, item.selectedColor)}
                                            className="quantity-input"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.selectedColor)}
                                            className="quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-item-price">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="continue-shopping">
                            <Link to="/products">
                                <span style={{ transform: 'rotate(180deg)' }}><FiArrowRight /></span>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2 style={{ marginBottom: '24px' }}>Order Summary</h2>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981' }}>
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #e2e8f0',
                                fontWeight: '600',
                                fontSize: '18px'
                            }}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Promo Code */}
                        {!promoApplied ? (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                                    Promo Code
                                </label>
                                <div style={{ display: 'flex' }}>
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter promo code"
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '4px 0 0 4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="btn btn-secondary"
                                        style={{
                                            borderRadius: '0 4px 4px 0',
                                            padding: '8px 16px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                marginBottom: '24px',
                                padding: '12px',
                                backgroundColor: '#dcfce7',
                                borderRadius: '4px',
                                color: '#166534',
                                fontSize: '14px'
                            }}>
                                Promo code applied: {promoCode.toUpperCase()}
                            </div>
                        )}

                        {/* Free Shipping Notice */}
                        {subtotal < 50 && (
                            <div style={{
                                marginBottom: '24px',
                                padding: '12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '4px',
                                color: '#92400e',
                                fontSize: '14px'
                            }}>
                                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={handleProceedToCheckout}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                fontSize: '16px',
                                marginBottom: '16px'
                            }}
                        >
                            Proceed to Checkout <FiArrowRight />
                        </button>

                        <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                            Secure checkout powered by Stripe
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;