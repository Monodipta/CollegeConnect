const asyncHandler = require('express-async-handler');
const ForumPost = require('../models/ForumPost');
const College = require('../models/College'); // For notification recipients and mentions
const Notification = require('../models/Notification'); // To create notifications

// @desc    Create a new forum post
// @route   POST /api/forum
// @access  Private (College only)
const createForumPost = asyncHandler(async (req, res) => {
    const { title, content, mentionedCollegeIds = [] } = req.body; // mentionedCollegeIds expected from frontend

    const postedByCollegeId = req.college._id;
    const postedByCollegeName = req.college.name;

    const forumPost = await ForumPost.create({
        title,
        content,
        postedBy: postedByCollegeId,
        mentionedColleges: mentionedCollegeIds, // Store mentioned college IDs
    });

    if (forumPost) {
        // --- Notification Logic for New Post ---
        const allOtherColleges = await College.find({ _id: { $ne: postedByCollegeId } }).select('_id');

        const newPostNotifications = allOtherColleges.map(college => ({
            recipient: college._id,
            sender: postedByCollegeId,
            type: 'forum-post',
            message: `New Forum Post: "${title}" by ${postedByCollegeName}.`,
            link: `/forum/${forumPost._id}`, // Link to the new forum post's detail page (future)
            relatedId: forumPost._id,
        }));

        if (newPostNotifications.length > 0) {
            await Notification.insertMany(newPostNotifications);
        }

        // --- Notification Logic for Mentions ---
        if (mentionedCollegeIds.length > 0) {
            const mentionNotifications = mentionedCollegeIds.map(mentionedId => ({
                recipient: mentionedId,
                sender: postedByCollegeId,
                type: 'forum-mention', // A specific type for mentions
                message: `<span class="math-inline">\{postedByCollegeName\} mentioned your college in a post\: "</span>{title}".`,
                link: `/forum/${forumPost._id}`,
                relatedId: forumPost._id,
            }));
            await Notification.insertMany(mentionNotifications);
        }
        // --- End Notification Logic ---

        res.status(201).json({
            _id: forumPost._id,
            title: forumPost.title,
            content: forumPost.content,
            postedBy: {
                _id: req.college._id,
                name: req.college.name,
                logo: req.college.logo,
            },
            mentionedColleges: forumPost.mentionedColleges,
            createdAt: forumPost.createdAt,
        });
    } else {
        res.status(400);
        throw new Error('Invalid forum post data');
    }
});

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Private (College only)
const getForumPosts = asyncHandler(async (req, res) => {
    const forumPosts = await ForumPost.find({})
        .populate('postedBy', 'name logo') // Populate poster's name and logo
        .populate('mentionedColleges', 'name') // Populate mentioned college names
        .sort({ createdAt: -1 }); // Newest posts first

    res.json(forumPosts);
});

// @desc    Get single forum post by ID
// @route   GET /api/forum/:id
// @access  Private (College only)
const getForumPostById = asyncHandler(async (req, res) => {
    const forumPost = await ForumPost.findById(req.params.id)
        .populate('postedBy', 'name logo')
        .populate('mentionedColleges', 'name');

    if (forumPost) {
        res.json(forumPost);
    } else {
        res.status(404);
        throw new Error('Forum post not found');
    }
});

// @desc    Update a forum post
// @route   PUT /api/forum/:id
// @access  Private (College only - only poster can update)
const updateForumPost = asyncHandler(async (req, res) => {
    const { title, content, mentionedCollegeIds = [] } = req.body;

    const forumPost = await ForumPost.findById(req.params.id);

    if (forumPost) {
        // Check if the logged-in college is the poster
        if (forumPost.postedBy.toString() !== req.college._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this post');
        }

        forumPost.title = title || forumPost.title;
        forumPost.content = content || forumPost.content;
        forumPost.mentionedColleges = mentionedCollegeIds; // Update mentioned colleges

        const updatedForumPost = await forumPost.save();
        res.json(updatedForumPost);
    } else {
        res.status(404);
        throw new Error('Forum post not found');
    }
});

// @desc    Delete a forum post
// @route   DELETE /api/forum/:id
// @access  Private (College only - only poster can delete)
const deleteForumPost = asyncHandler(async (req, res) => {
    const forumPost = await ForumPost.findById(req.params.id);

    if (forumPost) {
        // Check if the logged-in college is the poster
        if (forumPost.postedBy.toString() !== req.college._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this post');
        }

        await forumPost.deleteOne();
        res.json({ message: 'Forum post removed' });
    } else {
        res.status(404);
        throw new Error('Forum post not found');
    }
});

module.exports = {
    createForumPost,
    getForumPosts,
    getForumPostById,
    updateForumPost,
    deleteForumPost,
};