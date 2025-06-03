const mongoose = require('mongoose');

const forumPostSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200, // Limit title length
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000, // Limit content length
        },
        postedBy: { // Reference to the College that created the post
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true,
        },
        // For mentioning colleges:
        // This could store an array of College IDs that were mentioned in the post content
        // The frontend would parse mentions (e.g., @CollegeName) and send their IDs here.
        mentionedColleges: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'College',
            },
        ],
        // You could add categories/tags for posts later:
        // tags: [String],
        // category: { type: String, enum: ['General', 'Academic', 'Administrative', 'Events', 'Research'], default: 'General' },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;