const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'revoked'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index on doctor and patient
linkSchema.index({ doctor: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('Link', linkSchema);
