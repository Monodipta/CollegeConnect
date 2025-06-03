const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const collegeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // College names should ideally be unique
        },
        email: { // Contact email for the college
            type: String,
            required: true,
            unique: true,
        },
        password: { // Password for the college's login
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 1000, // Limit description length
        },
        logo: { // Path to the uploaded logo image
            type: String,
            default: '/uploads/default_college_logo.png', // Default logo if none uploaded
        },
        website: {
            type: String,
            required: false, // Optional
        },
        contactNumber: {
            type: String,
            required: false, // Optional
        },
        resetPasswordToken: String,      // NEW: Field to store the reset token
        resetPasswordExpire: Date,
        // You can add more fields here later, e.g., verified status, faculty, etc.
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Middleware to hash password before saving
collegeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Only hash if password was modified
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password in database
collegeSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash password reset token
collegeSchema.methods.getResetPasswordToken = function () {
    // Generate token (raw, non-hashed)
    const resetToken = crypto.randomBytes(20).toString('hex'); // Requires 'crypto' module

    // Hash token and set to resetPasswordToken field
    // This is important: Store the HASHED token in DB for security
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expire time (e.g., 10 minutes from now)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds

    return resetToken; // Return the UNHASHED token to send in email
};

const College = mongoose.model('College', collegeSchema);

module.exports = College;