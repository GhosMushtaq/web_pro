const User     = require('../models/User');
const Settings = require('../models/Settings');

/* ── helper: always return the single settings document ── */
async function getDoc() {
  let doc = await Settings.findOne({ key: 'main' });
  if (!doc) doc = await Settings.create({ key: 'main' }); // first-run seed
  return doc;
}

// @desc  Get all settings
// @route GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const doc = await getDoc();
    res.json({ success: true, settings: {
      store:         doc.store,
      delivery:      doc.delivery,
      notifications: doc.notifications,
      social:        doc.social,
      payment:       doc.payment,
    }});
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// @desc  Get only payment info (public — for checkout page)
// @route GET /api/settings/payment-info  (no auth)
exports.getPaymentInfo = async (req, res) => {
  try {
    const doc = await getDoc();
    res.json({ success: true, payment: doc.payment });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// @desc  Update settings section
// @route PUT /api/settings/:section
exports.updateSettings = async (req, res) => {
  try {
    const { section } = req.params;
    const allowed = ['store', 'delivery', 'notifications', 'social', 'payment'];
    if (!allowed.includes(section)) {
      return res.status(400).json({ message: `Unknown settings section: ${section}` });
    }

    // Build a $set patch that only touches the requested section's fields
    const patch = {};
    for (const [k, v] of Object.entries(req.body)) {
      patch[`${section}.${k}`] = v;
    }

    const doc = await Settings.findOneAndUpdate(
      { key: 'main' },
      { $set: patch },
      { new: true, upsert: true }
    );

    res.json({ success: true, settings: {
      store:         doc.store,
      delivery:      doc.delivery,
      notifications: doc.notifications,
      social:        doc.social,
      payment:       doc.payment,
    }, message: `${section} settings updated` });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// @desc  Get own admin profile
// @route GET /api/settings/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// @desc  Update admin profile
// @route PUT /api/settings/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select('-password');
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// @desc  Change admin password
// @route PUT /api/settings/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const ok   = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
