const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');
const PatientProfile = require('./models/PatientProfile');
const Link = require('./models/Link');
const Report = require('./models/Report');
const { getParameterStatus, getSeverity } = require('./utils/parameterStatus');
const { calculateHealthScore } = require('./utils/analysisEngine');
const { seedParameterReferences } = require('./seedReferences');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Already seeded!

    console.log('Auto-seeding demo database accounts and clinical data...');
    await seedParameterReferences();

    const doctorUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'dr.jenkins@lablens.com',
      password: 'Password123!',
      role: 'doctor',
      profileCompleted: true,
      doctorCode: 'DOC-DEMO1'
    });

    await DoctorProfile.create({
      user: doctorUser._id,
      licenseNumber: 'MD-98765',
      specialisation: 'Cardiology & Internal Medicine',
      clinic: 'Metropolis Health Center'
    });

    const patient1User = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'patient',
      profileCompleted: true
    });

    await PatientProfile.create({
      user: patient1User._id,
      fullName: 'John Doe',
      dateOfBirth: new Date('1985-05-15'),
      sex: 'male',
      phone: '+1-555-0142',
      heightCm: 178,
      weightKg: 82,
      waistCm: 92,
      hipCm: 98,
      bloodGroup: 'O+',
      physicalActivity: 'light',
      smoking: 'former',
      alcohol: 'occasional',
      foodPreference: 'non_vegetarian',
      medications: 'Atorvastatin 10mg daily',
      conditions: ['Mild Hypertension', 'Hyperlipidemia'],
      familyHistory: 'Father had Type 2 Diabetes',
      allergies: 'Penicillin'
    });

    const patient2User = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password123!',
      role: 'patient',
      profileCompleted: true
    });

    await PatientProfile.create({
      user: patient2User._id,
      fullName: 'Jane Smith',
      dateOfBirth: new Date('1992-09-20'),
      sex: 'female',
      phone: '+1-555-0189',
      heightCm: 165,
      weightKg: 60,
      waistCm: 74,
      hipCm: 90,
      bloodGroup: 'A+',
      physicalActivity: 'moderate',
      smoking: 'never',
      alcohol: 'never',
      foodPreference: 'vegetarian',
      medications: 'Thyroxin 25mcg',
      conditions: ['Hypothyroidism'],
      familyHistory: 'None',
      allergies: 'None'
    });

    await Link.create({
      doctor: doctorUser._id,
      patient: patient1User._id,
      status: 'active'
    });

    await Link.create({
      doctor: doctorUser._id,
      patient: patient2User._id,
      status: 'active'
    });

    const buildParameters = (params) => {
      return params.map((p) => {
        const resultType = p.resultType || 'numeric';
        const status = getParameterStatus(p.value, p.normalRangeLow, p.normalRangeHigh, resultType, p.textValue, p.referenceText);
        const severity = getSeverity(p.value, p.normalRangeLow, p.normalRangeHigh, status, resultType, p.textValue);
        return {
          ...p,
          panel: p.panel || 'General',
          resultType,
          status,
          severity
        };
      });
    };

    const patient1Reports = [
      {
        labName: 'Quest Diagnostics Labs',
        testDate: new Date('2026-01-15T09:30:00Z'),
        collectionDate: new Date('2026-01-15T07:30:00Z'),
        notes: 'Annual routine health checkup. Fasted for 12 hours.',
        parameters: buildParameters([
          { name: 'Hemoglobin', panel: 'CBC with Differential', bodySystem: 'cbc', value: 13.8, unit: 'g/dL', normalRangeLow: 13.5, normalRangeHigh: 17.5 },
          { name: 'Fasting Blood Sugar', panel: 'Glucose & HbA1c', bodySystem: 'hba1c', value: 92, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 },
          { name: 'Total Cholesterol', panel: 'Lipid Profile', bodySystem: 'cholesterol', value: 185, unit: 'mg/dL', normalRangeLow: 125, normalRangeHigh: 200 },
          { name: 'WBC Count', panel: 'CBC with Differential', bodySystem: 'cbc', value: 6.4, unit: 'x10^3/uL', normalRangeLow: 4.5, normalRangeHigh: 11.0 },
          { name: 'Serum Creatinine', panel: 'Kidney Function', bodySystem: 'kidney', value: 0.9, unit: 'mg/dL', normalRangeLow: 0.7, normalRangeHigh: 1.3 },
          { name: 'Platelet Count', panel: 'CBC with Differential', bodySystem: 'cbc', value: 240, unit: 'x10^3/uL', normalRangeLow: 150, normalRangeHigh: 450 }
        ])
      },
      {
        labName: 'Metropolis Healthcare & Diagnostics',
        testDate: new Date('2026-03-22T08:15:00Z'),
        collectionDate: new Date('2026-03-22T07:00:00Z'),
        notes: 'Follow-up panel post-dietary adjustment.',
        parameters: buildParameters([
          { name: 'Hemoglobin', panel: 'CBC with Differential', bodySystem: 'cbc', value: 14.2, unit: 'g/dL', normalRangeLow: 13.5, normalRangeHigh: 17.5 },
          { name: 'Fasting Blood Sugar', panel: 'Glucose & HbA1c', bodySystem: 'hba1c', value: 108, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 },
          { name: 'Total Cholesterol', panel: 'Lipid Profile', bodySystem: 'cholesterol', value: 245, unit: 'mg/dL', normalRangeLow: 125, normalRangeHigh: 200 },
          { name: 'Triglycerides', panel: 'Lipid Profile', bodySystem: 'cholesterol', value: 195, unit: 'mg/dL', normalRangeLow: 40, normalRangeHigh: 150 },
          { name: 'Serum Creatinine', panel: 'Kidney Function', bodySystem: 'kidney', value: 1.0, unit: 'mg/dL', normalRangeLow: 0.7, normalRangeHigh: 1.3 }
        ])
      }
    ];

    for (const reportItem of patient1Reports) {
      const { healthScore } = calculateHealthScore(reportItem.parameters);
      const hasAbnormal = reportItem.parameters.some((p) => p.status !== 'normal');

      await Report.create({
        user: patient1User._id,
        labName: reportItem.labName,
        testDate: reportItem.testDate,
        collectionDate: reportItem.collectionDate,
        notes: reportItem.notes,
        overallStatus: hasAbnormal ? 'Abnormal' : 'Normal',
        healthScore,
        parameters: reportItem.parameters
      });
    }

    const patient2Reports = [
      {
        labName: 'Apex Health Pathology Lab',
        testDate: new Date('2026-02-10T08:00:00Z'),
        collectionDate: new Date('2026-02-10T07:15:00Z'),
        notes: 'Thyroid function screening.',
        parameters: buildParameters([
          { name: 'Thyroid Stimulating Hormone (TSH)', panel: 'Thyroid Panel', bodySystem: 'thyroid', value: 5.6, unit: 'uIU/mL', normalRangeLow: 0.4, normalRangeHigh: 4.0 },
          { name: 'Hemoglobin', panel: 'CBC with Differential', bodySystem: 'cbc', value: 12.1, unit: 'g/dL', normalRangeLow: 12.0, normalRangeHigh: 15.5 },
          { name: 'Fasting Blood Sugar', panel: 'Glucose & HbA1c', bodySystem: 'hba1c', value: 88, unit: 'mg/dL', normalRangeLow: 70, normalRangeHigh: 99 },
          { name: 'Urine Protein', panel: 'Urine Routine', bodySystem: 'kidney', resultType: 'text', textValue: 'Trace', referenceText: 'Negative' }
        ])
      }
    ];

    for (const reportItem of patient2Reports) {
      const { healthScore } = calculateHealthScore(reportItem.parameters);
      const hasAbnormal = reportItem.parameters.some((p) => p.status !== 'normal');

      await Report.create({
        user: patient2User._id,
        labName: reportItem.labName,
        testDate: reportItem.testDate,
        collectionDate: reportItem.collectionDate,
        notes: reportItem.notes,
        overallStatus: hasAbnormal ? 'Abnormal' : 'Normal',
        healthScore,
        parameters: reportItem.parameters
      });
    }

    console.log('Database auto-seeded successfully!');
  } catch (err) {
    console.error('Error auto-seeding data:', err);
  }
};

module.exports = { seedInitialData };
