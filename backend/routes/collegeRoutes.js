const express = require('express');
const { getMyCollegeProfile, updateMyCollegeProfile, getCollegeById, getAllColleges } = require('../controllers/collegeController'); // NEW: Import update function
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer'); // NEW: Import multer
const path = require('path');     // NEW: Import path

const router = express.Router();

// Configure Multer for file storage (re-use from authRoutes, or define here again for clarity)
// It's generally better to define it here if it's specific to these routes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this 'uploads' folder exists in backend root
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

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


// Protected routes
router.route('/me')
    .get(protect, getMyCollegeProfile) // Get logged-in college's profile
    .put(protect, upload.single('logo'), updateMyCollegeProfile); // NEW: Update logged-in college's profile

router.route('/:id').get(protect, getCollegeById);     // Get specific college's profile by ID
router.route('/').get(protect, getAllColleges);        // Get all colleges (for directory/feed)

module.exports = router;