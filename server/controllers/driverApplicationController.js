import DriverApplication from '../models/DriverApplication.js';
import User from '../models/User.js';

export const getDriverApplications = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  
  const applications = await DriverApplication.find(filter)
    .populate('user', 'name email phone')
    .populate('reviewedBy', 'name email')
    .sort('-createdAt');
  
  res.json({ success: true, applications });
};

export const getDriverApplication = async (req, res) => {
  const application = await DriverApplication.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('reviewedBy', 'name email');
  
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  
  res.json({ success: true, application });
};

export const approveDriverApplication = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  const application = await DriverApplication.findById(id);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  
  if (application.status !== 'pending' && application.status !== 'under_review') {
    return res.status(400).json({ success: false, message: 'Application cannot be approved' });
  }
  
  // Update application status
  application.status = 'approved';
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.notes = notes;
  await application.save();
  
  // Update user driver status
  const user = await User.findById(application.user);
  if (user) {
    user.driverStatus = 'approved';
    user.driverReviewedAt = new Date();
    user.driverReviewedBy = req.user._id;
    await user.save();
  }
  
  res.json({ success: true, message: 'Driver application approved', application });
};

export const rejectDriverApplication = async (req, res) => {
  const { id } = req.params;
  const { reason, notes } = req.body;
  
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Rejection reason is required' });
  }
  
  const application = await DriverApplication.findById(id);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  
  if (application.status !== 'pending' && application.status !== 'under_review') {
    return res.status(400).json({ success: false, message: 'Application cannot be rejected' });
  }
  
  // Update application status
  application.status = 'rejected';
  application.rejectionReason = reason;
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.notes = notes;
  await application.save();
  
  // Update user driver status
  const user = await User.findById(application.user);
  if (user) {
    user.driverStatus = 'rejected';
    user.driverRejectionReason = reason;
    user.driverReviewedAt = new Date();
    user.driverReviewedBy = req.user._id;
    await user.save();
  }
  
  res.json({ success: true, message: 'Driver application rejected', application });
};

export const suspendDriver = async (req, res) => {
  const { id } = req.params;
  const { reason, notes } = req.body;
  
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Suspension reason is required' });
  }
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }
  
  if (user.role !== 'driver') {
    return res.status(400).json({ success: false, message: 'User is not a driver' });
  }
  
  user.driverStatus = 'suspended';
  user.driverRejectionReason = reason;
  user.driverReviewedAt = new Date();
  user.driverReviewedBy = req.user._id;
  await user.save();
  
  // Update application status if exists
  const application = await DriverApplication.findOne({ user: id });
  if (application) {
    application.status = 'suspended';
    application.rejectionReason = reason;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.notes = notes;
    await application.save();
  }
  
  res.json({ success: true, message: 'Driver suspended', user });
};

export const activateDriver = async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }
  
  if (user.role !== 'driver') {
    return res.status(400).json({ success: false, message: 'User is not a driver' });
  }
  
  user.driverStatus = 'approved';
  user.driverRejectionReason = null;
  user.driverReviewedAt = new Date();
  user.driverReviewedBy = req.user._id;
  await user.save();
  
  // Update application status if exists
  const application = await DriverApplication.findOne({ user: id });
  if (application) {
    application.status = 'approved';
    application.rejectionReason = null;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();
  }
  
  res.json({ success: true, message: 'Driver activated', user });
};

export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'suspended'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  
  const application = await DriverApplication.findById(id);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  
  application.status = status;
  application.notes = notes;
  if (status === 'under_review' || status === 'approved' || status === 'rejected' || status === 'suspended') {
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
  }
  await application.save();
  
  // Update user driver status accordingly
  const user = await User.findById(application.user);
  if (user) {
    user.driverStatus = status;
    user.driverReviewedAt = new Date();
    user.driverReviewedBy = req.user._id;
    await user.save();
  }
  
  res.json({ success: true, application });
};
