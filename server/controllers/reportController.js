const Report = require('../models/Report');
const Link = require('../models/Link');
const PatientProfile = require('../models/PatientProfile');
const ParameterReference = require('../models/ParameterReference');
const { getParameterStatus, getSeverity, getRangeForAgeSex } = require('../utils/parameterStatus');
const { canAccessReport } = require('../utils/accessControl');
const {
  calculateHealthScore,
  getVitalsGrid,
  getCriticalParameters,
  getRuleBasedAdvisory
} = require('../utils/analysisEngine');

/**
 * Calculate age helper
 */
const calculateAge = (dob) => {
  if (!dob) return null;
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

/**
 * @route   GET /api/reports
 * @desc    Get reports (for logged in patient or doctor specifying patientId query)
 * @access  Private
 */
const getReports = async (req, res, next) => {
  try {
    let targetUserId = req.user.id;

    if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required for doctor access' });
      }

      const activeLink = await Link.findOne({
        doctor: req.user.id,
        patient: patientId,
        status: 'active'
      });

      if (!activeLink) {
        return res.status(403).json({ message: 'Access denied: Patient is not linked with you' });
      }

      targetUserId = patientId;
    }

    const reports = await Report.find({ user: targetUserId }).sort({ testDate: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id
 * @desc    Get a single report by ID
 * @access  Private
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const hasAccess = await canAccessReport(req.user, report);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Not authorized to view this blood report' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id/analysis
 * @desc    Get smart report analysis (score breakdown, vitals grid, critical cards, panel grouping, advisory)
 * @access  Private
 */
const getReportAnalysis = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'name email role');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const hasAccess = await canAccessReport(req.user, report);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this report analysis' });
    }

    // Fetch patient profile
    const patientProfile = await PatientProfile.findOne({ user: report.user._id });
    const age = patientProfile ? calculateAge(patientProfile.dateOfBirth) : null;
    const sex = patientProfile?.sex || 'male';

    // Fetch all parameter references
    const references = await ParameterReference.find({});
    const paramRefMap = {};
    references.forEach((ref) => {
      paramRefMap[ref.canonicalName] = ref;
      if (Array.isArray(ref.aliases)) {
        ref.aliases.forEach((alias) => {
          paramRefMap[alias] = ref;
        });
      }
    });

    // Enhance report parameters with severity, bodySystem, impact, and howToImprove
    const enhancedParameters = report.parameters.map((p) => {
      const ref = paramRefMap[p.name];
      const bodySystem = ref?.bodySystem || p.bodySystem || 'general';
      const status = p.status || getParameterStatus(p.value, p.normalRangeLow, p.normalRangeHigh, p.resultType, p.textValue, p.referenceText);
      const severity = p.severity && p.severity !== 'none'
        ? p.severity
        : getSeverity(p.value, p.normalRangeLow, p.normalRangeHigh, status, p.resultType, p.textValue);

      return {
        _id: p._id,
        name: p.name,
        panel: p.panel || ref?.panel || 'General',
        bodySystem,
        resultType: p.resultType || 'numeric',
        value: p.value,
        textValue: p.textValue || '',
        unit: p.unit || ref?.unit || '',
        normalRangeLow: p.normalRangeLow,
        normalRangeHigh: p.normalRangeHigh,
        referenceText: p.referenceText || ref?.defaultRange?.referenceText || '',
        status,
        severity,
        impact: ref?.impact || '',
        howToImprove: ref?.howToImprove || ''
      };
    });

    // 1. Calculate Health Score
    const { healthScore, breakdown } = calculateHealthScore(enhancedParameters);

    // 2. Build 10-system Vitals Grid
    const vitalsGrid = getVitalsGrid(enhancedParameters);

    // 3. Extract Critical Parameters sorted by severity
    const criticalParameters = getCriticalParameters(enhancedParameters, paramRefMap);

    // 4. Group parameters by panel
    const panelResults = {};
    enhancedParameters.forEach((param) => {
      const panelName = param.panel || 'General';
      if (!panelResults[panelName]) {
        panelResults[panelName] = [];
      }
      panelResults[panelName].push(param);
    });

    // 5. Build static rule-based advisory
    const advisory = getRuleBasedAdvisory(patientProfile, criticalParameters, vitalsGrid);

    // 6. Find previous report for comparison
    const previousReport = await Report.findOne({
      user: report.user._id,
      testDate: { $lt: report.testDate }
    }).sort({ testDate: -1 });

    const previousComparison = {};
    if (previousReport && Array.isArray(previousReport.parameters)) {
      report.parameters.forEach((currParam) => {
        const prevParam = previousReport.parameters.find(
          (prev) => prev.name.toLowerCase() === currParam.name.toLowerCase()
        );
        if (prevParam && currParam.value !== null && prevParam.value !== null) {
          const diff = currParam.value - prevParam.value;
          let changeDirection = 'same';
          if (diff > 0) changeDirection = 'increased';
          if (diff < 0) changeDirection = 'decreased';

          previousComparison[currParam.name] = {
            previousValue: prevParam.value,
            currentValue: currParam.value,
            diff: Number(diff.toFixed(2)),
            changeDirection,
            arrow: changeDirection === 'increased' ? '↑' : changeDirection === 'decreased' ? '↓' : '→'
          };
        }
      });
    }

    res.json({
      report: {
        id: report._id,
        labName: report.labName,
        testDate: report.testDate,
        collectionDate: report.collectionDate || report.testDate,
        sampleType: report.sampleType || 'Venous Blood',
        notes: report.notes,
        overallStatus: report.overallStatus,
        healthScore
      },
      patient: {
        id: report.user._id,
        name: report.user.name,
        email: report.user.email,
        age,
        sex,
        bloodGroup: patientProfile?.bloodGroup || 'Unknown'
      },
      scoreBreakdown: breakdown,
      vitalsGrid,
      criticalParameters,
      panelResults,
      advisory,
      previousComparison,
      disclaimer: 'Medical Disclaimer: This smart analysis report is generated for informational purposes only and does not constitute formal medical diagnosis or prescription. Please review all findings with a qualified medical professional.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/references/all
 * @desc    Get all canonical parameter references with auto-filled ranges for user's age/sex
 * @access  Private
 */
const getParameterReferences = async (req, res, next) => {
  try {
    let age = null;
    let sex = 'male';

    if (req.user.role === 'patient') {
      const profile = await PatientProfile.findOne({ user: req.user.id });
      if (profile) {
        age = calculateAge(profile.dateOfBirth);
        sex = profile.sex || 'male';
      }
    }

    const references = await ParameterReference.find({}).sort({ panel: 1, canonicalName: 1 });

    const formattedRefs = references.map((ref) => {
      const range = getRangeForAgeSex(ref, age, sex);
      return {
        id: ref._id,
        canonicalName: ref.canonicalName,
        aliases: ref.aliases,
        unit: ref.unit,
        panel: ref.panel,
        bodySystem: ref.bodySystem,
        resultType: ref.resultType,
        range,
        impact: ref.impact,
        howToImprove: ref.howToImprove
      };
    });

    res.json(formattedRefs);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reports
 * @desc    Create a new manual blood report
 * @access  Private (Patient only)
 */
const createReport = async (req, res, next) => {
  try {
    if (req.user.role === 'doctor') {
      return res.status(403).json({ message: 'Doctors are read-only on reports. Patients must submit reports.' });
    }

    const { labName, testDate, collectionDate, sampleType, notes, parameters } = req.body;

    if (!labName || !testDate || !Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({
        message: 'Please provide a valid lab name, test date, and at least one parameter.'
      });
    }

    let isAbnormalOverall = false;

    // Process each parameter and determine status and severity
    const processedParameters = parameters.map((param) => {
      const name = param.name ? param.name.trim() : '';
      const panel = param.panel ? param.panel.trim() : 'General';
      const resultType = param.resultType || 'numeric';
      const value = resultType === 'numeric' && param.value !== undefined && param.value !== '' ? Number(param.value) : null;
      const textValue = param.textValue ? param.textValue.trim() : '';
      const unit = param.unit ? param.unit.trim() : '';
      const low = param.normalRangeLow !== undefined && param.normalRangeLow !== '' && param.normalRangeLow !== null
        ? Number(param.normalRangeLow)
        : null;
      const high = param.normalRangeHigh !== undefined && param.normalRangeHigh !== '' && param.normalRangeHigh !== null
        ? Number(param.normalRangeHigh)
        : null;
      const referenceText = param.referenceText ? param.referenceText.trim() : '';

      const status = getParameterStatus(value, low, high, resultType, textValue, referenceText);
      const severity = getSeverity(value, low, high, status, resultType, textValue);

      if (status !== 'normal') {
        isAbnormalOverall = true;
      }

      return {
        name,
        panel,
        resultType,
        value,
        textValue,
        unit,
        normalRangeLow: low,
        normalRangeHigh: high,
        referenceText,
        status,
        severity
      };
    });

    const { healthScore } = calculateHealthScore(processedParameters);

    const report = await Report.create({
      user: req.user.id,
      labName: labName.trim(),
      testDate: new Date(testDate),
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(testDate),
      sampleType: sampleType ? sampleType.trim() : 'Venous Blood',
      notes: notes ? notes.trim() : '',
      overallStatus: isAbnormalOverall ? 'Abnormal' : 'Normal',
      healthScore,
      parameters: processedParameters
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a report by ID
 * @access  Private (Patient owner only)
 */
const deleteReport = async (req, res, next) => {
  try {
    if (req.user.role === 'doctor') {
      return res.status(403).json({ message: 'Doctors are read-only and cannot delete patient reports.' });
    }

    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/trends/all
 * @desc    Get aggregated parameter trend data across all reports for the user or linked patient
 * @access  Private
 */
const getTrendsData = async (req, res, next) => {
  try {
    let targetUserId = req.user.id;

    if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required for doctor access' });
      }

      const activeLink = await Link.findOne({
        doctor: req.user.id,
        patient: patientId,
        status: 'active'
      });

      if (!activeLink) {
        return res.status(403).json({ message: 'Access denied: Patient is not linked with you' });
      }

      targetUserId = patientId;
    }

    const reports = await Report.find({ user: targetUserId }).sort({ testDate: 1 });

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
          value: param.value !== null ? param.value : param.textValue,
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
  getReports,
  getReportById,
  getReportAnalysis,
  getParameterReferences,
  createReport,
  deleteReport,
  getTrendsData
};
