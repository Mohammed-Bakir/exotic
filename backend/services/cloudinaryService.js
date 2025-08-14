import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
    // Upload image from buffer
    async uploadImage(buffer, options = {}) {
        try {
            const defaultOptions = {
                folder: 'exotic-3d-printing',
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto' }
                ]
            };

            const uploadOptions = { ...defaultOptions, ...options };

            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject({
                                success: false,
                                error: error.message
                            });
                        } else {
                            resolve({
                                success: true,
                                url: result.secure_url,
                                public_id: result.public_id,
                                format: result.format,
                                bytes: result.bytes,
                                width: result.width,
                                height: result.height
                            });
                        }
                    }
                ).end(buffer);
            });
        } catch (error) {
            console.error('Cloudinary uploadImage error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Upload image from URL
    async uploadFromUrl(url, options = {}) {
        try {
            const defaultOptions = {
                folder: 'exotic-3d-printing',
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto' }
                ]
            };

            const uploadOptions = { ...defaultOptions, ...options };

            const result = await cloudinary.uploader.upload(url, uploadOptions);

            return {
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height
            };
        } catch (error) {
            console.error('Cloudinary uploadFromUrl error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Delete image
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);

            return {
                success: result.result === 'ok',
                result: result.result
            };
        } catch (error) {
            console.error('Cloudinary deleteImage error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get image details
    async getImageDetails(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);

            return {
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
            };
        } catch (error) {
            console.error('Cloudinary getImageDetails error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Generate transformation URL
    generateTransformationUrl(publicId, transformations) {
        try {
            const url = cloudinary.url(publicId, {
                transformation: transformations,
                secure: true
            });

            return {
                success: true,
                url
            };
        } catch (error) {
            console.error('Cloudinary generateTransformationUrl error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get optimized image URL
    getOptimizedUrl(publicId, width = 800, height = 600, quality = 'auto') {
        return cloudinary.url(publicId, {
            transformation: [
                { width, height, crop: 'fill' },
                { quality }
            ],
            secure: true
        });
    },

    // Test connection
    async testConnection() {
        try {
            const result = await cloudinary.api.ping();
            return {
                success: true,
                status: result.status
            };
        } catch (error) {
            console.error('Cloudinary connection test error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

export default cloudinaryService;