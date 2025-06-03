const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
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
        eventType: { // e.g., 'Workshop', 'Seminar', 'Cultural Fest', 'Sports Event', 'Webinar'
            type: String,
            required: true,
            enum: ['Workshop', 'Seminar', 'Cultural Fest', 'Sports Event', 'Webinar', 'Conference', 'Other'],
        },
        location: { // Physical address or online link
            type: String,
            required: true,
            trim: true,
        },
        dateTime: { // Date and time of the event
            type: Date,
            required: true,
        },
        organizingCollege: { // Reference to the College that organized it
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true,
        },
        contactEmail: {
            type: String,
            required: false, // Optional if general college email is used
            match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email validation
        },
        contactPhone: {
            type: String,
            required: false, // Optional
        },
        registrationLink: { // Link for event registration
            type: String,
            required: false,
            validate: {
                validator: function(v) {
                    return /^https?:\/\//.test(v); // Basic URL validation
                },
                message: props => `${props.value} is not a valid URL!`
            }
        },
        // You can add fields for attendees, event image, etc. later
        // eventImage: { type: String, default: '/uploads/default_event_image.png' },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;