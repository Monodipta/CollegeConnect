const express = require('express');
const { registerCollege, loginCollege,forgotPassword,resetPassword } = require('../controllers/authController'); // Updated controller names
const multer = require('multer');
const path = require('path'); // Node.js path module for file paths

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create 'uploads' directory if it doesn't exist
        // This path is relative to the root of your backend project (where server.js is)
        cb(null, 'uploads/');
    },
   filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
}
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


// Route for college registration with logo upload
// 'logo' is the name of the field in the form that will hold the file
router.post('/register', upload.single('logo'), registerCollege);

// Route for college login
router.post('/login', loginCollege);
router.post('/forgot-password', forgotPassword); // NEW: Route to request reset link
router.put('/reset-password/:token', resetPassword); // NEW: Route to reset password with token

module.exports = router;