const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    sex: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Biological sex is required']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    heightCm: {
      type: Number,
      required: [true, 'Height in cm is required'],
      min: [30, 'Height must be at least 30 cm'],
      max: [300, 'Height must be at most 300 cm']
    },
    weightKg: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: [2, 'Weight must be at least 2 kg'],
      max: [500, 'Weight must be at most 500 kg']
    },
    waistCm: {
      type: Number,
      min: 0
    },
    hipCm: {
      type: Number,
      min: 0
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
      default: 'Unknown'
    },
    physicalActivity: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'sedentary'
    },
    smoking: {
      type: String,
      enum: ['never', 'former', 'current'],
      default: 'never'
    },
    alcohol: {
      type: String,
      enum: ['never', 'occasional', 'moderate', 'heavy'],
      default: 'never'
    },
    foodPreference: {
      type: String,
      enum: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
      default: 'vegetarian'
    },
    medications: {
      type: String,
      trim: true,
      default: ''
    },
    conditions: [
      {
        type: String,
        trim: true
      }
    ],
    familyHistory: {
      type: String,
      trim: true,
      default: ''
    },
    allergies: {
      type: String,
      trim: true,
      default: ''
    },
    pregnant: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
