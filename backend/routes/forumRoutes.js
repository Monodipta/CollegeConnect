const express = require('express');
const { createForumPost, getForumPosts, getForumPostById, updateForumPost, deleteForumPost } = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for forum posts
router.route('/')
    .post(protect, createForumPost) // Create new post
    .get(protect, getForumPosts);   // Get all posts

router.route('/:id')
    .get(protect, getForumPostById) // Get single post
    .put(protect, updateForumPost)  // Update a post
    .delete(protect, deleteForumPost); // Delete a post

module.exports = router;