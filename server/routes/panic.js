const express = require('express');
const {
  createPanicRequest,
  getPanicRequests,
  updatePanicStatus,
  getMyPanicRequests
} = require('../controllers/panicController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), createPanicRequest);
router.get('/my', authorize('student'), getMyPanicRequests);
router.get('/', authorize('admin'), getPanicRequests);
router.put('/:id/status', authorize('admin'), updatePanicStatus);

module.exports = router;