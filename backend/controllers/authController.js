const asyncHandler = require('express-async-handler');
const College = require('../models/College'); // Changed from User to College
const generateToken = require('../utils/generateToken');
const nodemailer = require('nodemailer'); // NEW: Import nodemailer
const crypto = require('crypto');

// @desc    Register a new college
// @route   POST /api/auth/register
// @access  Public
const registerCollege = asyncHandler(async (req, res) => {
    const { name, email, password, address, city, state, country, description, website, contactNumber } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : undefined; // Get path to uploaded logo

    // Check if college already exists by email or name
    const collegeExists = await College.findOne({ $or: [{ email }, { name }] });

    if (collegeExists) {
        res.status(400); // Bad request
        throw new Error('College already exists with that email or name');
    }

    // Create new college
    const college = await College.create({
        name,
        email,
        password, // Password will be hashed by the pre-save middleware
        address,
        city,
        state,
        country,
        description,
        logo, // Include logo path if uploaded
        website,
        contactNumber,
    });

    if (college) {
        res.status(201).json({ // 201 Created
            _id: college._id,
            name: college.name,
            email: college.email,
            logo: college.logo, // Send back the logo path
            token: generateToken(college._id), // Generate JWT token for immediate login
        });
    } else {
        res.status(400);
        throw new Error('Invalid college data');
    }
});

// @desc    Authenticate college & get token
// @route   POST /api/auth/login
// @access  Public
const loginCollege = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for college by email
    const college = await College.findOne({ email });

    // Check if college exists and password matches
    if (college && (await college.matchPassword(password))) {
        res.json({
            _id: college._id,
            name: college.name,
            email: college.email,
            logo: college.logo, // Send back the logo path
            token: generateToken(college._id), // Generate JWT token for login
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const college = await College.findOne({ email });

    if (!college) {
        res.status(404);
        throw new Error('College not found with that email address.');
    }

    // Generate reset token and set expiry
    const resetToken = college.getResetPasswordToken(); // Method from College model

    await college.save({ validateBeforeSave: false }); // Save college with new token, bypass validation for password field

    // Create reset URL (This is the link sent to the user)
    // Replace 'http://localhost:5173' with your actual frontend URL in production
    const resetURL = `<span class="math-inline">\{req\.protocol\}\://</span>{req.get('host')}/reset-password/${resetToken}`;
    // IMPORTANT: The frontend URL is typically different from backend host.
    // For development, use `http://localhost:5173/reset-password/${resetToken}`
    // For local testing, let's use a dummy URL for now.
    const frontendResetURL = `http://localhost:5173/reset-password/${resetToken}`;


    // --- Email Sending Logic (Placeholder for now) ---
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password.
    Please make a PUT request to: \n\n ${frontendResetURL} \n\n
    This token is valid for 10 minutes. If you did not request this, please ignore this email.`;

    try {
        // In a real application, you'd configure and use Nodemailer here
        // Example (requires email config in .env):
        
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Inside forgotPassword function:
        const mailOptions = {
            from: process.env.EMAIL_USERNAME, // Use your Gmail address from .env
            to: college.email,
            subject: 'Password Reset Request',
            text: message,
        };

        await transporter.sendMail(mailOptions);
        

        console.log('--- PASSWORD RESET LINK (FOR TESTING) ---');
        console.log(`To: ${college.email}`);
        console.log(`Subject: Password Reset Request for ${college.name}`);
        console.log(`Link: ${frontendResetURL}`);
        console.log('--- END RESET LINK ---');

        res.status(200).json({ success: true, data: 'Password reset email sent (or logged to console).' });
    } catch (err) {
        // If email fails, clear token and expiry so user can request again
        college.resetPasswordToken = undefined;
        college.resetPasswordExpire = undefined;
        await college.save({ validateBeforeSave: false });

        console.error('Error sending reset email:', err);
        res.status(500);
        throw new Error('Error sending password reset email. Please try again later.');
    }
});

// @desc    Reset password (using token)
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Hash the token from the URL parameter to match the one stored in DB
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const college = await College.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!college) {
        res.status(400); // Bad request / Invalid token
        throw new Error('Invalid or expired password reset token.');
    }

    // Set new password
    college.password = req.body.password; // The pre-save hook will hash it
    college.resetPasswordToken = undefined; // Clear token after use
    college.resetPasswordExpire = undefined; // Clear expiry

    await college.save(); // Save new password and clear token

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

module.exports = { registerCollege, loginCollege, forgotPassword,resetPassword }; // Export new function names