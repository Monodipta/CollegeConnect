const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const College = require('../models/College'); // To get all colleges for notifications
const Notification = require('../models/Notification'); // To create notifications
const path = require('path'); // NEW: Import path module for file paths
const fs = require('fs');     // NEW: Import file system module for checking file existence
const mime = require('mime-types');

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private (College only)
const uploadResource = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;
    const file = req.file ? `/uploads/${req.file.filename}` : null; // Get path to uploaded file

    if (!file) {
        res.status(400);
        throw new Error('No file uploaded.');
    }

    // req.college is set by the 'protect' middleware
    const uploadedByCollege = req.college._id;
    const uploaderCollegeName = req.college.name;
    const resource = await Resource.create({
        title,
        description,
        category,
        file, // This is Multer's generated filename (e.g., "resourceFile-TIMESTAMP.pdf")
        originalFileName: req.file.originalname, // <-- NEW: Store the user's original filename
        uploadedBy: uploadedByCollege,
    });

    if (resource) {
        // --- Notification Logic ---
        const allColleges = await College.find({ _id: { $ne: uploadedByCollege } }).select('_id'); // Get all other colleges

        const notifications = allColleges.map(college => ({
            recipient: college._id,
            sender: uploadedByCollege,
            type: 'new-resource',
            message: `New Resource: "${title}" shared by ${uploaderCollegeName}.`,
            link: `/resources/${resource._id}`, // Link to the new resource's detail page
            relatedId: resource._id,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications); // Insert all notifications
        }
        // --- End Notification Logic ---

        res.status(201).json({
            _id: resource._id,
            title: resource.title,
            description: resource.description,
            category: resource.category,
            file: resource.file,
            uploadedBy: {
                _id: req.college._id,
                name: req.college.name,
                logo: req.college.logo,
            },
            createdAt: resource.createdAt,
        });
    } else {
        res.status(400);
        throw new Error('Invalid resource data');
    }
});

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private (College only)
const getResources = asyncHandler(async (req, res) => {
    // You can add query parameters for filtering by category, search, pagination later
    const resources = await Resource.find({})
        .populate('uploadedBy', 'name logo') // Populate uploader's name and logo
        .sort({ createdAt: -1 }); // Sort by newest first

    res.json(resources);
});

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Private (College only)
const getResourceById = asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id)
        .populate('uploadedBy', 'name logo');

    if (resource) {
        res.json(resource);
    } else {
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (College only - only uploader can delete)
const deleteResource = asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);

    if (resource) {
        // Check if the logged-in college is the uploader
        if (resource.uploadedBy.toString() !== req.college._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this resource');
        }

        // You might want to delete the actual file from the 'uploads' folder here as well
        // (Requires 'fs' module and careful error handling)

        await resource.deleteOne(); // Use deleteOne() on the document itself
        res.json({ message: 'Resource removed' });
    } else {
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc    Download a resource file
// @route   GET /api/resources/download/:id
// @access  Private (College only)
const downloadResourceFile = asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);

    if (resource) {
        // Construct the absolute path to the file
        // Assuming files are in 'backend/uploads/resources/'
        const filePath = path.join(__dirname, '..', 'uploads', path.basename(resource.file));

        // Check if the file actually exists on the server
        if (fs.existsSync(filePath)) {
            // Use the original filename stored in the database
            const downloadFileName = resource.originalFileName; // ⭐ THIS IS THE KEY CHANGE ⭐

            // Explicitly set Content-Type and Content-Disposition headers for robustness
            // (You should have `const mime = require('mime-types');` at the top of this file)
            const contentType = mime.lookup(filePath);
            res.setHeader('Content-Type', contentType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFileName)}"`); // Encode for special characters

            res.download(filePath, downloadFileName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Error downloading file' });
                    }
                }
            });
        }else {
            res.status(404);
            throw new Error('File not found on server');
        }
    } else {
        res.status(404);
        throw new Error('Resource entry not found in database');
    }
});


module.exports = {
    uploadResource,
    getResources,
    getResourceById,
    deleteResource,
     downloadResourceFile,
};