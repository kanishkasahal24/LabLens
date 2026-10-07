const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDoctorByCode } = require('../controllers/doctorController');

router.use(protect);

router.get('/:code', getDoctorByCode);

module.exports = router;
