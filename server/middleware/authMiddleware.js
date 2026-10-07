const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to protect routes via JWT verification.
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name, role, profileCompleted, doctorCode }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

/**
 * Middleware to restrict access based on user role(s)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: forbidden role' });
    }
    next();
  };
};

/**
 * Middleware to block patients who have not completed their details profile
 */
const requireProfile = (req, res, next) => {
  if (req.user && req.user.role === 'patient' && !req.user.profileCompleted) {
    return res.status(403).json({
      message: 'Patient profile incomplete. Please complete your profile first.',
      code: 'PROFILE_INCOMPLETE'
    });
  }
  next();
};

module.exports = { protect, requireRole, requireProfile, JWT_SECRET };
