const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department:  { type: String, required: true },
  permissions: [{ type: String }],
  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

  // HR & Payroll Data
  salary:       { type: Number, default: 0 },
  workingHours: {
    start:      { type: String, default: '09:00' },
    end:        { type: String, default: '17:00' }
  },
  leaveDays:    { type: Number, default: 0 },
  leavesTaken:  { type: Number, default: 0 },
  daysOff:      [{ type: String }],

  // Advanced HR Tracking Arrays
  payrollHistory: [{
    datePaid:   { type: Date, default: Date.now },
    month:      String,
    baseAmount: Number,
    bonus:      { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPaid:    Number,
    paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque'] },
    remarks:    String
  }],
  activityLogs: [{
    date:       { type: Date, default: Date.now },
    type:       { type: String, enum: ['warning', 'promotion', 'award', 'general', 'leave_approved'] },
    note:       String,
    addedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Attendance Tracking
  leaveHistory: [{
    date:      { type: Date },
    reason:    String,
    type:      { type: String, enum: ['annual', 'sick', 'casual', 'unpaid'], default: 'annual' },
    addedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  holidays: [{
    date:      { type: Date },
    name:      String,
    addedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  overtime: [{
    date:      { type: Date },
    hours:     { type: Number, default: 0 },
    reason:    String,
    addedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  isActive:    { type: Boolean, default: true },
  notes:       String,
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
