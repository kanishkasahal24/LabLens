const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parameter name is required'],
      trim: true
    },
    panel: {
      type: String,
      trim: true,
      default: 'General'
    },
    resultType: {
      type: String,
      enum: ['numeric', 'text'],
      default: 'numeric'
    },
    value: {
      type: Number,
      default: null
    },
    textValue: {
      type: String,
      trim: true,
      default: ''
    },
    unit: {
      type: String,
      trim: true,
      default: ''
    },
    normalRangeLow: {
      type: Number,
      default: null
    },
    normalRangeHigh: {
      type: Number,
      default: null
    },
    referenceText: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['normal', 'low', 'high', 'abnormal'],
      default: 'normal'
    },
    severity: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'marked'],
      default: 'none'
    }
  },
  { _id: true }
);

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    labName: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true
    },
    testDate: {
      type: Date,
      required: [true, 'Test date is required'],
      default: Date.now
    },
    collectionDate: {
      type: Date,
      default: Date.now
    },
    sampleType: {
      type: String,
      trim: true,
      default: 'Venous Blood'
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    overallStatus: {
      type: String,
      enum: ['Normal', 'Abnormal'],
      default: 'Normal'
    },
    parameters: [parameterSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);
