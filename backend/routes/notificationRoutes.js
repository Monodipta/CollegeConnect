const express = require('express');
const { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.route('/')
    .get(protect, getNotifications); // Get all notifications for logged-in college

router.route('/unread-count')
    .get(protect, getUnreadNotificationCount); // Get unread count

router.route('/:id/read')
    .put(protect, markNotificationAsRead); // Mark single notification as read

router.route('/mark-all-read')
    .put(protect, markAllNotificationsAsRead); // Mark all notifications as read

module.exports = router;