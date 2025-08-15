import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: [
            'miniatures',
            'decorative',
            'functional',
            'jewelry',
            'toys',
            'prototypes',
            'art',
            'custom'
        ]
    },
    subcategory: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    // Product images stored in Cloudinary
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        altText: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    // 3D Printing specific properties
    printingDetails: {
        material: {
            type: String,
            enum: ['PLA', 'ABS', 'PETG', 'TPU', 'Resin', 'Wood Fill', 'Metal Fill', 'Custom'],
            default: 'PLA'
        },
        layerHeight: {
            type: String,
            default: '0.2mm'
        },
        infill: {
            type: String,
            default: '20%'
        },
        printTime: {
            type: String // e.g., "4 hours", "2 days"
        },
        supportRequired: {
            type: Boolean,
            default: false
        },
        postProcessing: {
            type: String,
            enum: ['None', 'Sanding', 'Painting', 'Assembly', 'Custom'],
            default: 'None'
        }
    },
    // Product specifications
    specifications: {
        dimensions: {
            length: Number, // in mm
            width: Number,  // in mm
            height: Number, // in mm
            weight: Number  // in grams
        },
        colors: [{
            name: String,
            hexCode: String,
            available: {
                type: Boolean,
                default: true
            }
        }],
        customizable: {
            type: Boolean,
            default: false
        },
        customizationOptions: [{
            name: String,
            type: {
                type: String,
                enum: ['text', 'color', 'size', 'material']
            },
            required: {
                type: Boolean,
                default: false
            }
        }]
    },
    // Inventory and availability
    inventory: {
        inStock: {
            type: Boolean,
            default: true
        },
        quantity: {
            type: Number,
            default: 0,
            min: 0
        },
        lowStockThreshold: {
            type: Number,
            default: 5
        },
        preOrder: {
            type: Boolean,
            default: false
        },
        estimatedDelivery: String // e.g., "3-5 business days"
    },
    // SEO and marketing
    seo: {
        metaTitle: String,
        metaDescription: String,
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true
        }
    },
    // Product status
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'discontinued'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    // Analytics
    views: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    // Admin info
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ createdAt: -1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0] || null;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (!this.inventory.inStock) return 'out-of-stock';
    if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low-stock';
    return 'in-stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
    virtuals: true
});

// Pre-save middleware to generate slug
productSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.seo.slug) {
        this.seo.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

export default mongoose.model('Product', productSchema);