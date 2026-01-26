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
    })
    .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/interviews', require('./routes/interviews'));

app.get('/', (req, res) => {
    res.json({
        status: 'AI Interview Simulator API Running',
        version: '2.0.0',
        endpoints: [
            '/api/users',
            '/api/interviews'
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
