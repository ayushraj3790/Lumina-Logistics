import DriverApplication from '../models/DriverApplication.js';

export const uploadDriverDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { documentType } = req.body;
    const { userId } = req.params;

    // Cloudinary URL is available in req.file.path
    const documentUrl = req.file.path;

    // Find or create driver application
    let application = await DriverApplication.findOne({ user: userId });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Driver application not found' });
    }

    // Update the appropriate document field
    const documentFields = {
      licenseUpload: 'licenseUpload',
      rcUpload: 'rcUpload',
      insuranceUpload: 'insuranceUpload',
      cancelledChequeUpload: 'cancelledChequeUpload',
    };

    if (documentFields[documentType]) {
      application[documentFields[documentType]] = documentUrl;
      await application.save();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    res.json({ success: true, documentUrl, documentType });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

export const submitDriverApplication = async (req, res) => {
  try {
    const { userId } = req.params;
    const applicationData = req.body;

    // Check if application already exists
    const existingApplication = await DriverApplication.findOne({ user: userId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'Application already submitted' });
    }

    // Create new driver application
    const application = await DriverApplication.create({
      user: userId,
      ...applicationData,
      status: 'pending',
    });

    // Update user driver status
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    if (user) {
      user.driverStatus = 'pending';
      await user.save();
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Application submission failed', error: error.message });
  }
};
