const asyncHandler = require('express-async-handler');
const College = require('../models/College');
const generateToken = require('../utils/generateToken'); 
// @desc    Get details of the logged-in college
// @route   GET /api/colleges/me
// @access  Private (requires token)
const getMyCollegeProfile = asyncHandler(async (req, res) => {
    if (req.college) {
        res.json(req.college);
    } else {
        res.status(404);
        throw new Error('College not found');
    }
});

// @desc    Update details of the logged-in college
// @route   PUT /api/colleges/me
// @access  Private (requires token)
const updateMyCollegeProfile = asyncHandler(async (req, res) => {
    // req.college is set by the 'protect' middleware
    const college = await College.findById(req.college._id);

    if (college) {
        // Update fields that are provided in the request body
        college.name = req.body.name || college.name;
        college.email = req.body.email || college.email;
        college.address = req.body.address || college.address;
        college.city = req.body.city || college.city;
        college.state = req.body.state || college.state;
        college.country = req.body.country || college.country;
        college.description = req.body.description || college.description;
        college.website = req.body.website || college.website;
        college.contactNumber = req.body.contactNumber || college.contactNumber;

        // Handle logo update if a new file is uploaded
        if (req.file) {
            // You might want to delete the old logo file here from the 'uploads' folder
            // (This requires fs.unlink and careful error handling, consider later optimization)
            college.logo = `/uploads/${req.file.filename}`;
        } else if (req.body.logo === '') { // If frontend explicitly sends empty string for logo, remove it
            college.logo = '/uploads/default_college_logo.png'; // Or null, depending on your default behavior
        } else if (req.body.logo && req.body.logo !== college.logo) {
            // This case handles if the frontend sends the *existing* logo URL again,
            // meaning no *new* file was uploaded but the field wasn't cleared.
            // No change to logo path needed here.
        }


        // Handle password update only if password is provided
        if (req.body.password) {
            // The pre-save hook in the College model will hash this new password
            college.password = req.body.password;
        }

        const updatedCollege = await college.save();

        res.json({
            _id: updatedCollege._id,
            name: updatedCollege.name,
            email: updatedCollege.email,
            address: updatedCollege.address,
            city: updatedCollege.city,
            state: updatedCollege.state,
            country: updatedCollege.country,
            description: updatedCollege.description,
            logo: updatedCollege.logo,
            website: updatedCollege.website,
            contactNumber: updatedCollege.contactNumber,
            token: generateToken(updatedCollege._id), // Generate new token as profile data might change
        });
    } else {
        res.status(404);
        throw new Error('College not found');
    }
});


// @desc    Get details of a specific college by ID
// @route   GET /api/colleges/:id
// @access  Private (requires token - for viewing other college profiles)
const getCollegeById = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id).select('-password');

    if (college) {
        res.json(college);
    } else {
        res.status(404);
        throw new Error('College not found');
    }
});

// @desc    Get all colleges (for directory/feed)
// @route   GET /api/colleges
// @access  Private (requires token)
const getAllColleges = asyncHandler(async (req, res) => {
    const colleges = await College.find({}).select('-password');
    res.json(colleges);
});


module.exports = {
    getMyCollegeProfile,
    updateMyCollegeProfile, // <-- Add this to exports
    getCollegeById,
    getAllColleges,
};