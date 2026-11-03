
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function showDatabase() {
  try {
    // Make sure we connect to Atlas, not temporary memory
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from your .env file!');
    }

    await connectDB();

    const db = mongoose.connection.db;

    console.log('\n====================================');
    console.log('       LIVE MONGODB DATABASE');
    console.log('====================================');

    console.log('Database Name:', db.databaseName);

    // Get all collections
    const collections = await db.listCollections().toArray();

    console.log('\nTotal Collections:', collections.length);

    for (const collection of collections) {
      console.log('\n------------------------------------');
      console.log('Collection:', collection.name);
      console.log('------------------------------------');

      // Display first 5 actual records
      const records = await db
        .collection(collection.name)
        .find({})
        .limit(5)
        .toArray();

      console.log('Records found:', records.length);

      records.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(JSON.stringify(record, null, 2));
      });
    }

    console.log('\n====================================');
    console.log('DATABASE DISPLAY COMPLETED');
    console.log('====================================');

  } catch (error) {
    console.error('Database Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

showDatabase();
