const Staff = require('../models/Staff');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get own staff profile (for logged-in staff member)
// @route   GET /api/staff/me
exports.getMyStaffProfile = async (req, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar address createdAt')
      .populate('activityLogs.addedBy', 'name')
      .populate('assignedOrders', 'orderNumber orderStatus total createdAt');
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff
// @route   GET /api/staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate('user', 'name email phone role avatar isActive')
      .populate('assignedOrders', 'orderNumber orderStatus total')
      .populate('activityLogs.addedBy', 'name');
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create staff member
// @route   POST /api/staff
exports.createStaff = async (req, res) => {
  try {
    const { 
      isNewUser, userId, 
      name, email, password, phone, addressRaw,
      department, permissions,
      salary, workingHoursStart, workingHoursEnd, leaveDays, daysOff
    } = req.body;

    let targetUser = userId;

    if (isNewUser) {
      if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password required' });
      const exist = await User.findOne({ email });
      if (exist) return res.status(400).json({ message: 'User mail already active' });

      const newUser = await User.create({
        name, email, password, phone, role: 'staff',
        address: addressRaw ? [{ label: 'Primary', street: addressRaw }] : []
      });
      targetUser = newUser._id;
    } else {
      await User.findByIdAndUpdate(targetUser, { role: 'staff' });
    }

    const staff = await Staff.create({ 
      user: targetUser, 
      department, 
      permissions,
      salary: salary || 0,
      workingHours: {
        start: workingHoursStart || '09:00',
        end: workingHoursEnd || '17:00'
      },
      leaveDays: leaveDays || 0,
      daysOff: daysOff || []
    });
    
    const populated = await staff.populate('user', 'name email phone avatar');
    res.status(201).json({ success: true, staff: populated, message: 'Staff member created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff permissions
// @route   PUT /api/staff/:id
exports.updateStaff = async (req, res) => {
  try {
    const { department, permissions, isActive } = req.body;
    
    // Check if HR body parameters exist dynamically
    const updateObj = { department, permissions, isActive };
    if ('salary' in req.body) updateObj.salary = req.body.salary;
    if ('workingHoursStart' in req.body || 'workingHoursEnd' in req.body) {
      updateObj.workingHours = {};
      if (req.body.workingHoursStart) updateObj.workingHours.start = req.body.workingHoursStart;
      if (req.body.workingHoursEnd) updateObj.workingHours.end = req.body.workingHoursEnd;
    }
    if ('leaveDays' in req.body) updateObj.leaveDays = req.body.leaveDays;
    if ('daysOff' in req.body) updateObj.daysOff = req.body.daysOff;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    ).populate('user', 'name email phone avatar');

    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json({ success: true, staff, message: 'Staff updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    // Permanently delete the linked user account as well
    await User.findByIdAndDelete(staff.user);
    res.json({ success: true, message: 'Staff member and their account permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dispense Salary to staff
// @route   POST /api/staff/:id/pay
exports.paySalary = async (req, res) => {
  try {
    const { month, bonus, deductions, paymentMethod, remarks } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const baseAmount = staff.salary || 0;
    const netPaid = baseAmount + (Number(bonus) || 0) - (Number(deductions) || 0);

    staff.payrollHistory.push({
      datePaid: new Date(), month, baseAmount,
      bonus: Number(bonus) || 0,
      deductions: Number(deductions) || 0,
      netPaid, paymentMethod, remarks
    });
    
    await staff.save();
    
    const popStaff = await Staff.findById(staff._id)
      .populate('user', 'name email phone avatar')
      .populate('activityLogs.addedBy', 'name');
      
    res.json({ success: true, staff: popStaff, message: 'Salary dispensed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add Activity Log / Bookmark
// @route   POST /api/staff/:id/log
exports.addActivityLog = async (req, res) => {
  try {
    const { type, note } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    staff.activityLogs.unshift({
      date: new Date(), type, note,
      addedBy: req.user._id
    });
    
    if (type === 'leave_approved') staff.leavesTaken += 1;
    
    await staff.save();
    
    const popStaff = await Staff.findById(staff._id)
      .populate('user', 'name email phone avatar')
      .populate('activityLogs.addedBy', 'name');

    res.json({ success: true, staff: popStaff, message: 'Activity log updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add attendance record (leave / holiday / overtime)
// @route   POST /api/staff/:id/attendance
exports.addAttendanceRecord = async (req, res) => {
  try {
    const { recordType, date, reason, type, name, hours } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    if (recordType === 'leave') {
      staff.leaveHistory.unshift({ date: new Date(date), reason, type: type || 'annual', addedBy: req.user._id });
      staff.leavesTaken += 1;
    } else if (recordType === 'holiday') {
      staff.holidays.unshift({ date: new Date(date), name, addedBy: req.user._id });
    } else if (recordType === 'overtime') {
      staff.overtime.unshift({ date: new Date(date), hours: Number(hours) || 0, reason, addedBy: req.user._id });
    } else {
      return res.status(400).json({ message: 'Invalid recordType. Use leave, holiday, or overtime.' });
    }

    await staff.save();
    const popStaff = await Staff.findById(staff._id)
      .populate('user', 'name email phone avatar')
      .populate('activityLogs.addedBy', 'name');
    res.json({ success: true, staff: popStaff, message: `${recordType} recorded successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

