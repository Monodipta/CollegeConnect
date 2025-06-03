const express = require('express');
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for events
router.route('/')
    .post(protect, createEvent) // Create new event
    .get(protect, getEvents);   // Get all events

router.route('/:id')
    .get(protect, getEventById) // Get single event
    .put(protect, updateEvent)  // Update an event
    .delete(protect, deleteEvent); // Delete an event

module.exports = router;