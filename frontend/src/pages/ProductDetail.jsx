import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiChevronRight, FiCheck, FiInfo } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Sample data - would come from API in real app
const allProducts = [
    {
        _id: '1',
        title: 'Geometric Desk Organizer',
        description: 'Keep your workspace tidy with this modern geometric desk organizer. Perfect for storing pens, pencils, and small office supplies.',
        price: 24.99,
        images: [
            'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1593642532744-d377ab507dc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        ],
        materials: 'PLA',
        dimensions: '15 x 10 x 8 cm',
        printTime: 4,
        category: 'home-decor',
        weight: '250g',
        colors: ['White', 'Black', 'Blue', 'Red'],
        inStock: true,
        rating: 4.5,
        reviews: 12,
        specifications: [
            { name: 'Material', value: 'PLA (Polylactic Acid)' },
            { name: 'Dimensions', value: '15 x 10 x 8 cm' },
            { name: 'Weight', value: '250g' },
            { name: 'Print Time', value: '4 hours' },
            { name: 'Layer Height', value: '0.2mm' },
            { name: 'Infill', value: '15%' },
            { name: 'Finish', value: 'Sanded and Polished' }
        ]
    },
    {
        _id: '2',
        title: 'Honeycomb Wall Planter',
        description: 'Modern hexagonal wall planter perfect for small succulents and air plants. Comes with mounting hardware.',
        price: 19.99,
        images: [
            'https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1531685250784-7569952593d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1545241047-cfe2dae36a83?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        ],
        materials: 'PETG',
        dimensions: '12 x 12 x 5 cm',
        printTime: 3,
        category: 'home-decor',
        weight: '180g',
        colors: ['White', 'Black', 'Green', 'Terracotta'],
        inStock: true,
        rating: 4.8,
        reviews: 24,
        specifications: [
            { name: 'Material', value: 'PETG (Polyethylene Terephthalate Glycol)' },
            { name: 'Dimensions', value: '12 x 12 x 5 cm' },
            { name: 'Weight', value: '180g' },
            { name: 'Print Time', value: '3 hours' },
            { name: 'Layer Height', value: '0.2mm' },
            { name: 'Infill', value: '20%' },
            { name: 'Finish', value: 'Sanded and Sealed' },
            { name: 'Mounting', value: 'Includes wall mounting hardware' }
        ]
    }
];

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart, isInCart, getItemQuantity } = useCart();
    const { showSuccess } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        // Simulate API call to fetch product details
        setLoading(true);
        setTimeout(() => {
            const foundProduct = allProducts.find(p => p._id === id);
            setProduct(foundProduct);
            if (foundProduct && foundProduct.colors && foundProduct.colors.length > 0) {
                setSelectedColor(foundProduct.colors[0]);
            }
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Back to Products
                </Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedColor);
        const colorText = selectedColor && selectedColor !== 'Default' ? ` (${selectedColor})` : '';
        const quantityText = quantity > 1 ? `${quantity} x ` : '';
        showSuccess(`🛒 ${quantityText}${product.title}${colorText} added to cart!`);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <Link to="/products" style={{ color: '#64748b', textDecoration: 'none' }}>Products</Link>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <span style={{ color: '#1e293b' }}>{product.title}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                {/* Product Images */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <div style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        aspectRatio: '1/1',
                        backgroundColor: '#f8fafc'
                    }}>
                        <img
                            src={product.images[selectedImage]}
                            alt={product.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />

                        {/* Image Navigation Arrows */}
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                    style={{
                                        position: 'absolute',
                                        left: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.8)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <FiChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.8)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <FiChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0' }}>
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedImage === index ? '2px solid #2563eb' : '2px solid transparent',
                                        opacity: selectedImage === index ? 1 : 0.7
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.title} - View ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>{product.title}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
                            <span style={{ color: '#f59e0b', marginRight: '4px' }}>★★★★☆</span>
                            <span style={{ color: '#64748b' }}>{product.rating} ({product.reviews} reviews)</span>
                        </div>

                        {product.inStock ? (
                            <div style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
                                <FiCheck style={{ marginRight: '4px' }} /> In Stock
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', color: '#ef4444' }}>
                                <FiInfo style={{ marginRight: '4px' }} /> Out of Stock
                            </div>
                        )}
                    </div>

                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '20px' }}>
                        ${product.price.toFixed(2)}
                    </div>

                    <p style={{ marginBottom: '24px', lineHeight: '1.6' }}>{product.description}</p>

                    {/* Product Specs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                        {product.materials && (
                            <div className="spec-tag">{product.materials}</div>
                        )}
                        {product.dimensions && (
                            <div className="spec-tag">{product.dimensions}</div>
                        )}
                        {product.printTime && (
                            <div className="spec-tag">{product.printTime}h print</div>
                        )}
                        {product.weight && (
                            <div className="spec-tag">{product.weight}</div>
                        )}
                    </div>

                    {/* Color Selection */}
                    {product.colors && product.colors.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Color</h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: selectedColor === color ? '2px solid #2563eb' : '2px solid transparent',
                                            backgroundColor: color.toLowerCase(),
                                            cursor: 'pointer',
                                            padding: '2px'
                                        }}
                                        title={color}
                                    >
                                        <span style={{
                                            display: 'block',
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            backgroundColor: color.toLowerCase(),
                                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                                        }}></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Quantity</h3>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    borderRadius: '4px 0 0 4px',
                                    cursor: 'pointer'
                                }}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: '50px',
                                    height: '36px',
                                    border: '1px solid #e2e8f0',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    textAlign: 'center',
                                    fontSize: '14px'
                                }}
                            />
                            <button
                                onClick={() => setQuantity(prev => prev + 1)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    borderRadius: '0 4px 4px 0',
                                    cursor: 'pointer'
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '12px 24px', fontSize: '16px' }}
                            disabled={!product.inStock}
                        >
                            <FiShoppingCart /> Add to Cart
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '12px' }}
                        >
                            <FiHeart />
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '12px' }}
                        >
                            <FiShare2 />
                        </button>
                    </div>

                    {/* Shipping Info */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}>
                        <p style={{ marginBottom: '8px', fontWeight: '500' }}>Shipping Information:</p>
                        <ul style={{ paddingLeft: '20px', color: '#64748b' }}>
                            <li>Free shipping on orders over $50</li>
                            <li>Standard shipping: 3-5 business days</li>
                            <li>Express shipping available at checkout</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Product Details Tabs */}
            <div style={{ marginTop: '60px' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <button
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: '2px solid #2563eb',
                            fontWeight: '600',
                            color: '#2563eb',
                            cursor: 'pointer'
                        }}
                    >
                        Specifications
                    </button>
                </div>

                <div style={{ padding: '0 12px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Technical Specifications</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {product.specifications.map((spec, index) => (
                                <tr key={index} style={{
                                    borderBottom: '1px solid #e2e8f0',
                                    backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white'
                                }}>
                                    <td style={{ padding: '12px', fontWeight: '500', width: '30%' }}>{spec.name}</td>
                                    <td style={{ padding: '12px' }}>{spec.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;