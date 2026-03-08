const express = require('express');
const {
  createAlert,
  getAlerts,
  getAlertById,
  deleteAlert,
  acknowledgeAlert
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.post('/', authorize('student', 'staff', 'admin'), createAlert);
router.get('/:id', getAlertById);
router.post('/:id/acknowledge', acknowledgeAlert);
router.delete('/:id', authorize('admin'), deleteAlert);

module.exports = router;