const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// Email Templates
exports.sendOTPEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: '🎁 Gifting Bliss — Email Verification OTP',
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: auto; background: #FFF0F5; padding: 32px; border-radius: 16px;">
        <h1 style="color: #FF2D7A; font-size: 28px; text-align: center;">🎁 Gifting Bliss</h1>
        <h2 style="color: #3D001F;">Hello, ${name}!</h2>
        <p style="color: #3D001F;">Your email verification OTP is:</p>
        <div style="background: #FF2D7A; color: white; font-size: 36px; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 12px; font-weight: bold;">
          ${otp}
        </div>
        <p style="color: #9B6B7E; margin-top: 16px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        <hr style="border: 1px solid #FFD6E7; margin: 24px 0;">
        <p style="color: #9B6B7E; font-size: 12px; text-align: center;">Gifting Bliss — Gifts That Speak from the Heart 💝</p>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: email,
    subject: '🔐 Gifting Bliss — Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #FFF0F5; padding: 32px; border-radius: 16px;">
        <h1 style="color: #FF2D7A; text-align: center;">🎁 Gifting Bliss</h1>
        <h2 style="color: #3D001F;">Hi ${name},</h2>
        <p style="color: #3D001F;">You requested a password reset. Click the button below:</p>
        <a href="${resetUrl}" style="display: block; background: #FF2D7A; color: white; text-align: center; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 24px 0;">Reset My Password</a>
        <p style="color: #9B6B7E;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

exports.sendOrderConfirmation = async (email, name, order) => {
  await sendEmail({
    to: email,
    subject: `✅ Order Confirmed — ${order.orderNumber} | Gifting Bliss`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #FFF0F5; padding: 32px; border-radius: 16px;">
        <h1 style="color: #FF2D7A; text-align: center;">🎁 Gifting Bliss</h1>
        <h2 style="color: #3D001F;">Order Confirmed! 🎉</h2>
        <p style="color: #3D001F;">Hi ${name}, your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.orderStatus}</p>
        </div>
        <p style="color: #9B6B7E;">Track your order on our website anytime.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, ...exports };
