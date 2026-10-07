const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * @route   GET /api/doctors/:code
 * @desc    Get doctor public profile by doctor code
 * @access  Private (Patients)
 */
const getDoctorByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Doctor code is required' });
    }

    const doctorUser = await User.findOne({
      doctorCode: code.toUpperCase().trim(),
      role: 'doctor'
    }).select('-password');

    if (!doctorUser) {
      return res.status(404).json({ message: 'No doctor found with this unique code' });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: doctorUser._id });

    res.json({
      doctor: {
        id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        doctorCode: doctorUser.doctorCode,
        specialisation: doctorProfile?.specialisation || 'General Medicine',
        clinic: doctorProfile?.clinic || 'Private Practice'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorByCode
};
