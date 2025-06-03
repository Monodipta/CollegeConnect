const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        recipient: { // The college that should receive the notification
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true,
        },
        sender: { // The college/system that triggered the notification (optional)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: false, // Could be null if system-generated
        },
        type: { // Type of notification (e.g., 'new-resource', 'new-event', 'forum-reply')
            type: String,
            required: true,
            enum: [
                'new-resource',
                'resource-updated',
                'new-event',
                'event-updated',
                'forum-post',
                'forum-reply',
                'new-college',
                'custom-message'
            ],
        },
        message: { // The actual notification text
            type: String,
            required: true,
        },
        read: { // Whether the recipient has read the notification
            type: Boolean,
            default: false,
        },
        link: { // Optional URL to navigate to when clicking the notification
            type: String,
            required: false,
        },
        relatedId: { // ID of the related resource, event, or forum post
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Will be required for specific types
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;