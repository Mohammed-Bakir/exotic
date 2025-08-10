import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const { addToCart, isInCart } = useCart();
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

    if (viewMode === 'list') {
        return (
            <div style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                transition: 'all 0.2s',
                ':hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
            }}>
                {/* Product Image */}
                <Link to={`/product/${product._id}`} style={{ flexShrink: 0 }}>
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                        }}
                    />
                </Link>

                {/* Product Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link
                        to={`/product/${product._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: '#1e293b'
                        }}>
                            {product.title}
                        </h3>
                    </Link>

                    <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        marginBottom: '12px'
                    }}>
                        {product.description.length > 150
                            ? `${product.description.substring(0, 150)}...`
                            : product.description}
                    </p>

                    {/* Rating and Reviews */}
                    {product.rating && (
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
                                {product.rating} ({product.reviews} reviews)
                            </span>
                        </div>
                    )}

                    {/* Specs */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                    }}>
                        {product.materials && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                {product.materials}
                            </span>
                        )}
                        {product.dimensions && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                {product.dimensions}
                            </span>
                        )}
                        {product.printTime && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                {product.printTime}h print
                            </span>
                        )}
                    </div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Colors:</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {product.colors.slice(0, 4).map((color, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            padding: '2px 6px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            color: '#475569'
                                        }}
                                    >
                                        {color}
                                    </span>
                                ))}
                                {product.colors.length > 4 && (
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#64748b'
                                    }}>
                                        +{product.colors.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price and Actions */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    minWidth: '120px'
                }}>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1e293b'
                    }}>
                        ${product.price.toFixed(2)}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={handleAddToCart}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                backgroundColor: isInCart(product._id) ? '#059669' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FiShoppingCart size={16} />
                            {isInCart(product._id) ? 'Added' : 'Add to Cart'}
                        </button>

                        <button
                            onClick={handleWishlistToggle}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                backgroundColor: isInWishlist(product._id) ? '#fef2f2' : 'transparent',
                                color: isInWishlist(product._id) ? '#ef4444' : '#64748b',
                                border: `1px solid ${isInWishlist(product._id) ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FiHeart size={16} style={{ fill: isInWishlist(product._id) ? '#ef4444' : 'none' }} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view (default)
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s',
            ':hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
            }
        }}>
            {/* Product Image */}
            <Link to={`/product/${product._id}`}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            transition: 'transform 0.3s'
                        }}
                    />
                    <button
                        onClick={handleWishlistToggle}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isInWishlist(product._id) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isInWishlist(product._id) ? '#ef4444' : '#64748b',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiHeart size={16} style={{ fill: isInWishlist(product._id) ? '#ef4444' : 'none' }} />
                    </button>
                </div>
            </Link>

            {/* Product Info */}
            <div style={{ padding: '20px' }}>
                <Link
                    to={`/product/${product._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#1e293b',
                        lineHeight: '1.4'
                    }}>
                        {product.title}
                    </h3>
                </Link>

                <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '12px',
                    height: '42px',
                    overflow: 'hidden'
                }}>
                    {product.description.length > 80
                        ? `${product.description.substring(0, 80)}...`
                        : product.description}
                </p>

                {/* Rating */}
                {product.rating && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                            {renderStars(product.rating)}
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            ({product.reviews})
                        </span>
                    </div>
                )}

                {/* Specs */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                }}>
                    {product.materials && (
                        <span style={{
                            padding: '3px 6px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {product.materials}
                        </span>
                    )}
                    {product.printTime && (
                        <span style={{
                            padding: '3px 6px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {product.printTime}h
                        </span>
                    )}
                </div>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                    }}>
                        {product.colors.slice(0, 3).map((color, index) => (
                            <span
                                key={index}
                                style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    color: '#475569'
                                }}
                            >
                                {color}
                            </span>
                        ))}
                        {product.colors.length > 3 && (
                            <span style={{
                                fontSize: '10px',
                                color: '#64748b',
                                alignSelf: 'center'
                            }}>
                                +{product.colors.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Price and Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b'
                    }}>
                        ${product.price.toFixed(2)}
                    </span>

                    <button
                        onClick={handleAddToCart}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: isInCart(product._id) ? '#059669' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiShoppingCart size={14} />
                        {isInCart(product._id) ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;