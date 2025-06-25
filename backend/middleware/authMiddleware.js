const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // For handling async errors
const College = require('../models/College'); // Our College model
require('dotenv').config();

const protect = asyncHandler(async(req, res, next) => {
    let token;

    // Check if token exists in headers and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if the decoded ID is our virtual super admin ID
            if (decoded.id === process.env.SUPER_ADMIN_ID_PAYLOAD) {
                req.college = {
                    _id: process.env.SUPER_ADMIN_ID_PAYLOAD,
                    name: 'Super Administrator',
                    email: process.env.SUPER_ADMIN_USERNAME + '@admin.collegeconnect.com',
                    role: 'admin',
                };
            } else {
                // For regular college users, fetch from DB
                req.college = await College.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
            }

            if (!req.college) { // If it's a regular user ID but not found in DB
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

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