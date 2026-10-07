const mongoose = require('mongoose');
const { seedInitialData } = require('../seedData');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn('================================================================');
      console.warn('[DEV WARNING] No MONGODB_URI specified in environment variables.');
      console.warn('Starting temporary in-memory MongoDB instance for development...');
      console.warn('Data will NOT persist across server restarts.');
      console.warn('================================================================');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed initial demo accounts & references if DB is empty
    await seedInitialData();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
