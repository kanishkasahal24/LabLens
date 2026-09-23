const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportById,
  createReport,
  deleteReport,
  getTrendsData
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// All report routes protected with JWT auth middleware
router.use(protect);

router.get('/', getReports);
router.post('/', createReport);
router.get('/trends/all', getTrendsData);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;
