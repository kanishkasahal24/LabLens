const crypto = require('crypto');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateDoctorCode = () => {
  return 'DOC-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileCompleted: user.profileCompleted,
      doctorCode: user.doctorCode || null
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient or doctor)
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'patient', licenseNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (role === 'doctor' && !licenseNumber) {
      return res.status(400).json({ message: 'Medical license number is required for doctor registration' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    let doctorCode = undefined;
    if (role === 'doctor') {
      let isUnique = false;
      while (!isUnique) {
        doctorCode = generateDoctorCode();
        const existingCode = await User.findOne({ doctorCode });
        if (!existingCode) isUnique = true;
      }
    }

    // Doctors start with profileCompleted = true once license is provided, or false if onboarding is required.
    // For doctors, license is saved. Let's set profileCompleted = true for doctors when licenseNumber is provided.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      profileCompleted: role === 'doctor' ? true : false,
      doctorCode
    });

    if (role === 'doctor') {
      await DoctorProfile.create({
        user: user._id,
        licenseNumber,
        specialisation: 'General Medicine',
        clinic: ''
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        doctorCode: user.doctorCode || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        doctorCode: user.doctorCode || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user details
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        doctorCode: user.doctorCode || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
