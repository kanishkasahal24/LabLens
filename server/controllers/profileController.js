const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile (Patient or Doctor)
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const role = req.user.role;
    let profile = null;

    if (role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: req.user.id }).populate('user', 'name email role doctorCode');
    } else {
      profile = await PatientProfile.findOne({ user: req.user.id }).populate('user', 'name email role profileCompleted');
    }

    res.json({
      role,
      profileCompleted: req.user.profileCompleted,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Create or update profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'doctor') {
      const { specialisation, clinic, licenseNumber } = req.body;
      let doctorProf = await DoctorProfile.findOne({ user: req.user.id });

      if (!doctorProf) {
        doctorProf = new DoctorProfile({
          user: req.user.id,
          licenseNumber: licenseNumber || 'MD-PENDING',
          specialisation,
          clinic
        });
      } else {
        if (specialisation !== undefined) doctorProf.specialisation = specialisation;
        if (clinic !== undefined) doctorProf.clinic = clinic;
        if (licenseNumber !== undefined) doctorProf.licenseNumber = licenseNumber;
      }

      await doctorProf.save();
      await User.findByIdAndUpdate(req.user.id, { profileCompleted: true });

      const updatedProf = await DoctorProfile.findOne({ user: req.user.id }).populate('user', 'name email role doctorCode');
      return res.json({ message: 'Doctor profile updated successfully', profile: updatedProf, profileCompleted: true });
    }

    // Patient Role
    const {
      fullName,
      dateOfBirth,
      sex,
      phone,
      heightCm,
      weightKg,
      waistCm,
      hipCm,
      bloodGroup,
      physicalActivity,
      smoking,
      alcohol,
      foodPreference,
      medications,
      conditions,
      familyHistory,
      allergies,
      pregnant
    } = req.body;

    // Validation checks
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!dateOfBirth) {
      return res.status(400).json({ message: 'Date of birth is required' });
    }

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    if (!sex || !['male', 'female', 'other'].includes(sex)) {
      return res.status(400).json({ message: 'Valid biological sex is required' });
    }

    const parsedHeight = Number(heightCm);
    if (isNaN(parsedHeight) || parsedHeight < 30 || parsedHeight > 300) {
      return res.status(400).json({ message: 'Height must be between 30 cm and 300 cm' });
    }

    const parsedWeight = Number(weightKg);
    if (isNaN(parsedWeight) || parsedWeight < 2 || parsedWeight > 500) {
      return res.status(400).json({ message: 'Weight must be between 2 kg and 500 kg' });
    }

    let patientProf = await PatientProfile.findOne({ user: req.user.id });

    const profileData = {
      user: req.user.id,
      fullName: fullName.trim(),
      dateOfBirth: dob,
      sex,
      phone: phone ? phone.trim() : '',
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      waistCm: waistCm ? Number(waistCm) : undefined,
      hipCm: hipCm ? Number(hipCm) : undefined,
      bloodGroup: bloodGroup || 'Unknown',
      physicalActivity: physicalActivity || 'sedentary',
      smoking: smoking || 'never',
      alcohol: alcohol || 'never',
      foodPreference: foodPreference || 'vegetarian',
      medications: medications ? medications.trim() : '',
      conditions: Array.isArray(conditions) ? conditions : typeof conditions === 'string' ? conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      familyHistory: familyHistory ? familyHistory.trim() : '',
      allergies: allergies ? allergies.trim() : '',
      pregnant: sex === 'female' ? Boolean(pregnant) : false
    };

    if (!patientProf) {
      patientProf = await PatientProfile.create(profileData);
    } else {
      Object.assign(patientProf, profileData);
      await patientProf.save();
    }

    // Mark User profileCompleted = true
    await User.findByIdAndUpdate(req.user.id, { profileCompleted: true });

    const updatedProfile = await PatientProfile.findOne({ user: req.user.id }).populate('user', 'name email role profileCompleted');

    res.json({
      message: 'Patient profile updated successfully',
      profile: updatedProfile,
      profileCompleted: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
