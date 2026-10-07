const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
