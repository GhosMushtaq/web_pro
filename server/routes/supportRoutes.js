const express = require('express');
const router = express.Router();
const {
  createTicket, getMyTickets, getAllTickets, getTicketById,
  replyToTicket, updateTicketStatus, getSupportStats
} = require('../controllers/supportController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createTicket);
router.get('/my', protect, getMyTickets);
router.get('/stats', protect, authorize('support', 'admin'), getSupportStats);
router.get('/tickets', protect, authorize('support', 'admin'), getAllTickets);
router.get('/', protect, authorize('support', 'admin'), getAllTickets);
router.get('/:id', protect, getTicketById);
router.post('/:id/reply', protect, replyToTicket);
router.put('/:id/status', protect, authorize('support', 'admin'), updateTicketStatus);

module.exports = router;
