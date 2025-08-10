import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided, authorization denied'
        });
    }

    try {
        // Extract token from "Bearer <token>"
        const actualToken = token.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

export default auth;