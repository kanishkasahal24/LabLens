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
 * @route   GET /api/reports/advisory/latest
 * @desc    Get the latest personalised health advisory for patient
 * @access  Private
 */
const getLatestAdvisory = async (req, res, next) => {
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

    const latestReport = await Report.findOne({ user: targetUserId })
      .sort({ testDate: -1 })
      .populate('user', 'name email');

    if (!latestReport) {
      return res.status(404).json({ message: 'No blood reports found to generate advisory.' });
    }

    const patientProfile = await PatientProfile.findOne({ user: targetUserId });
    const references = await ParameterReference.find({});
    const paramRefMap = {};
    references.forEach((ref) => {
      paramRefMap[ref.canonicalName.toLowerCase()] = ref;
    });

    const enhancedParameters = latestReport.parameters.map((p) => {
      const ref = paramRefMap[p.name.toLowerCase()];
      return {
        ...p.toObject(),
        impact: ref?.impact || '',
        howToImprove: ref?.howToImprove || ''
      };
    });

    const { healthScore, breakdown } = calculateHealthScore(enhancedParameters);
    const vitalsGrid = getVitalsGrid(enhancedParameters);
    const criticalParameters = getCriticalParameters(enhancedParameters, paramRefMap);
    const advisory = getRuleBasedAdvisory(patientProfile, criticalParameters, vitalsGrid);

    res.json({
      report: {
        id: latestReport._id,
        labName: latestReport.labName,
        testDate: latestReport.testDate,
        healthScore
      },
      patient: {
        name: latestReport.user.name,
        bloodGroup: patientProfile?.bloodGroup || 'N/A',
        activity: patientProfile?.physicalActivity || 'sedentary'
      },
      vitalsGrid,
      criticalParameters,
      advisory,
      scoreBreakdown: breakdown,
      disclaimer: 'Medical Disclaimer: This personalised advisory is algorithmically generated based on your latest blood tests and health profile. It is intended for educational guidance and must be reviewed with a licensed physician.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/compare
 * @desc    Compare any two blood reports side by side
 * @access  Private
 */
const compareReports = async (req, res, next) => {
  try {
    const { report1Id, report2Id } = req.query;
    if (!report1Id || !report2Id) {
      return res.status(400).json({ message: 'Both report1Id and report2Id are required' });
    }

    const rep1 = await Report.findById(report1Id);
    const rep2 = await Report.findById(report2Id);

    if (!rep1 || !rep2) {
      return res.status(404).json({ message: 'One or both reports could not be found' });
    }

    const canAcc1 = await canAccessReport(req.user, rep1);
    const canAcc2 = await canAccessReport(req.user, rep2);
    if (!canAcc1 || !canAcc2) {
      return res.status(403).json({ message: 'Access denied to one or both reports' });
    }

    // Sort so earlier report is baseline
    const isRep1Earlier = new Date(rep1.testDate) <= new Date(rep2.testDate);
    const earlier = isRep1Earlier ? rep1 : rep2;
    const later = isRep1Earlier ? rep2 : rep1;

    const earlierParamMap = {};
    earlier.parameters.forEach((p) => {
      earlierParamMap[p.name.toLowerCase()] = p;
    });

    const comparisons = [];
    const improvedList = [];
    const concernList = [];

    later.parameters.forEach((laterP) => {
      const earlierP = earlierParamMap[laterP.name.toLowerCase()];
      if (earlierP && laterP.resultType === 'numeric' && earlierP.resultType === 'numeric') {
        const diff = Number((laterP.value - earlierP.value).toFixed(2));
        const pctChange = earlierP.value !== 0 ? Number(((diff / earlierP.value) * 100).toFixed(1)) : 0;
        
        let direction = 'same';
        if (diff > 0) direction = 'increased';
        if (diff < 0) direction = 'decreased';

        // Check if change is favorable
        let trendEvaluation = 'neutral';
        if (laterP.status === 'normal' && earlierP.status !== 'normal') {
          trendEvaluation = 'improved';
          improvedList.push(laterP.name);
        } else if (laterP.status !== 'normal' && earlierP.status === 'normal') {
          trendEvaluation = 'worsened';
          concernList.push(laterP.name);
        }

        comparisons.push({
          name: laterP.name,
          panel: laterP.panel,
          unit: laterP.unit,
          earlierValue: earlierP.value,
          earlierStatus: earlierP.status,
          laterValue: laterP.value,
          laterStatus: laterP.status,
          diff,
          pctChange,
          direction,
          trendEvaluation,
          normalRangeLow: laterP.normalRangeLow,
          normalRangeHigh: laterP.normalRangeHigh
        });
      }
    });

    res.json({
      earlierReport: {
        id: earlier._id,
        labName: earlier.labName,
        testDate: earlier.testDate,
        healthScore: earlier.healthScore
      },
      laterReport: {
        id: later._id,
        labName: later.labName,
        testDate: later.testDate,
        healthScore: later.healthScore,
        scoreDiff: (later.healthScore || 0) - (earlier.healthScore || 0)
      },
      comparisons,
      summary: {
        improved: [...new Set(improvedList)],
        concerns: [...new Set(concernList)]
      }
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

    const { panel, search } = req.query;
    const filter = {};
    if (panel && panel !== 'All') {
      filter.panel = new RegExp(panel, 'i');
    }
    if (search && search.trim()) {
      const s = search.trim();
      filter.$or = [
        { canonicalName: new RegExp(s, 'i') },
        { aliases: new RegExp(s, 'i') },
        { impact: new RegExp(s, 'i') }
      ];
    }

    const references = await ParameterReference.find(filter).sort({ panel: 1, canonicalName: 1 });

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

/**
 * @route   POST /api/reports/upload-pdf
 * @desc    Upload lab report PDF, extract text, match biomarkers, and return structured editable draft
 * @access  Private (Patient only)
 */
const parseReportPDF = async (req, res, next) => {
  try {
    if (req.user.role === 'doctor') {
      return res.status(403).json({ message: 'Doctors cannot upload patient reports.' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Please upload a valid lab report PDF or image.' });
    }

    const { extractTextFromPDF, extractTextWithOCR, extractMetadata, parseBiomarkersFromText } = require('../utils/pdfParser');

    const originalName = (req.file.originalname || '').toLowerCase();
    const mimeType = req.file.mimetype || '';
    const isImage = mimeType.startsWith('image/') || originalName.endsWith('.png') || originalName.endsWith('.jpg') || originalName.endsWith('.jpeg') || originalName.endsWith('.webp');

    let rawText = '';
    let extractionMethod = 'digital';

    if (isImage) {
      // 1a. Directly perform OCR for image files
      try {
        extractionMethod = 'ocr';
        rawText = await extractTextWithOCR(req.file.buffer);
      } catch (ocrErr) {
        return res.status(422).json({
          message: 'Unable to read text from the image. Please ensure the image is clear and well lit.'
        });
      }
    } else {
      // 1b. Try digital PDF text extraction first
      try {
        rawText = await extractTextFromPDF(req.file.buffer);
      } catch (parseErr) {
        // Fall back to OCR if digital parsing throws
        try {
          extractionMethod = 'ocr';
          rawText = await extractTextWithOCR(req.file.buffer);
        } catch (ocrErr) {
          return res.status(422).json({
            message: 'Unable to extract text from the document. The file may be password-protected or unreadable.'
          });
        }
      }

      // If digital PDF returned no characters (scanned PDF), run OCR
      if (!rawText || rawText.trim().length === 0) {
        try {
          extractionMethod = 'ocr';
          rawText = await extractTextWithOCR(req.file.buffer);
        } catch (ocrErr) {
          console.warn('OCR fallback error:', ocrErr.message);
        }
      }
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(422).json({
        message: 'No readable text or biomarkers found in this document. Please ensure the report is legible or enter values manually.'
      });
    }

    // 2. Fetch patient profile to contextualize reference ranges by age & sex
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });

    // 3. Extract lab metadata (labName, testDate, sampleType)
    const metadata = extractMetadata(rawText);

    // 4. Parse biomarkers matching canonical ParameterReference database
    const extractedParameters = await parseBiomarkersFromText(rawText, patientProfile);

    // 5. Calculate preliminary health score for preview
    const { healthScore, breakdown } = calculateHealthScore(extractedParameters);

    res.json({
      message: `Successfully extracted ${extractedParameters.length} biomarkers from ${extractionMethod === 'ocr' ? 'OCR document scan' : 'lab report'}.`,
      extractionMethod,
      metadata: {
        labName: metadata.labName,
        testDate: metadata.testDate.toISOString().split('T')[0],
        collectionDate: metadata.testDate.toISOString().split('T')[0],
        sampleType: metadata.sampleType,
        fileName: req.file.originalname,
        fileSize: req.file.size
      },
      parameters: extractedParameters,
      preliminaryHealthScore: healthScore,
      scoreBreakdown: breakdown,
      rawTextSnippet: rawText.substring(0, 500)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  getReportById,
  getReportAnalysis,
  getLatestAdvisory,
  compareReports,
  getParameterReferences,
  createReport,
  deleteReport,
  getTrendsData,
  parseReportPDF
};

