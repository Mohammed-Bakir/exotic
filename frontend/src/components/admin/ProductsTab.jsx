import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiEdit, FiTrash2, FiEye, FiLoader } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        lowStock: 0
    });
    const { showSuccess, showError } = useToast();

    // Fetch products and calculate stats
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/products`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('exotic-token')}`
                    }
                });

                if (response.data.success) {
                    const productsData = response.data.products;
                    setProducts(productsData);

                    // Calculate stats
                    const total = productsData.length;
                    const active = productsData.filter(p => p.status === 'active').length;
                    const draft = productsData.filter(p => p.status === 'draft').length;
                    const lowStock = productsData.filter(p =>
                        p.inventory?.quantity <= p.inventory?.lowStockThreshold
                    ).length;

                    setStats({ total, active, draft, lowStock });
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                showError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [showError]);

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('exotic-token')}`
                }
            });

            if (response.data.success) {
                setProducts(products.filter(p => p._id !== productId));
                showSuccess('Product deleted successfully');

                // Recalculate stats
                const updatedProducts = products.filter(p => p._id !== productId);
                const total = updatedProducts.length;
                const active = updatedProducts.filter(p => p.status === 'active').length;
                const draft = updatedProducts.filter(p => p.status === 'draft').length;
                const lowStock = updatedProducts.filter(p =>
                    p.inventory?.quantity <= p.inventory?.lowStockThreshold
                ).length;
                setStats({ total, active, draft, lowStock });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showError('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <FiLoader size={48} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#64748b' }}>Loading products...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Product Management</h2>
                    <a
                        href="/admin/add-product"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <FiPlus size={16} />
                        Add New Product
                    </a>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '24px' }}>
                            {stats.total}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Total Products
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '24px' }}>
                            {stats.active}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Active Products
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '24px' }}>
                            {stats.draft}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Draft Products
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '24px' }}>
                            {stats.lowStock}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Low Stock
                        </p>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>All Products</h3>

                {products.length === 0 ? (
                    <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px'
                    }}>
                        <FiPackage size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0', color: '#64748b' }}>
                            No Products Yet
                        </h3>
                        <p style={{ margin: '0 0 16px 0', color: '#94a3b8' }}>
                            Start by adding your first 3D printed product to the store.
                        </p>
                        <a
                            href="/admin/add-product"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <FiPlus size={14} />
                            Add Your First Product
                        </a>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>
                                        Product
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>
                                        Category
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>
                                        Price
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>
                                        Stock
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>
                                        Status
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '500' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            objectFit: 'cover',
                                                            borderRadius: '6px'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        backgroundColor: '#f1f5f9',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FiPackage size={20} style={{ color: '#94a3b8' }} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                        {product.printingDetails?.material || 'PLA'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                                            {product.category}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: '500', color: '#1e293b' }}>
                                            ${product.price}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                color: product.inventory?.quantity <= product.inventory?.lowStockThreshold
                                                    ? '#ef4444' : '#10b981'
                                            }}>
                                                {product.inventory?.quantity || 0}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: product.status === 'active' ? '#dcfce7' :
                                                    product.status === 'draft' ? '#fef3c7' : '#fee2e2',
                                                color: product.status === 'active' ? '#16a34a' :
                                                    product.status === 'draft' ? '#d97706' : '#dc2626'
                                            }}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => window.open(`/products/${product._id}`, '_blank')}
                                                    style={{
                                                        padding: '6px',
                                                        backgroundColor: '#f1f5f9',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#64748b'
                                                    }}
                                                    title="View Product"
                                                >
                                                    <FiEye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/admin/edit-product/${product._id}`}
                                                    style={{
                                                        padding: '6px',
                                                        backgroundColor: '#dbeafe',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#2563eb'
                                                    }}
                                                    title="Edit Product"
                                                >
                                                    <FiEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    style={{
                                                        padding: '6px',
                                                        backgroundColor: '#fee2e2',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#dc2626'
                                                    }}
                                                    title="Delete Product"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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

export default ProductsTab;