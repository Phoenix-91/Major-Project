const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

/**
 * Middleware to require authentication using Clerk
 * Attaches user information to req.auth
 */
const requireAuth = ClerkExpressRequireAuth({
    // Clerk will automatically verify the JWT token
    // and attach user info to req.auth
});

/**
 * Middleware to extract userId from Clerk auth
 * Use this after requireAuth to get the userId
 */
const extractUserId = (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User ID not found in authentication token'
            });
        }

        // Attach userId to request for easy access
        req.userId = req.auth.userId;
        next();
    } catch (error) {
        console.error('Error extracting user ID:', error);
        res.status(500).json({
            error: 'Authentication error',
            message: 'Failed to process authentication'
        });
    }
};

/**
 * Optional auth - doesn't fail if no token
 * Useful for endpoints that work with or without auth
 */
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization) {
        return requireAuth(req, res, next);
    }
    next();
};

module.exports = {
    requireAuth,
    extractUserId,
    optionalAuth
};
