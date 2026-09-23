const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lablens_secret_key_jwt_2026_clinical';

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
    req.user = decoded; // { id, email, name }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

module.exports = { protect, JWT_SECRET };
