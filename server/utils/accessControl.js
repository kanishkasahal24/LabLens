const Link = require('../models/Link');

/**
 * Helper to check if a user can access a specific report.
 * Access granted if:
 * 1. User is patient and owns the report
 * 2. User is doctor and has an ACTIVE link to report.user (the patient)
 */
const canAccessReport = async (user, report) => {
  if (!user || !report) return false;

  const reportUserId = report.user._id ? report.user._id.toString() : report.user.toString();
  const currentUserId = user.id.toString();

  // Patient owns report
  if (user.role === 'patient' && reportUserId === currentUserId) {
    return true;
  }

  // Doctor has active link to patient
  if (user.role === 'doctor') {
    const activeLink = await Link.findOne({
      doctor: currentUserId,
      patient: reportUserId,
      status: 'active'
    });
    return !!activeLink;
  }

  return false;
};

module.exports = {
  canAccessReport
};
