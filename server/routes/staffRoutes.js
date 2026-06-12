const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, deleteStaff, paySalary, addActivityLog, getMyStaffProfile, addAttendanceRecord } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getStaff);
router.get('/me', protect, authorize('staff', 'admin'), getMyStaffProfile);
router.post('/', protect, authorize('admin'), createStaff);
router.post('/:id/pay', protect, authorize('admin'), paySalary);
router.post('/:id/log', protect, authorize('admin'), addActivityLog);
router.post('/:id/attendance', protect, authorize('admin'), addAttendanceRecord);
router.put('/:id', protect, authorize('admin'), updateStaff);
router.delete('/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
