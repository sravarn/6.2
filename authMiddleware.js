// authMiddleware.js
const jwt = require('jsonwebtoken');

// Ensure the secret is loaded from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify JWT token from the Authorization header.
 */
function authenticateToken(req, res, next) {
    // 1. Get the token from the Authorization header
    // The header format is "Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    // Split the header to get the token part (Bearer [0], token [1])
    // The optional chaining (?.) prevents errors if authHeader is null/undefined
    const token = authHeader?.split(' ')[1]; 

    // 2. Handle missing token
    if (token == null) {
        // 401 Unauthorized: client provided no credentials
        return res.status(401).json({ 
            message: 'Access Denied: No token provided.' 
        });
    }

    // 3. Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        // 4. Handle invalid token
        if (err) {
            // 403 Forbidden: client provided invalid credentials (e.g., expired, wrong signature)
            return res.status(403).json({ 
                message: 'Access Denied: Invalid or expired token.' 
            });
        }
        
        // 5. Token is valid! Attach the user payload to the request for use in the route handler
        req.user = user; 
        
        // Proceed to the next middleware or the route handler
        next();
    });
}

module.exports = authenticateToken;
