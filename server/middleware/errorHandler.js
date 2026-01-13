const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.auth?.userId
    });

    // Don't leak error details in production
    const isDev = process.env.NODE_ENV === 'development';

    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Internal server error',
        ...(isDev && { stack: err.stack })
    });
};

// Not found handler
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Route not found' });
};

module.exports = { errorHandler, notFoundHandler, logger };
