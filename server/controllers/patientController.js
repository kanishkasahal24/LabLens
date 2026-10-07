const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Link = require('../models/Link');
const Report = require('../models/Report');

/**
 * Calculate age from date of birth
 */
const calculateAge = (dob) => {
  if (!dob) return null;
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

/**
 * @route   GET /api/patients
 * @desc    Get all linked patients for doctor with search and sorting (abnormal first)
 * @access  Private (Doctor only)
 */
const getLinkedPatients = async (req, res, next) => {
  try {
    const activeLinks = await Link.find({
      doctor: req.user.id,
      status: 'active'
    });

    const patientIds = activeLinks.map((l) => l.patient);

    const patients = await User.find({ _id: { $in: patientIds } }).select('-password');
    const profiles = await PatientProfile.find({ user: { $in: patientIds } });

    // Fetch reports for all linked patients
    const patientCards = await Promise.all(
      patients.map(async (p) => {
        const profile = profiles.find((prof) => prof.user.toString() === p._id.toString());
        const latestReport = await Report.findOne({ user: p._id }).sort({ testDate: -1 });

        let criticalCount = 0;
        if (latestReport && Array.isArray(latestReport.parameters)) {
          criticalCount = latestReport.parameters.filter(
            (param) => param.status === 'low' || param.status === 'high' || param.status === 'abnormal'
          ).length;
        }

        return {
          id: p._id,
          name: p.name,
          email: p.email,
          phone: profile?.phone || '',
          age: profile ? calculateAge(profile.dateOfBirth) : null,
          sex: profile?.sex || 'unknown',
          bloodGroup: profile?.bloodGroup || 'Unknown',
          conditions: profile?.conditions || [],
          latestReportDate: latestReport ? latestReport.testDate : null,
          latestReportStatus: latestReport ? latestReport.overallStatus : 'No Reports',
          latestHealthScore: latestReport?.healthScore !== undefined ? latestReport.healthScore : null,
          criticalCount
        };
      })
    );

    // Search filtering
    const search = req.query.search ? req.query.search.toLowerCase().trim() : '';
    let filtered = patientCards;
    if (search) {
      filtered = patientCards.filter((p) => {
        const matchName = p.name.toLowerCase().includes(search);
        const matchEmail = p.email.toLowerCase().includes(search);
        const matchCond = p.conditions.some((c) => c.toLowerCase().includes(search));
        return matchName || matchEmail || matchCond;
      });
    }

    // Sort: default abnormal first (highest critical count first, then latest report date)
    const sortBy = req.query.sort || 'abnormal_first';
    filtered.sort((a, b) => {
      if (sortBy === 'abnormal_first') {
        if (b.criticalCount !== a.criticalCount) {
          return b.criticalCount - a.criticalCount;
        }
        return new Date(b.latestReportDate || 0) - new Date(a.latestReportDate || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'date') {
        return new Date(b.latestReportDate || 0) - new Date(a.latestReportDate || 0);
      }
      return 0;
    });

    res.json({ patients: filtered });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/patients/:id
 * @desc    Get linked patient profile by ID
 * @access  Private (Doctor only)
 */
const getPatientDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify active link
    const activeLink = await Link.findOne({
      doctor: req.user.id,
      patient: id,
      status: 'active'
    });

    if (!activeLink) {
      return res.status(403).json({ message: 'Access denied: Patient is not linked with you' });
    }

    const patientUser = await User.findById(id).select('-password');
    if (!patientUser) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const profile = await PatientProfile.findOne({ user: id });

    res.json({
      patient: {
        id: patientUser._id,
        name: patientUser.name,
        email: patientUser.email,
        profile: profile ? {
          ...profile.toObject(),
          age: calculateAge(profile.dateOfBirth)
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/patients/:id/reports
 * @desc    Get reports for linked patient
 * @access  Private (Doctor only)
 */
const getPatientReports = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activeLink = await Link.findOne({
      doctor: req.user.id,
      patient: id,
      status: 'active'
    });

    if (!activeLink) {
      return res.status(403).json({ message: 'Access denied: Patient is not linked with you' });
    }

    const reports = await Report.find({ user: id }).sort({ testDate: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/patients/:id/trends
 * @desc    Get trends for linked patient
 * @access  Private (Doctor only)
 */
const getPatientTrends = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activeLink = await Link.findOne({
      doctor: req.user.id,
      patient: id,
      status: 'active'
    });

    if (!activeLink) {
      return res.status(403).json({ message: 'Access denied: Patient is not linked with you' });
    }

    const reports = await Report.find({ user: id }).sort({ testDate: 1 });

    const parameterMap = {};
    reports.forEach((report) => {
      report.parameters.forEach((param) => {
        const paramName = param.name.trim();
        if (!parameterMap[paramName]) {
          parameterMap[paramName] = [];
        }
        parameterMap[paramName].push({
          reportId: report._id,
          date: report.testDate,
          formattedDate: new Date(report.testDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          labName: report.labName,
          value: param.value,
          unit: param.unit,
          normalRangeLow: param.normalRangeLow,
          normalRangeHigh: param.normalRangeHigh,
          status: param.status
        });
      });
    });

    res.json({
      parameterNames: Object.keys(parameterMap).sort(),
      trends: parameterMap
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLinkedPatients,
  getPatientDetail,
  getPatientReports,
  getPatientTrends
};
