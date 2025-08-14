import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'exotic-3d-printing',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
        ]
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            url: req.file.path,
            public_id: req.file.filename,
            format: req.file.format,
            bytes: req.file.bytes,
            width: req.file.width,
            height: req.file.height
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const uploadedImages = req.files.map(file => ({
            url: file.path,
            public_id: file.filename,
            format: file.format,
            bytes: file.bytes,
            width: file.width,
            height: file.height
        }));

        res.json({
            success: true,
            message: `${uploadedImages.length} images uploaded successfully`,
            images: uploadedImages
        });

    } catch (error) {
        console.error('Multiple images upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload images'
        });
    }
});

// Delete image
router.delete('/image/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found or already deleted'
            });
        }

    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete image'
        });
    }
});

// Get image details
router.get('/image/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;

        const result = await cloudinary.api.resource(publicId);

        res.json({
            success: true,
            image: {
                public_id: result.public_id,
                url: result.secure_url,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                created_at: result.created_at
            }
        });

    } catch (error) {
        console.error('Get image details error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get image details'
        });
    }
});

// Health check for Cloudinary connection
router.get('/health', async (req, res) => {
    try {
        // Test Cloudinary connection by getting account details
        const result = await cloudinary.api.ping();

        res.json({
            success: true,
            message: 'Cloudinary connection successful',
            status: result.status
        });

    } catch (error) {
        console.error('Cloudinary health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Cloudinary connection failed',
            error: error.message
        });
    }
});

export default router;