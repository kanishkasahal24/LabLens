const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'app.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Express middleware to asynchronously log incoming requests safely to logs/app.log.
 * NEVER logs request bodies containing report data, medical information, or profile details.
 */
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  // Strictly log HTTP method, URL path, and IP address. NEVER log request body.
  const logEntry = `[${timestamp}] ${req.method} ${req.originalUrl || req.url} - IP: ${req.ip || '127.0.0.1'}\n`;

  fs.appendFile(logFilePath, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Failed to append request log:', err.message);
    }
  });

  next();
};

module.exports = loggerMiddleware;
