require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { errorHandler, notFoundHandler, logger } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Create necessary directories
const dirs = ['uploads', 'logs'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info('MongoDB connected');

        // Start background scheduler
        const scheduler = require('./services/scheduler');
        scheduler.start();
        logger.info('Background scheduler started');

        // Initialize proactive recommendation engine
        require('./services/proactiveEngine');
        logger.info('Proactive AI engine initialized');
    })
    .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/preferences', require('./routes/preferences'));

app.get('/', (req, res) => {
    res.json({
        status: 'AI Automation Platform API Running',
        version: '1.0.0',
        endpoints: [
            '/api/users',
            '/api/agents',
            '/api/interviews',
            '/api/emails',
            '/api/calendar',
            '/api/recommendations',
            '/api/activity',
            '/api/insights'
        ]
    });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
