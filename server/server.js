const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const profileRoutes = require('./routes/profile');
const doctorRoutes = require('./routes/doctors');
const linkRoutes = require('./routes/links');
const patientRoutes = require('./routes/patients');

const app = express();

// Connect to MongoDB database
connectDB();

// CORS configuration - restrict to CLIENT_URL
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true
}));

app.use(express.json());

// Custom non-blocking async file logging middleware
app.use(loggerMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/patients', patientRoutes);

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
