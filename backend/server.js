require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes'); // NEW: Import college routes
const resourceRoutes = require('./routes/resourceRoutes');     // NEW: Import resource routes
const notificationRoutes = require('./routes/notificationRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const forumRoutes = require('./routes/forumRoutes');

const path = require('path');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/uploads/resources', express.static(path.join(__dirname, 'uploads', 'resources')));

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes); // NEW: Mount college routes
app.use('/api/resources', resourceRoutes);         // NEW: Mount resource routes
app.use('/api/notifications', notificationRoutes); // NEW: Mount notification routes
app.use('/api/events', eventRoutes);
app.use('/api/forum', forumRoutes);

// Basic route to check if server is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));