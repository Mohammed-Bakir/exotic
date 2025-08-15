import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            material,
            inStock,
            featured,
            search,
            sort = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build filter object
        const filter = { status: 'active' };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (material) {
            filter['printingDetails.material'] = material;
        }

        if (inStock === 'true') {
            filter['inventory.inStock'] = true;
        }

        if (featured === 'true') {
            filter.featured = true;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const products = await Product.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'firstName lastName')
            .lean();

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total,
                hasNext: skip + products.length < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'firstName lastName')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Increment view count
        await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user.id
        };

        const product = new Product(productData);
        await product.save();

        const populatedProduct = await Product.findById(product._id)
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: populatedProduct
        });

    } catch (error) {
        console.error('Create product error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user.id
        };

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'firstName lastName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Update product error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/products/categories/list
// @desc    Get all categories with product counts
// @access  Public
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/products/featured/list
// @desc    Get featured products
// @access  Public
router.get('/featured/list', async (req, res) => {
    try {
        const products = await Product.find({
            status: 'active',
            featured: true
        })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('createdBy', 'firstName lastName')
            .lean();

        res.json({
            success: true,
            products
        });

    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;