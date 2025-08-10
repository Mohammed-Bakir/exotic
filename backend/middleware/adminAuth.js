import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization');

        // Check if no token
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        // Extract token from "Bearer <token>"
        const actualToken = token.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

        // Get user from database to check role
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

export default adminAuth;