const mongoose = require('mongoose');

const parameterReferenceSchema = new mongoose.Schema(
  {
    canonicalName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    aliases: [
      {
        type: String,
        trim: true
      }
    ],
    unit: {
      type: String,
      trim: true,
      default: ''
    },
    panel: {
      type: String,
      required: true,
      trim: true
    },
    bodySystem: {
      type: String,
      required: true,
      trim: true
    },
    resultType: {
      type: String,
      enum: ['numeric', 'text'],
      default: 'numeric'
    },
    defaultRange: {
      low: { type: Number, default: null },
      high: { type: Number, default: null },
      referenceText: { type: String, default: '' }
    },
    genderRanges: {
      male: {
        low: { type: Number, default: null },
        high: { type: Number, default: null }
      },
      female: {
        low: { type: Number, default: null },
        high: { type: Number, default: null }
      }
    },
    impact: {
      type: String,
      default: ''
    },
    howToImprove: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ParameterReference', parameterReferenceSchema);
