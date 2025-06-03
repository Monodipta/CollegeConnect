const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // For handling async errors
const College = require('../models/College'); // Our College model

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in headers and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token using our JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the college by the ID in the token and attach it to the request
            // .select('-password') prevents sending the hashed password
            req.college = await College.findById(decoded.id).select('-password');

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error(error); // Log the actual error for debugging
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };