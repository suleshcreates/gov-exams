import winston from 'winston';
import env from '../config/env';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Tell winston about the colors
winston.addColors(colors);

// Define which levels to log based on environment
const level = () => {
    const isDevelopment = env.NODE_ENV === 'development';
    return isDevelopment ? 'debug' : 'info';
};

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define transports - only console in production (Render has read-only filesystem)
const transports: winston.transport[] = [
    // Always log to console
    new winston.transports.Console(),
];

// Add file transports only in development
if (env.NODE_ENV === 'development') {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    );
}

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export default logger;
