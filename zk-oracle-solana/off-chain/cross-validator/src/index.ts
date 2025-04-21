/**
 * Cross-Validator Service
 * Main entry point for the Cross-Validation system
 */

import express from 'express';
import dotenv from 'dotenv';
import winston from 'winston';
import { CrossValidator } from './services/crossValidator';
import { configureRoutes } from './routes';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize Cross-Validator Service
const crossValidator = new CrossValidator(logger);

// Initialize Express app
const app = express();
app.use(express.json());

// Configure routes
configureRoutes(app, crossValidator, logger);

// Start server
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
  logger.info(`Cross-Validator Service running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down service...');
  // Close database connections, cleanup resources, etc.
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down service...');
  // Close database connections, cleanup resources, etc.
  process.exit(0);
});

export { app };
