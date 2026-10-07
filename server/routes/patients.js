const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  getLinkedPatients,
  getPatientDetail,
  getPatientReports,
  getPatientTrends
} = require('../controllers/patientController');

router.use(protect);
router.use(requireRole('doctor'));

router.get('/', getLinkedPatients);
router.get('/:id', getPatientDetail);
router.get('/:id/reports', getPatientReports);
router.get('/:id/trends', getPatientTrends);

module.exports = router;
