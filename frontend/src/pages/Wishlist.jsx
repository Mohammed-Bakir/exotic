import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiHeart, FiShoppingCart, FiTrash2, FiGrid, FiList,
    FiFilter, FiX, FiStar, FiArrowRight
} from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'home-decor', name: 'Home Decor' },
    { id: 'gadgets', name: 'Gadgets' },
    { id: 'accessories', name: 'Accessories' }
];

const Wishlist = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const {
        wishlistItems,
        removeFromWishlist,
        clearWishlist,
        getWishlistByCategory
    } = useWishlist();
    const { addToCart, isInCart } = useCart();
    const { showSuccess, showError } = useToast();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Get filtered items
    const filteredItems = getWishlistByCategory(selectedCategory);

    // Handle add to cart
    const handleAddToCart = (item) => {
        const product = {
            _id: item._id,
            title: item.title,
            price: item.price,
            images: [item.image]
        };
        addToCart(product, 1);
        showSuccess(`✅ ${item.title} added to cart!`);
    };

    // Handle remove from wishlist
    const handleRemoveFromWishlist = (item) => {
        removeFromWishlist(item._id);
        showSuccess(`💔 ${item.title} removed from wishlist`);
    };

    // Handle move to cart (add to cart and remove from wishlist)
    const handleMoveToCart = (item) => {
        handleAddToCart(item);
        removeFromWishlist(item._id);
    };

    // Handle clear all wishlist
    const handleClearWishlist = () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            clearWishlist();
            showSuccess('🗑️ Wishlist cleared');
        }
    };

    // Handle add all to cart
    const handleAddAllToCart = () => {
        let addedCount = 0;
        filteredItems.forEach(item => {
            if (!isInCart(item._id)) {
                handleAddToCart(item);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            showSuccess(`✅ ${addedCount} items added to cart!`);
        } else {
            showError('All items are already in your cart');
        }
    };

    // Render stars for rating
    const renderStars = (rating) => {
        if (!rating) return null;

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

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
                <FiHeart style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Sign in to view your wishlist</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Create an account or sign in to save your favorite products.
                </p>
                <Link
                    to="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500'
                    }}
                >
                    Sign In
                    <FiArrowRight />
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiHeart style={{ color: '#ef4444' }} />
                            My Wishlist
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                        </p>
                    </div>

                    {wishlistItems.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleAddAllToCart}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <FiShoppingCart />
                                Add All to Cart
                            </button>

                            <button
                                onClick={handleClearWishlist}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    color: '#ef4444',
                                    border: '1px solid #ef4444',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <FiTrash2 />
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {wishlistItems.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {/* Category Filter */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {categories.map(category => {
                                const count = category.id === 'all'
                                    ? wishlistItems.length
                                    : getWishlistByCategory(category.id).length;

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            backgroundColor: selectedCategory === category.id ? '#2563eb' : '#f1f5f9',
                                            color: selectedCategory === category.id ? 'white' : '#475569',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {category.name}
                                        <span style={{
                                            backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '12px'
                                        }}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* View Mode Toggle */}
                        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', marginLeft: 'auto' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    backgroundColor: viewMode === 'grid' ? '#2563eb' : 'white',
                                    color: viewMode === 'grid' ? 'white' : '#64748b',
                                    cursor: 'pointer',
                                    borderRadius: '7px 0 0 7px'
                                }}
                            >
                                <FiGrid />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    backgroundColor: viewMode === 'list' ? '#2563eb' : 'white',
                                    color: viewMode === 'list' ? 'white' : '#64748b',
                                    cursor: 'pointer',
                                    borderRadius: '0 7px 7px 0'
                                }}
                            >
                                <FiList />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Wishlist Content */}
            {filteredItems.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                }}>
                    <FiHeart style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#475569' }}>
                        {selectedCategory === 'all' ? 'Your wishlist is empty' : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} items`}
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        {selectedCategory === 'all'
                            ? "Start adding products you love to your wishlist!"
                            : `You haven't added any ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} to your wishlist yet.`
                        }
                    </p>
                    <Link
                        to="/products"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: '500'
                        }}
                    >
                        Browse Products
                        <FiArrowRight />
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid'
                        ? 'repeat(auto-fill, minmax(280px, 1fr))'
                        : '1fr',
                    gap: viewMode === 'grid' ? '24px' : '16px'
                }}>
                    {filteredItems.map(item => (
                        <WishlistItem
                            key={item._id}
                            item={item}
                            viewMode={viewMode}
                            onAddToCart={() => handleAddToCart(item)}
                            onRemove={() => handleRemoveFromWishlist(item)}
                            onMoveToCart={() => handleMoveToCart(item)}
                            isInCart={isInCart(item._id)}
                            renderStars={renderStars}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Wishlist Item Component
const WishlistItem = ({
    item,
    viewMode,
    onAddToCart,
    onRemove,
    onMoveToCart,
    isInCart,
    renderStars
}) => {
    if (viewMode === 'list') {
        return (
            <div style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                transition: 'all 0.2s'
            }}>
                {/* Product Image */}
                <Link to={`/product/${item._id}`} style={{ flexShrink: 0 }}>
                    <img
                        src={item.image}
                        alt={item.title}
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                        }}
                    />
                </Link>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                    <Link
                        to={`/product/${item._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: '#1e293b'
                        }}>
                            {item.title}
                        </h3>
                    </Link>

                    <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        marginBottom: '12px'
                    }}>
                        {item.description?.length > 120
                            ? `${item.description.substring(0, 120)}...`
                            : item.description}
                    </p>

                    {/* Rating */}
                    {item.rating && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {renderStars(item.rating)}
                            </div>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>
                                {item.rating} ({item.reviews} reviews)
                            </span>
                        </div>
                    )}

                    {/* Specs */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {item.materials && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                {item.materials}
                            </span>
                        )}
                        {item.colors && item.colors.length > 0 && (
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                {item.colors.length} colors
                            </span>
                        )}
                    </div>
                </div>

                {/* Price and Actions */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    minWidth: '140px'
                }}>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1e293b'
                    }}>
                        ${item.price.toFixed(2)}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <button
                            onClick={isInCart ? onMoveToCart : onAddToCart}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                backgroundColor: isInCart ? '#059669' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                width: '100%'
                            }}
                        >
                            <FiShoppingCart size={16} />
                            {isInCart ? 'Move to Cart' : 'Add to Cart'}
                        </button>

                        <button
                            onClick={onRemove}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                width: '100%'
                            }}
                        >
                            <FiTrash2 size={14} />
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s',
            position: 'relative'
        }}>
            {/* Remove Button */}
            <button
                onClick={onRemove}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    zIndex: 1,
                    transition: 'all 0.2s'
                }}
            >
                <FiX size={16} />
            </button>

            {/* Product Image */}
            <Link to={`/product/${item._id}`}>
                <img
                    src={item.image}
                    alt={item.title}
                    style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                    }}
                />
            </Link>

            {/* Product Info */}
            <div style={{ padding: '20px' }}>
                <Link
                    to={`/product/${item._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#1e293b',
                        lineHeight: '1.4'
                    }}>
                        {item.title}
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
                    {item.description?.length > 80
                        ? `${item.description.substring(0, 80)}...`
                        : item.description}
                </p>

                {/* Rating */}
                {item.rating && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                            {renderStars(item.rating)}
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            ({item.reviews})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b'
                    }}>
                        ${item.price.toFixed(2)}
                    </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={isInCart ? onMoveToCart : onAddToCart}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: isInCart ? '#059669' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '100%'
                        }}
                    >
                        <FiShoppingCart size={16} />
                        {isInCart ? 'Move to Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;