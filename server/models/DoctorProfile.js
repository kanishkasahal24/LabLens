const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required'],
      trim: true
    },
    specialisation: {
      type: String,
      trim: true,
      default: 'General Medicine'
    },
    clinic: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
