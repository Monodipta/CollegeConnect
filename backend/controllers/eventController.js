const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const College = require('../models/College'); // For notification recipients
const Notification = require('../models/Notification'); // To create notifications

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (College only)
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, eventType, location, dateTime, contactEmail, contactPhone, registrationLink } = req.body;

    // req.college is set by the 'protect' middleware
    const organizingCollegeId = req.college._id;
    const organizingCollegeName = req.college.name;

    const event = await Event.create({
        title,
        description,
        eventType,
        location,
        dateTime,
        organizingCollege: organizingCollegeId,
        contactEmail,
        contactPhone,
        registrationLink,
    });

    if (event) {
        // --- Notification Logic ---
        // Notify all other colleges about the new event
        const allOtherColleges = await College.find({ _id: { $ne: organizingCollegeId } }).select('_id');

        const notifications = allOtherColleges.map(college => ({
            recipient: college._id,
            sender: organizingCollegeId,
            type: 'new-event',
            message: `New Event: "${title}" by ${organizingCollegeName} on ${new Date(dateTime).toLocaleDateString()}.`,
            link: `/events/${event._id}`, // Link to the new event's detail page (future)
            relatedId: event._id,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        // --- End Notification Logic ---

        res.status(201).json({
            _id: event._id,
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            location: event.location,
            dateTime: event.dateTime,
            organizingCollege: {
                _id: req.college._id,
                name: req.college.name,
                logo: req.college.logo,
            },
            createdAt: event.createdAt,
        });
    } else {
        res.status(400);
        throw new Error('Invalid event data');
    }
});

// @desc    Get all events
// @route   GET /api/events
// @access  Private (College only)
const getEvents = asyncHandler(async (req, res) => {
    // You can add query parameters for filtering by type, date range, search, pagination later
    const events = await Event.find({})
        .populate('organizingCollege', 'name logo') // Populate organizer's name and logo
        .sort({ dateTime: 1 }); // Sort by upcoming events first

    res.json(events);
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private (College only)
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('organizingCollege', 'name logo');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (College only - only organizer can update)
const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, eventType, location, dateTime, contactEmail, contactPhone, registrationLink } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
        // Check if the logged-in college is the organizer
        if (event.organizingCollege.toString() !== req.college._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this event');
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.eventType = eventType || event.eventType;
        event.location = location || event.location;
        event.dateTime = dateTime || event.dateTime; // Ensure dateTime is a valid Date object
        event.contactEmail = contactEmail; // Allow clearing optional fields
        event.contactPhone = contactPhone;
        event.registrationLink = registrationLink;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (College only - only organizer can delete)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Check if the logged-in college is the organizer
        if (event.organizingCollege.toString() !== req.college._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this event');
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
};