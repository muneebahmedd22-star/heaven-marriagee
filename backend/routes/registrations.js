const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Proposal = require('../models/Proposal');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'heaven-marriage-bureau' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error.message);
  }
};

// @desc    Submit a new registration
// @route   POST /api/v1/registrations
// @access  Public
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const registrationData = { ...req.body };
    
    // Handle photo upload if present
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      registrationData.photoUrl = uploadResult.secure_url;
      registrationData.photoPublicId = uploadResult.public_id;
    }

    const registration = await Registration.create(registrationData);

    // Trigger WebSockets Notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new_registration', {
        name: registration.fullName,
        city: registration.city || 'Lahore',
        phone: registration.phone,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
    }

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get all registrations
// @route   GET /api/v1/registrations
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Convert registration to proposal
// @route   POST /api/v1/registrations/:id/convert
// @access  Private/Admin
router.post('/:id/convert', protect, async (req, res) => {
  try {
    const registration = await Registration.findById(req.id || req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.status === 'Converted') {
      return res.status(400).json({ success: false, message: 'Registration already converted to proposal' });
    }

    const { category, showOnPublicWebsite } = req.body;

    // Map registration fields to proposal fields
    const proposalData = {
      fullName: registration.fullName,
      gender: registration.gender,
      maritalStatus: registration.maritalStatus,
      dob: registration.dob,
      education: registration.education,
      occupation: registration.profession || '-',
      caste: registration.caste,
      religion: 'Islam', // Default
      city: registration.city,
      region: registration.region,
      height: registration.height || '-',
      aboutMe: registration.partnerPreferences || '',
      contactDetails: {
        phone: registration.phone,
        email: registration.email || '',
      },
      photoUrl: registration.photoUrl || '',
      photoPublicId: registration.photoPublicId || '',
      category: category || 'Other Educated',
      showOnPublicWebsite: showOnPublicWebsite === 'true' || showOnPublicWebsite === true,
    };

    // Save as proper proposal (increment pre-save hook runs automatically)
    const proposal = await Proposal.create(proposalData);

    // Update registration status
    registration.status = 'Converted';
    await registration.save();

    res.status(201).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete registration
// @route   DELETE /api/v1/registrations/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Clean up photo on Cloudinary if exists
    if (registration.photoPublicId) {
      await deleteFromCloudinary(registration.photoPublicId);
    }

    await registration.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
