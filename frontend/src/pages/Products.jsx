import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

// Sample data - would come from API in real app
const allProducts = [
    {
        _id: '1',
        title: 'Geometric Desk Organizer',
        description: 'Keep your workspace tidy with this modern geometric desk organizer. Perfect for storing pens, pencils, and small office supplies.',
        price: 24.99,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '15 x 10 x 8 cm',
        printTime: 4,
        category: 'home-decor',
        colors: ['Black', 'White', 'Gray'],
        rating: 4.5,
        reviews: 23,
        createdAt: '2024-01-15'
    },
    {
        _id: '2',
        title: 'Honeycomb Wall Planter',
        description: 'Modern hexagonal wall planter perfect for small succulents and air plants. Comes with mounting hardware.',
        price: 19.99,
        images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PETG',
        dimensions: '12 x 12 x 5 cm',
        printTime: 3,
        category: 'home-decor',
        colors: ['Green', 'White', 'Terracotta'],
        rating: 4.8,
        reviews: 45,
        createdAt: '2024-02-01'
    },
    {
        _id: '3',
        title: 'Mechanical Phone Stand',
        description: 'Articulated phone stand with adjustable viewing angles. Great for watching videos or video calls.',
        price: 15.99,
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '10 x 8 x 15 cm',
        printTime: 5,
        category: 'gadgets',
        colors: ['Black', 'Blue', 'Red'],
        rating: 4.3,
        reviews: 67,
        createdAt: '2024-01-20'
    },
    {
        _id: '4',
        title: 'Low-Poly Vase',
        description: 'Modern low-poly vase perfect for flowers or as a standalone decorative piece.',
        price: 29.99,
        images: ['https://images.unsplash.com/photo-1602748828300-2843df3b3923?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '15 x 15 x 20 cm',
        printTime: 8,
        category: 'home-decor',
        colors: ['White', 'Gold', 'Silver'],
        rating: 4.7,
        reviews: 34,
        createdAt: '2024-01-10'
    },
    {
        _id: '5',
        title: 'Cable Organizer',
        description: 'Keep your cables neat and tangle-free with this sleek cable management solution.',
        price: 12.99,
        images: ['https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '8 x 5 x 2 cm',
        printTime: 2,
        category: 'gadgets',
        colors: ['Black', 'White'],
        rating: 4.2,
        reviews: 89,
        createdAt: '2024-02-10'
    },
    {
        _id: '6',
        title: 'Minimalist Lamp Shade',
        description: 'Elegant minimalist lamp shade that creates beautiful ambient lighting patterns.',
        price: 34.99,
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PETG',
        dimensions: '20 x 20 x 25 cm',
        printTime: 12,
        category: 'home-decor',
        colors: ['White', 'Cream', 'Gray'],
        rating: 4.6,
        reviews: 28,
        createdAt: '2024-01-25'
    },
    {
        _id: '7',
        title: 'Wireless Charging Stand',
        description: 'Sleek wireless charging stand compatible with most smartphones. Includes cable management.',
        price: 22.99,
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'ABS',
        dimensions: '12 x 8 x 10 cm',
        printTime: 6,
        category: 'gadgets',
        colors: ['Black', 'White', 'Blue'],
        rating: 4.4,
        reviews: 56,
        createdAt: '2024-02-05'
    },
    {
        _id: '8',
        title: 'Succulent Pot Set',
        description: 'Set of 3 modern geometric succulent pots with drainage holes. Perfect for small plants.',
        price: 18.99,
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '8 x 8 x 6 cm each',
        printTime: 9,
        category: 'home-decor',
        colors: ['Terracotta', 'White', 'Green'],
        rating: 4.9,
        reviews: 78,
        createdAt: '2024-01-30'
    }
];

const categories = [
    { id: 'all', name: 'All Products', count: allProducts.length },
    { id: 'home-decor', name: 'Home Decor', count: allProducts.filter(p => p.category === 'home-decor').length },
    { id: 'gadgets', name: 'Gadgets', count: allProducts.filter(p => p.category === 'gadgets').length },
    { id: 'accessories', name: 'Accessories', count: 0 },
    { id: 'custom', name: 'Custom Orders', count: 0 }
];

const materials = ['PLA', 'PETG', 'ABS', 'TPU'];
const colors = ['Black', 'White', 'Gray', 'Blue', 'Red', 'Green', 'Gold', 'Silver', 'Terracotta', 'Cream'];

const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
];

const Products = () => {
    const [products, setProducts] = useState(allProducts);
    const [filteredProducts, setFilteredProducts] = useState(allProducts);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [sortBy, setSortBy] = useState('newest');

    // UI states
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Apply all filters and sorting
    useEffect(() => {
        let filtered = [...allProducts];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.materials.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Materials filter
        if (selectedMaterials.length > 0) {
            filtered = filtered.filter(product =>
                selectedMaterials.includes(product.materials)
            );
        }

        // Colors filter
        if (selectedColors.length > 0) {
            filtered = filtered.filter(product =>
                product.colors.some(color => selectedColors.includes(color))
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
                    return a.title.localeCompare(b.title);
                case 'name-za':
                    return b.title.localeCompare(a.title);
                case 'rating':
                    return b.rating - a.rating;
                case 'popular':
                    return b.reviews - a.reviews;
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, selectedMaterials, selectedColors, priceRange, sortBy]);

    // Handle material filter toggle
    const toggleMaterial = (material) => {
        setSelectedMaterials(prev =>
            prev.includes(material)
                ? prev.filter(m => m !== material)
                : [...prev, material]
        );
    };

    // Handle color filter toggle
    const toggleColor = (color) => {
        setSelectedColors(prev =>
            prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color]
        );
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedMaterials([]);
        setSelectedColors([]);
        setPriceRange([0, 100]);
        setSortBy('newest');
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedCategory !== 'all' ||
        selectedMaterials.length > 0 || selectedColors.length > 0 ||
        priceRange[0] > 0 || priceRange[1] < 100;

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
                            outline: 'none'
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
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Filters</h3>
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
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                            backgroundColor: '#f1f5f9',
                                            padding: '2px 6px',
                                            borderRadius: '10px'
                                        }}>
                                            {category.count}
                                        </span>
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
                                    max="100"
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
                        <div style={{ marginBottom: '24px' }}>
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

                        {/* Colors */}
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Colors</h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px'
                            }}>
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        style={{
                                            padding: '6px 8px',
                                            border: selectedColors.includes(color) ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            backgroundColor: selectedColors.includes(color) ? '#f0f9ff' : 'white',
                                            color: selectedColors.includes(color) ? '#2563eb' : '#475569',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: selectedColors.includes(color) ? '600' : '400'
                                        }}
                                    >
                                        {color}
                                    </button>
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

                        {hasActiveFilters && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {searchTerm && (
                                    <span style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        Search: {searchTerm}
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#64748b'
                                            }}
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {selectedCategory !== 'all' && (
                                    <span style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {categories.find(c => c.id === selectedCategory)?.name}
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#64748b'
                                            }}
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Products Display */}
                    {filteredProducts.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '2px dashed #e2e8f0'
                        }}>
                            <FiSearch style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#475569' }}>
                                No products found
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                Try adjusting your filters or search term to find what you're looking for.
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: viewMode === 'grid'
                                ? 'repeat(auto-fill, minmax(280px, 1fr))'
                                : '1fr',
                            gap: viewMode === 'grid' ? '24px' : '16px'
                        }}>
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;