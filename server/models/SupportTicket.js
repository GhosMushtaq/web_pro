const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail:   String,
  subject:      { type: String, required: true },
  category:     { type: String, enum: ['order','payment','product','shipping','returns','general'], default: 'general' },
  priority:     { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  status:       { type: String, enum: ['open','assigned','in_progress','waiting','resolved','closed'], default: 'open' },
  messages: [{
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderRole: String,
    message:   String,
    attachments: [{ url: String, cloudinary_id: String }],
    sentAt:    { type: Date, default: Date.now }
  }],
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:   Date,
  rating:       { type: Number, min: 1, max: 5 },
}, { timestamps: true });

ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SupportTicket', ticketSchema);
