const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                'Official Documents',
                'Event Materials',
                'Reports & Academic Content',
                'Administrative Documents',
            ],
        },
        file: { // Path to the uploaded file
            type: String,
            required: true,
        },
        originalFileName: { // NEW: Original name of the file as uploaded by the user
                type: String,
                required: true,
            },
        uploadedBy: { // Reference to the College that uploaded it
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true,
        },
        // You could add visibility options here if needed later (e.g., 'public', 'private', 'group')
        // visibility: {
        //     type: String,
        //     enum: ['public', 'private'],
        //     default: 'public',
        // },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;