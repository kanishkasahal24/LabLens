const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parameter name is required'],
      trim: true
    },
    value: {
      type: Number,
      required: [true, 'Parameter numerical value is required']
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
    status: {
      type: String,
      enum: ['normal', 'low', 'high'],
      default: 'normal'
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
