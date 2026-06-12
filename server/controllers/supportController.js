const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

// @desc    Create support ticket
// @route   POST /api/support
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message, guestEmail } = req.body;

    const ticket = await SupportTicket.create({
      customer: req.user?._id,
      guestEmail: req.user ? undefined : guestEmail,
      subject, category, priority,
      messages: [{
        sender: req.user?._id,
        senderRole: req.user?.role || 'guest',
        message,
        sentAt: new Date()
      }]
    });

    // Notify support team
    const io = req.app.get('io');
    if (io) io.to('role:support').emit('ticketUpdate', { type: 'new', ticket });

    res.status(201).json({ success: true, ticket, message: 'Ticket created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer's tickets
// @route   GET /api/support/my
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ customer: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets (Support team)
// @route   GET /api/support
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('customer', 'name email')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SupportTicket.countDocuments(query)
    ]);

    res.json({ success: true, tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/support/:id
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer', 'name email avatar')
      .populate('messages.sender', 'name role avatar')
      .populate('assignedTo', 'name role');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to ticket
// @route   POST /api/support/:id/reply
exports.replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.messages.push({
      sender: req.user._id,
      senderRole: req.user.role,
      message,
      sentAt: new Date()
    });

    if (ticket.status === 'waiting') ticket.status = 'in_progress';
    await ticket.save();

    // Notify customer if support replied
    if (['support','admin'].includes(req.user.role) && ticket.customer) {
      const io = req.app.get('io');
      if (io) io.to(ticket.customer.toString()).emit('ticketUpdate', { type: 'reply', ticketId: ticket._id });
    }

    res.json({ success: true, ticket, message: 'Reply sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/support/:id/status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (status === 'resolved') ticket.resolvedAt = new Date();

    await SupportTicket.findByIdAndUpdate(req.params.id, {
      status,
      ...(assignedTo ? { assignedTo } : {}),
      ...(status === 'resolved' ? { resolvedAt: new Date() } : {})
    });

    res.json({ success: true, ticket, message: 'Ticket updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get support generic stats
// @route   GET /api/support/stats
exports.getSupportStats = async (req, res) => {
  try {
    const total = await SupportTicket.countDocuments();
    const open = await SupportTicket.countDocuments({ status: { $in: ['open', 'waiting'] } });
    const resolved = await SupportTicket.countDocuments({ status: 'resolved' });
    const in_progress = await SupportTicket.countDocuments({ status: 'in_progress' });
    
    res.json({ success: true, stats: [
      { label: 'Total Tickets', value: total },
      { label: 'Open & Waiting', value: open },
      { label: 'In Progress', value: in_progress },
      { label: 'Resolved', value: resolved },
    ]});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
