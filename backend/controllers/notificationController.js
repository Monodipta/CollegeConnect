const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get notifications for the logged-in college
// @route   GET /api/notifications
// @access  Private (College only)
const getNotifications = asyncHandler(async (req, res) => {
    // req.college is set by protect middleware
    const notifications = await Notification.find({ recipient: req.college._id })
        .sort({ createdAt: -1 }) // Newest first
        .limit(20) // Limit to latest 20 notifications for the dropdown
        .populate('sender', 'name logo'); // Populate sender college info

    res.json(notifications);
});

// @desc    Get unread notification count for the logged-in college
// @route   GET /api/notifications/unread-count
// @access  Private (College only)
const getUnreadNotificationCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ recipient: req.college._id, read: false });
    res.json({ count });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (College only)
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        // Ensure the notification belongs to the logged-in college
        if (notification.recipient.toString() !== req.college._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to mark this notification as read');
        }

        notification.read = true;
        await notification.save();
        res.json({ message: 'Notification marked as read' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all notifications as read for the logged-in college
// @route   PUT /api/notifications/mark-all-read
// @access  Private (College only)
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.college._id, read: false },
        { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
});


module.exports = {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};