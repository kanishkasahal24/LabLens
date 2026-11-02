const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getReports,
  getReportById,
  getReportAnalysis,
  getParameterReferences,
  createReport,
  deleteReport,
  getTrendsData,
  parseReportPDF
} = require('../controllers/reportController');

router.use(protect);

router.get('/', getReports);
router.get('/references/all', getParameterReferences);
router.get('/trends/all', getTrendsData);
router.get('/:id', getReportById);
router.get('/:id/analysis', getReportAnalysis);

router.post('/upload-pdf', requireRole('patient'), upload.single('reportPdf'), parseReportPDF);
router.post('/', requireRole('patient'), createReport);
router.delete('/:id', requireRole('patient'), deleteReport);

module.exports = router;
