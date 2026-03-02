const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the JWT token from the 'Authorization' header.
 * Expected format in Postman: Bearer <token>
 */
const verifyToken = (req, res, next) => {
    // 1. Get the Authorization header
    const authHeader = req.headers['authorization'];

    // 2. Extract the token (Split "Bearer <token>" and take the second part)
    // FIX: The index [1] must be OUTSIDE the split(' ') parentheses
    const token = authHeader && authHeader.split(' ')[1];

    // Debugging: This helps you see if the token is actually reaching the server
    console.log('--- Auth Middleware ---');
    console.log('Received Header:', authHeader);
    console.log('Extracted Token:', token ? 'Token Found' : 'No Token Found');

    if (!token) {
        return res.status(401).json({ message: "No token provided. Access denied." });
    }

    try {
        // 3. Verify the token using the secret from your .env file
        // Ensure process.env.JWT_SECRET matches what you used in login
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_random_string');

        // 4. Attach the user data to the request object
        req.user = verified;

        // 5. Move to the next middleware or controller
        next();
    } catch (error) {
        // This triggers if the token is tampered with, expired, or the secret is wrong
        console.error('JWT Verification Error:', error.message);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = verifyToken;
