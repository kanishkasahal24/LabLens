const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'app.log');

// Ensure logs directory exists asynchronously if needed
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Express middleware to asynchronously log every incoming request to logs/app.log.
 * Uses non-blocking fs.appendFile API.
 */
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${req.method} ${req.originalUrl || req.url}\n`;

  fs.appendFile(logFilePath, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Failed to append request log:', err.message);
    }
  });

  next();
};

module.exports = loggerMiddleware;
