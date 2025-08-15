import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart, FiPackage } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const ProductListItem = ({ product }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { showSuccess } = useToast();

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product, 1);
        showSuccess(`✅ ${product.title} added to cart!`);
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        const wasAdded = toggleWishlist(product);
        if (wasAdded) {
            showSuccess(`💖 ${product.title} added to wishlist!`);
        } else {
            showSuccess(`💔 ${product.title} removed from wishlist`);
        }
    };

    // Render stars for rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FiStar key={i} style={{ color: '#fbbf24', fill: '#fbbf24' }} size={14} />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <FiStar key="half" style={{ color: '#fbbf24', fill: '#fbbf24', opacity: 0.5 }} size={14} />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FiStar key={`empty-${i}`} style={{ color: '#e5e7eb' }} size={14} />
            );
        }

        return stars;
    };

    const isWishlisted = isInWishlist(product._id);
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Product Image */}
            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#f8fafc'
                }}>
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f1f5f9'
                        }}>
                            <FiPackage size={40} style={{ color: '#94a3b8' }} />
                        </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            -{discountPercentage}%
                        </div>
                    )}

                    {/* Stock Status */}
                    {!product.inStock && (
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            Out of Stock
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        color: '#1e293b',
                        lineHeight: '1.4'
                    }}>
                        {product.title}
                    </h3>
                </Link>

                <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {product.description}
                </p>

                {/* Product Details */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    color: '#64748b'
                }}>
                    <span>📏 {product.dimensions}</span>
                    <span>🧱 {product.materials}</span>
                    <span>⏱️ {product.printTime}</span>
                </div>

                {/* Rating */}
                {product.rating > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {renderStars(product.rating)}
                        </div>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                            ({product.reviews} reviews)
                        </span>
                    </div>
                )}
            </div>

            {/* Price and Actions */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px',
                flexShrink: 0
            }}>
                {/* Price */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b'
                    }}>
                        ${product.price}
                    </div>
                    {hasDiscount && (
                        <div style={{
                            fontSize: '14px',
                            color: '#94a3b8',
                            textDecoration: 'line-through'
                        }}>
                            ${product.originalPrice}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistToggle}
                        style={{
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: isWishlisted ? '#fef2f2' : 'white',
                            color: isWishlisted ? '#ef4444' : '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isWishlisted) {
                                e.target.style.backgroundColor = '#f8fafc';
                                e.target.style.color = '#ef4444';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isWishlisted) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#64748b';
                            }
                        }}
                    >
                        <FiHeart size={16} style={{ fill: isWishlisted ? '#ef4444' : 'none' }} />
                    </button>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: product.inStock ? '#2563eb' : '#94a3b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: product.inStock ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (product.inStock) {
                                e.target.style.backgroundColor = '#1d4ed8';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (product.inStock) {
                                e.target.style.backgroundColor = '#2563eb';
                            }
                        }}
                    >
                        <FiShoppingCart size={16} />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductListItem;