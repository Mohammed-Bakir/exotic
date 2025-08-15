import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiPlus, FiImage, FiSave, FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AddProduct = () => {
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        originalPrice: '',
        category: 'decorative',
        tags: '',
        images: [],
        printingDetails: {
            material: 'PLA',
            layerHeight: '0.2mm',
            infill: '20%',
            printTime: '',
            supportRequired: false,
            postProcessing: 'None'
        },
        specifications: {
            dimensions: {
                length: '',
                width: '',
                height: '',
                weight: ''
            },
            colors: [],
            customizable: false
        },
        inventory: {
            inStock: true,
            quantity: 0,
            lowStockThreshold: 5,
            estimatedDelivery: '3-5 business days'
        },
        featured: false,
        status: 'draft'
    });

    const categories = [
        { value: 'miniatures', label: 'Miniatures' },
        { value: 'decorative', label: 'Decorative Items' },
        { value: 'functional', label: 'Functional Items' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'toys', label: 'Toys & Games' },
        { value: 'prototypes', label: 'Prototypes' },
        { value: 'art', label: 'Art & Sculptures' },
        { value: 'custom', label: 'Custom Orders' }
    ];

    const materials = ['PLA', 'ABS', 'PETG', 'TPU', 'Resin', 'Wood Fill', 'Metal Fill', 'Custom'];
    const postProcessingOptions = ['None', 'Sanding', 'Painting', 'Assembly', 'Custom'];

    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '20px'
            }}>
                <div>
                    <h2>Access Denied</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        You need admin privileges to add products.
                    </p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child, grandchild] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: grandchild ? {
                        ...prev[parent][child],
                        [grandchild]: type === 'checkbox' ? checked : value
                    } : type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                const response = await axios.post(`${API_BASE_URL}/api/uploads/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                return {
                    url: response.data.url,
                    publicId: response.data.public_id,
                    altText: '',
                    isPrimary: false
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedImages]
            }));

            showSuccess(`${uploadedImages.length} image(s) uploaded successfully!`);
        } catch (error) {
            console.error('Image upload error:', error);
            showError('Failed to upload images');
        }
        setUploadingImages(false);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const setPrimaryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => ({
                ...img,
                isPrimary: i === index
            }))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
            showError('Please fill in all required fields');
            return;
        }

        if (formData.images.length === 0) {
            showError('Please upload at least one product image');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                specifications: {
                    ...formData.specifications,
                    dimensions: {
                        length: formData.specifications.dimensions.length ? parseFloat(formData.specifications.dimensions.length) : undefined,
                        width: formData.specifications.dimensions.width ? parseFloat(formData.specifications.dimensions.width) : undefined,
                        height: formData.specifications.dimensions.height ? parseFloat(formData.specifications.dimensions.height) : undefined,
                        weight: formData.specifications.dimensions.weight ? parseFloat(formData.specifications.dimensions.weight) : undefined,
                    }
                },
                inventory: {
                    ...formData.inventory,
                    quantity: parseInt(formData.inventory.quantity) || 0,
                    lowStockThreshold: parseInt(formData.inventory.lowStockThreshold) || 5
                }
            };

            const response = await axios.post(`${API_BASE_URL}/api/products`, productData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('exotic-token')}`
                }
            });

            if (response.data.success) {
                showSuccess('Product created successfully!');
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    shortDescription: '',
                    price: '',
                    originalPrice: '',
                    category: 'decorative',
                    tags: '',
                    images: [],
                    printingDetails: {
                        material: 'PLA',
                        layerHeight: '0.2mm',
                        infill: '20%',
                        printTime: '',
                        supportRequired: false,
                        postProcessing: 'None'
                    },
                    specifications: {
                        dimensions: {
                            length: '',
                            width: '',
                            height: '',
                            weight: ''
                        },
                        colors: [],
                        customizable: false
                    },
                    inventory: {
                        inStock: true,
                        quantity: 0,
                        lowStockThreshold: 5,
                        estimatedDelivery: '3-5 business days'
                    },
                    featured: false,
                    status: 'draft'
                });
            }
        } catch (error) {
            console.error('Create product error:', error);
            showError(error.response?.data?.message || 'Failed to create product');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h1 style={{
                        margin: 0,
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <FiPlus size={28} />
                        Add New Product
                    </h1>
                    <p style={{ color: '#64748b', margin: '8px 0 0 0' }}>
                        Create a new 3D printed product for your store
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Basic Information</h2>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="miniature, fantasy, dragon"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    maxLength={200}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Brief description for product cards"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Full Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Detailed product description..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Pricing</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="29.99"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Original Price ($) - Optional
                                </label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="39.99 (for showing discounts)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Product Images</h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}>
                                {uploadingImages ? (
                                    <>
                                        <FiUpload className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FiImage />
                                        Upload Images
                                    </>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImages}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {formData.images.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '16px'
                            }}>
                                {formData.images.map((image, index) => (
                                    <div key={index} style={{
                                        position: 'relative',
                                        border: image.isPrimary ? '3px solid #10b981' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            src={image.url}
                                            alt={`Product ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            display: 'flex',
                                            gap: '4px'
                                        }}>
                                            {!image.isPrimary && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPrimaryImage(index)}
                                                    style={{
                                                        padding: '4px',
                                                        backgroundColor: '#10b981',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                    title="Set as primary"
                                                >
                                                    ★
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    padding: '4px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                        {image.isPrimary && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                left: '0',
                                                right: '0',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                padding: '4px',
                                                textAlign: 'center',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                Primary Image
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3D Printing Details */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b' }}>3D Printing Details</h2>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Material
                                    </label>
                                    <select
                                        name="printingDetails.material"
                                        value={formData.printingDetails.material}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {materials.map(material => (
                                            <option key={material} value={material}>
                                                {material}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Layer Height
                                    </label>
                                    <input
                                        type="text"
                                        name="printingDetails.layerHeight"
                                        value={formData.printingDetails.layerHeight}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="0.2mm"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Infill
                                    </label>
                                    <input
                                        type="text"
                                        name="printingDetails.infill"
                                        value={formData.printingDetails.infill}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="20%"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Print Time
                                    </label>
                                    <input
                                        type="text"
                                        name="printingDetails.printTime"
                                        value={formData.printingDetails.printTime}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="4 hours"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Post Processing
                                    </label>
                                    <select
                                        name="printingDetails.postProcessing"
                                        value={formData.printingDetails.postProcessing}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {postProcessingOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        name="printingDetails.supportRequired"
                                        checked={formData.printingDetails.supportRequired}
                                        onChange={handleInputChange}
                                    />
                                    Support Required
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Inventory & Status</h2>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="inventory.quantity"
                                        value={formData.inventory.quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Low Stock Threshold
                                    </label>
                                    <input
                                        type="number"
                                        name="inventory.lowStockThreshold"
                                        value={formData.inventory.lowStockThreshold}
                                        onChange={handleInputChange}
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Estimated Delivery
                                </label>
                                <input
                                    type="text"
                                    name="inventory.estimatedDelivery"
                                    value={formData.inventory.estimatedDelivery}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="3-5 business days"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        name="inventory.inStock"
                                        checked={formData.inventory.inStock}
                                        onChange={handleInputChange}
                                    />
                                    In Stock
                                </label>

                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                    />
                                    Featured Product
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <button
                            type="submit"
                            disabled={loading || uploadingImages}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px 32px',
                                backgroundColor: loading ? '#94a3b8' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '18px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FiSave size={20} />
                            {loading ? 'Creating Product...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;