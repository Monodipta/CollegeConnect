const express = require('express');
const { uploadResource, getResources, getResourceById, deleteResource,downloadResourceFile } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure this 'uploads/resources/' folder exists in your backend root
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // ⭐⭐ THIS IS THE CORRECTED LINE ⭐⭐
        // It must start and end with BACKTICKS (`) and use ${} for variables.
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Allow all file types for resources (or add specific filters if desired)
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for general resources
});


// Routes for resources
router.route('/')
    .post(protect, upload.single('resourceFile'), uploadResource) // Upload new resource
    .get(protect, getResources);                               // Get all resources

router.route('/:id')
    .get(protect, getResourceById)                           // Get single resource
    .delete(protect, deleteResource);                        // Delete a resource

router.route('/download/:id').get(protect, downloadResourceFile); // NEW: Download route


module.exports = router;