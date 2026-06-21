import crypto from 'crypto';
import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';

export const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const allowedRoles = ['customer', 'driver'];
  const userRole = allowedRoles.includes(role) ? role : 'customer';

  const verificationToken = crypto.randomBytes(20).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    phone,
    verificationToken,
    verificationExpire: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Lumina Logistics account',
    html: `<p>Hi ${name},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  });

  sendTokenResponse(user, 201, res);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  sendTokenResponse(user, 200, res);
};

export const logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ success: true, message: 'If email exists, reset link sent' });
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  const url = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({ to: user.email, subject: 'Reset Password', html: `<a href="${url}">Reset password</a>` });
  res.json({ success: true, message: 'Reset link sent to email' });
};

export const resetPassword = async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
};

export const verifyEmail = async (req, res) => {
  const user = await User.findOne({
    verificationToken: req.params.token,
    verificationExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified successfully' });
};

export const updateProfile = async (req, res) => {
  const fields = ['name', 'phone', 'avatar'];
  fields.forEach((f) => { if (req.body[f] !== undefined) req.user[f] = req.body[f]; });
  if (req.body.driverProfile && req.user.role === 'driver') {
    req.user.driverProfile = { ...req.user.driverProfile?.toObject?.() || req.user.driverProfile, ...req.body.driverProfile };
  }
  await req.user.save();
  res.json({ success: true, user: req.user });
};
