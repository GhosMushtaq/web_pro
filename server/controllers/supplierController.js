const Supplier = require('../models/Supplier');

// ─── Helper ─────────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(6, '0');

// @desc   Get all suppliers (with search + filter)
// @route  GET /api/suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const { search, status, category } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { companyName:   { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email:         { $regex: search, $options: 'i' } },
        { phone:         { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(filter)
      .populate('activityLog.by', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single supplier (with full history)
// @route  GET /api/suppliers/:id
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('activityLog.by', 'name');
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create supplier
// @route  POST /api/suppliers
exports.createSupplier = async (req, res) => {
  try {
    const {
      companyName, contactPerson, email, phone, address,
      category, taxId, status, rating, creditLimit,
      paymentTerms, notes, tags,
      bankName, accountTitle, accountNumber, iban
    } = req.body;

    if (!companyName) return res.status(400).json({ message: 'Company name is required' });

    const exists = await Supplier.findOne({ companyName: companyName.trim() });
    if (exists) return res.status(400).json({ message: 'A supplier with this company name already exists' });

    const supplier = await Supplier.create({
      companyName, contactPerson, email, phone, address,
      category: category || 'General',
      taxId, status: status || 'active',
      rating: rating || 3,
      creditLimit: Number(creditLimit) || 0,
      paymentTerms: paymentTerms || 'Advance',
      notes, tags: tags || [],
      bankName, accountTitle, accountNumber, iban
    });

    res.status(201).json({ success: true, supplier, message: 'Supplier created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update supplier
// @route  PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ success: true, supplier, message: 'Supplier updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete supplier
// @route  DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Payments ────────────────────────────────────────────────────────────────

// @desc   Add payment record
// @route  POST /api/suppliers/:id/payments
exports.addPayment = async (req, res) => {
  try {
    const { amount, date, method, reference, status, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    supplier.paymentHistory.unshift({
      amount: Number(amount),
      date:   date ? new Date(date) : new Date(),
      method: method || 'Bank Transfer',
      reference, status: status || 'paid', note
    });

    supplier.activityLog.unshift({
      date: new Date(), type: 'payment',
      note: `Payment of Rs. ${Number(amount).toLocaleString()} logged (${method || 'Bank Transfer'})`,
      by: req.user._id
    });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Purchase Orders ─────────────────────────────────────────────────────────

// @desc   Add purchase order
// @route  POST /api/suppliers/:id/orders
exports.addOrder = async (req, res) => {
  try {
    const { items, expectedDelivery, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const totalAmount = (items || []).reduce((sum, i) => sum + (Number(i.qty) * Number(i.unitCost)), 0);
    const count = supplier.orderHistory.length + 1;
    const orderRef = `PO-${pad(count)}`;

    supplier.orderHistory.unshift({
      orderRef, items: items || [],
      totalAmount, orderedAt: new Date(),
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
      status: 'pending', note
    });

    supplier.activityLog.unshift({
      date: new Date(), type: 'order',
      note: `Purchase order ${orderRef} created — Rs. ${totalAmount.toLocaleString()}`,
      by: req.user._id
    });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Purchase order added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update purchase order status
// @route  PUT /api/suppliers/:id/orders/:oid
exports.updateOrder = async (req, res) => {
  try {
    const { status, note, deliveredAt } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const order = supplier.orderHistory.id(req.params.oid);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status || order.status;
    if (note) order.note = note;
    if (status === 'received') order.deliveredAt = deliveredAt ? new Date(deliveredAt) : new Date();

    supplier.activityLog.unshift({
      date: new Date(), type: 'order',
      note: `Purchase order ${order.orderRef} status updated to "${status}"`,
      by: req.user._id
    });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Deals ───────────────────────────────────────────────────────────────────

// @desc   Add deal/contract
// @route  POST /api/suppliers/:id/deals
exports.addDeal = async (req, res) => {
  try {
    const { title, startDate, endDate, value, terms, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    supplier.dealHistory.unshift({
      title, value: Number(value) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate:   endDate   ? new Date(endDate)   : null,
      terms, status: 'active', note
    });

    supplier.activityLog.unshift({
      date: new Date(), type: 'deal',
      note: `New deal added: "${title}" — Rs. ${Number(value).toLocaleString()}`,
      by: req.user._id
    });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Deal added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update deal status
// @route  PUT /api/suppliers/:id/deals/:did
exports.updateDeal = async (req, res) => {
  try {
    const { status, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const deal = supplier.dealHistory.id(req.params.did);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    deal.status = status || deal.status;
    if (note) deal.note = note;

    supplier.activityLog.unshift({
      date: new Date(), type: 'deal',
      note: `Deal "${deal.title}" status changed to "${status}"`,
      by: req.user._id
    });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Deal updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Deadlines ───────────────────────────────────────────────────────────────

// @desc   Add deadline
// @route  POST /api/suppliers/:id/deadlines
exports.addDeadline = async (req, res) => {
  try {
    const { title, dueDate, type, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    supplier.deadlines.push({ title, dueDate: new Date(dueDate), type: type || 'general', status: 'pending', note });

    supplier.activityLog.unshift({
      date: new Date(), type: 'note',
      note: `Deadline added: "${title}" due ${new Date(dueDate).toLocaleDateString()}`,
      by: req.user._id
    });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Deadline added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update deadline status
// @route  PUT /api/suppliers/:id/deadlines/:deid
exports.updateDeadline = async (req, res) => {
  try {
    const { status } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const deadline = supplier.deadlines.id(req.params.deid);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });

    deadline.status = status || deadline.status;

    await supplier.save();
    res.json({ success: true, supplier, message: 'Deadline updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Activity Log ─────────────────────────────────────────────────────────────

// @desc   Add activity log entry
// @route  POST /api/suppliers/:id/activity
exports.addActivity = async (req, res) => {
  try {
    const { type, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    supplier.activityLog.unshift({ date: new Date(), type: type || 'note', note, by: req.user._id });

    await supplier.save();
    res.json({ success: true, supplier, message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Stats ────────────────────────────────────────────────────────────────────

// @desc   Get supplier stats
// @route  GET /api/suppliers/stats
exports.getStats = async (req, res) => {
  try {
    const suppliers = await Supplier.find();

    const totalSuppliers  = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    const inactive        = suppliers.filter(s => s.status === 'inactive').length;
    const blacklisted     = suppliers.filter(s => s.status === 'blacklisted').length;

    // Total spend (all payments ever)
    let totalSpend = 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let spendThisMonth = 0;

    suppliers.forEach(s => {
      s.paymentHistory.forEach(p => {
        if (p.status === 'paid') {
          totalSpend += p.amount;
          if (new Date(p.date) >= monthStart) spendThisMonth += p.amount;
        }
      });
    });

    // Average rating
    const rated = suppliers.filter(s => s.rating);
    const avgRating = rated.length ? (rated.reduce((sum, s) => sum + s.rating, 0) / rated.length).toFixed(1) : 0;

    // Active deals
    const activeDeals = suppliers.reduce((sum, s) =>
      sum + s.dealHistory.filter(d => d.status === 'active').length, 0);

    // Total purchase orders this month
    let ordersThisMonth = 0;
    suppliers.forEach(s => {
      s.orderHistory.forEach(o => {
        if (new Date(o.orderedAt) >= monthStart) ordersThisMonth++;
      });
    });

    // Upcoming deadlines (next 30 days, pending)
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = [];
    suppliers.forEach(s => {
      s.deadlines.forEach(d => {
        if (d.status === 'pending' && new Date(d.dueDate) >= now && new Date(d.dueDate) <= in30) {
          upcomingDeadlines.push({ ...d.toObject(), supplierName: s.companyName, supplierId: s._id });
        }
      });
    });
    upcomingDeadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Top suppliers by total spend
    const topSuppliers = suppliers.map(s => ({
      _id: s._id,
      companyName: s.companyName,
      totalSpend: s.paymentHistory.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      totalOrders: s.orderHistory.length,
      rating: s.rating,
      status: s.status,
    })).sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);

    // Recent activity (across all suppliers, last 10)
    const recentActivity = [];
    suppliers.forEach(s => {
      s.activityLog.slice(0, 5).forEach(a => {
        recentActivity.push({ ...a.toObject(), supplierName: s.companyName });
      });
    });
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      stats: {
        totalSuppliers, activeSuppliers, inactive, blacklisted,
        totalSpend, spendThisMonth, avgRating: Number(avgRating),
        activeDeals, ordersThisMonth,
        upcomingDeadlines: upcomingDeadlines.slice(0, 10),
        topSuppliers,
        recentActivity: recentActivity.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
