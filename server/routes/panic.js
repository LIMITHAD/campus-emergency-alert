const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPanicRequest,
  getPanicRequests,
  updatePanicStatus,
  getMyPanicRequests,
  deletePanic,
} = require('../controllers/panicController');

router.post('/', protect, authorize('student', 'staff', 'admin'), createPanicRequest);
router.get('/', protect, authorize('admin'), getPanicRequests);
router.get('/my', protect, getMyPanicRequests);
router.put('/:id/status', protect, authorize('admin'), updatePanicStatus);
router.delete('/:id', protect, authorize('admin'), deletePanic);

module.exports = router;