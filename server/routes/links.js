const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  requestLink,
  getLinks,
  updateLinkStatus,
  deleteLink
} = require('../controllers/linkController');

router.use(protect);

router.get('/', getLinks);
router.post('/', requireRole('patient'), requestLink);
router.patch('/:id', requireRole('doctor'), updateLinkStatus);
router.delete('/:id', deleteLink);

module.exports = router;
