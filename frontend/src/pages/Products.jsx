import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiX, FiChevronDown, FiGrid, FiList, FiLoader } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [sortBy, setSortBy] = useState('newest');

    // UI states
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'miniatures', name: 'Miniatures' },
        { id: 'decorative', name: 'Decorative Items' },
        { id: 'functional', name: 'Functional Items' },
        { id: 'jewelry', name: 'Jewelry' },
        { id: 'toys', name: 'Toys & Games' },
        { id: 'prototypes', name: 'Prototypes' },
        { id: 'art', name: 'Art & Sculptures' },
        { id: 'custom', name: 'Custom Orders' }
    ];

    const materials = ['PLA', 'ABS', 'PETG', 'TPU', 'Resin', 'Wood Fill', 'Metal Fill', 'Custom'];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'name-az', label: 'Name: A to Z' },
        { value: 'name-za', label: 'Name: Z to A' }
    ];

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/products`);

                if (response.data.success) {
                    setProducts(response.data.products);
                    setFilteredProducts(response.data.products);
                } else {
                    setError('Failed to load products');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.printingDetails?.material.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Materials filter
        if (selectedMaterials.length > 0) {
            filtered = filtered.filter(product =>
                selectedMaterials.includes(product.printingDetails?.material)
            );
        }

        // Price range filter
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name-az':
                    return a.name.localeCompare(b.name);
                case 'name-za':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory, selectedMaterials, priceRange, sortBy]);

    // Handle material filter toggle
    const toggleMaterial = (material) => {
        setSelectedMaterials(prev =>
            prev.includes(material)
                ? prev.filter(m => m !== material)
                : [...prev, material]
        );
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedMaterials([]);
        setPriceRange([0, 200]);
        setSortBy('newest');
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedCategory !== 'all' ||
        selectedMaterials.length > 0 || priceRange[0] > 0 || priceRange[1] < 200;

    // Transform product data for ProductCard component
    const transformProductForCard = (product) => ({
        _id: product._id,
        title: product.name,
        description: product.shortDescription || product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images?.length > 0 ? [product.images[0].url] : [],
        materials: product.printingDetails?.material || 'PLA',
        dimensions: product.specifications?.dimensions ?
            `${product.specifications.dimensions.length || 0} x ${product.specifications.dimensions.width || 0} x ${product.specifications.dimensions.height || 0} cm` :
            'N/A',
        printTime: product.printingDetails?.printTime || 'N/A',
        category: product.category,
        colors: product.specifications?.colors?.map(c => c.name) || [],
        rating: product.rating?.average || 0,
        reviews: product.rating?.count || 0,
        createdAt: product.createdAt,
        featured: product.featured,
        inStock: product.inventory?.inStock || false
    });

    if (loading) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <FiLoader size={48} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#64748b', fontSize: '18px' }}>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px' }}>😕</div>
                <h2 style={{ color: '#ef4444', margin: 0 }}>Oops! Something went wrong</h2>
                <p style={{ color: '#64748b', margin: 0 }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Shop Our Collection</h1>
                <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                    Discover our range of premium 3D printed products designed for modern living
                </p>
            </div>

            {/* Search and Controls */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '32px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    flex: '1',
                    minWidth: '300px'
                }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 44px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <FiSearch style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontSize: '18px'
                    }} />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            <FiX />
                        </button>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div style={{ position: 'relative' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '12px 40px 12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            appearance: 'none'
                        }}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <FiChevronDown style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        pointerEvents: 'none'
                    }} />
                </div>

                {/* View Mode Toggle */}
                <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '12px',
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
                            padding: '12px',
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

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: showFilters ? '#2563eb' : 'white',
                        color: showFilters ? 'white' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <FiFilter />
                    Filters
                    {hasActiveFilters && (
                        <span style={{
                            backgroundColor: showFilters ? 'white' : '#ef4444',
                            color: showFilters ? '#2563eb' : 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            !
                        </span>
                    )}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                {/* Filters Sidebar */}
                {showFilters && (
                    <div style={{
                        width: '280px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Filters</h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Categories */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Categories</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            backgroundColor: selectedCategory === category.id ? '#f0f9ff' : 'transparent',
                                            color: selectedCategory === category.id ? '#2563eb' : '#475569',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span>{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Price Range</h4>
                            <div style={{ padding: '0 8px' }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    style={{ width: '100%', marginBottom: '8px' }}
                                />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    color: '#64748b'
                                }}>
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Materials */}
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Materials</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {materials.map(material => (
                                    <label
                                        key={material}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMaterials.includes(material)}
                                            onChange={() => toggleMaterial(material)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {material}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div style={{ flex: 1 }}>
                    {/* Results Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        padding: '16px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <div>
                            <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                {filteredProducts.length} Products
                            </span>
                            {searchTerm && (
                                <span style={{ color: '#64748b', marginLeft: '8px' }}>
                                    for "{searchTerm}"
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Products Display */}
                    {filteredProducts.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                            <h3 style={{ color: '#64748b', margin: '0 0 8px 0' }}>
                                {products.length === 0 ? 'No products available yet' : 'No products found'}
                            </h3>
                            <p style={{ color: '#94a3b8', margin: 0 }}>
                                {products.length === 0
                                    ? 'Check back soon for amazing 3D printed products!'
                                    : 'Try adjusting your filters or search terms'
                                }
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        marginTop: '16px',
                                        padding: '8px 16px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: viewMode === 'grid'
                                ? 'repeat(auto-fill, minmax(280px, 1fr))'
                                : '1fr',
                            gap: '24px'
                        }}>
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={transformProductForCard(product)}
                                />
                            ))}
                        </div>
                    )}
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

export default Products;