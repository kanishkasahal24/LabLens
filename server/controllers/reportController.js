const Report = require('../models/Report');
const { getParameterStatus } = require('../utils/parameterStatus');

/**
 * @route   GET /api/reports
 * @desc    Get all reports for the logged in user
 * @access  Private
 */
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ testDate: -1 });
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
    const report = await Report.findOne({ _id: req.params.id, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reports
 * @desc    Create a new manual blood report
 * @access  Private
 */
const createReport = async (req, res, next) => {
  try {
    const { labName, testDate, notes, parameters } = req.body;

    if (!labName || !testDate || !Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({
        message: 'Please provide a valid lab name, test date, and at least one parameter.'
      });
    }

    let isAbnormalOverall = false;

    // Process each parameter and determine status via pure utility function
    const processedParameters = parameters.map((param) => {
      const name = param.name ? param.name.trim() : '';
      const value = Number(param.value);
      const unit = param.unit ? param.unit.trim() : '';
      const low = param.normalRangeLow !== undefined && param.normalRangeLow !== '' && param.normalRangeLow !== null
        ? Number(param.normalRangeLow)
        : null;
      const high = param.normalRangeHigh !== undefined && param.normalRangeHigh !== '' && param.normalRangeHigh !== null
        ? Number(param.normalRangeHigh)
        : null;

      const status = getParameterStatus(value, low, high);

      if (status === 'low' || status === 'high') {
        isAbnormalOverall = true;
      }

      return {
        name,
        value,
        unit,
        normalRangeLow: low,
        normalRangeHigh: high,
        status
      };
    });

    const report = await Report.create({
      user: req.user.id,
      labName: labName.trim(),
      testDate: new Date(testDate),
      notes: notes ? notes.trim() : '',
      overallStatus: isAbnormalOverall ? 'Abnormal' : 'Normal',
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
 * @access  Private
 */
const deleteReport = async (req, res, next) => {
  try {
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
 * @desc    Get aggregated parameter trend data across all reports for the user
 * @access  Private
 */
const getTrendsData = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ testDate: 1 });

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
  getReports,
  getReportById,
  createReport,
  deleteReport,
  getTrendsData
};
