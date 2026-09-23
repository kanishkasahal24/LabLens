const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Report = require('./models/Report');
const { getParameterStatus } = require('./utils/parameterStatus');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing demo data...');
    const demoEmail = 'demo@lablens.com';
    const existingUser = await User.findOne({ email: demoEmail });

    if (existingUser) {
      await Report.deleteMany({ user: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    console.log('Creating demo user...');
    const demoUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: demoEmail,
      password: 'Password123!'
    });

    console.log(`Demo user created: ${demoUser.email} / Password123!`);

    // Helper to evaluate parameters
    const buildParameters = (params) => {
      return params.map((p) => {
        const status = getParameterStatus(p.value, p.normalRangeLow, p.normalRangeHigh);
        return {
          ...p,
          status
        };
      });
    };

    const reportsData = [
      {
        labName: 'Quest Diagnostics Labs',
        testDate: new Date('2026-01-15T09:30:00Z'),
        notes: 'Annual routine health checkup. Fasted for 12 hours.',
        parameters: buildParameters([
          { name: 'Hemoglobin', value: 13.8, unit: 'g/dL', normalRangeLow: 12.0, normalRangeHigh: 15.5 },
          { name: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 },
          { name: 'Total Cholesterol', value: 185, unit: 'mg/dL', normalRangeLow: 125, normalRangeHigh: 200 },
          { name: 'WBC Count', value: 6.4, unit: 'x10^3/µL', normalRangeLow: 4.5, normalRangeHigh: 11.0 },
          { name: 'Creatinine', value: 0.9, unit: 'mg/dL', normalRangeLow: 0.6, normalRangeHigh: 1.2 },
          { name: 'Platelet Count', value: 240, unit: 'x10^3/µL', normalRangeLow: 150, normalRangeHigh: 450 },
          { name: 'Serum Calcium', value: 9.4, unit: 'mg/dL', normalRangeLow: 8.5, normalRangeHigh: 10.2 }
        ])
      },
      {
        labName: 'Metropolis Healthcare & Diagnostics',
        testDate: new Date('2026-03-22T08:15:00Z'),
        notes: 'Follow-up panel post-dietary adjustment.',
        parameters: buildParameters([
          { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', normalRangeLow: 12.0, normalRangeHigh: 15.5 },
          { name: 'Fasting Blood Sugar', value: 106, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 }, // Mild High
          { name: 'Total Cholesterol', value: 215, unit: 'mg/dL', normalRangeLow: 125, normalRangeHigh: 200 }, // High
          { name: 'WBC Count', value: 7.1, unit: 'x10^3/µL', normalRangeLow: 4.5, normalRangeHigh: 11.0 },
          { name: 'Creatinine', value: 1.0, unit: 'mg/dL', normalRangeLow: 0.6, normalRangeHigh: 1.2 },
          { name: 'Platelet Count', value: 255, unit: 'x10^3/µL', normalRangeLow: 150, normalRangeHigh: 450 },
          { name: 'Serum Calcium', value: 9.6, unit: 'mg/dL', normalRangeLow: 8.5, normalRangeHigh: 10.2 }
        ])
      },
      {
        labName: 'LabCorp Medical Center',
        testDate: new Date('2026-06-10T10:00:00Z'),
        notes: 'Mid-year comprehensive metabolic and lipid panel.',
        parameters: buildParameters([
          { name: 'Hemoglobin', value: 14.0, unit: 'g/dL', normalRangeLow: 12.0, normalRangeHigh: 15.5 },
          { name: 'Fasting Blood Sugar', value: 98, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 },
          { name: 'Total Cholesterol', value: 192, unit: 'mg/dL', normalRangeLow: 125, normalRangeHigh: 200 },
          { name: 'WBC Count', value: 5.8, unit: 'x10^3/µL', normalRangeLow: 4.5, normalRangeHigh: 11.0 },
          { name: 'Creatinine', value: 0.85, unit: 'mg/dL', normalRangeLow: 0.6, normalRangeHigh: 1.2 },
          { name: 'Platelet Count', value: 230, unit: 'x10^3/µL', normalRangeLow: 150, normalRangeHigh: 450 },
          { name: 'Serum Calcium', value: 9.3, unit: 'mg/dL', normalRangeLow: 8.5, normalRangeHigh: 10.2 }
        ])
      },
      {
        labName: 'Apex Health Pathology Lab',
        testDate: new Date('2026-09-01T07:45:00Z'),
        notes: 'Recent full blood count and renal profile.',
        parameters: buildParameters([
          { name: 'Hemoglobin', value: 14.6, unit: 'g/dL', normalRangeLow: 12.0, normalRangeHigh: 15.5 },
          { name: 'Fasting Blood Sugar', value: 94, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 },
          { name: 'Total Cholesterol', value: 178, unit: 'mg/dL', normalRangeLow: 125, normalRangeHigh: 200 },
          { name: 'WBC Count', value: 6.8, unit: 'x10^3/µL', normalRangeLow: 4.5, normalRangeHigh: 11.0 },
          { name: 'Creatinine', value: 0.92, unit: 'mg/dL', normalRangeLow: 0.6, normalRangeHigh: 1.2 },
          { name: 'Platelet Count', value: 260, unit: 'x10^3/µL', normalRangeLow: 150, normalRangeHigh: 450 },
          { name: 'Serum Calcium', value: 9.5, unit: 'mg/dL', normalRangeLow: 8.5, normalRangeHigh: 10.2 }
        ])
      }
    ];

    for (const reportItem of reportsData) {
      const hasAbnormal = reportItem.parameters.some((p) => p.status === 'low' || p.status === 'high');
      await Report.create({
        user: demoUser._id,
        labName: reportItem.labName,
        testDate: reportItem.testDate,
        notes: reportItem.notes,
        overallStatus: hasAbnormal ? 'Abnormal' : 'Normal',
        parameters: reportItem.parameters
      });
    }

    console.log(`Successfully seeded 4 blood reports for ${demoUser.email}!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
