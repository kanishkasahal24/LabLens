const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Custom non-blocking async file logging middleware
app.use(loggerMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LabLens API', timestamp: new Date() });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LabLens Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
