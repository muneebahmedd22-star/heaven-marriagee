const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const ActivityLog = require('../models/ActivityLog');
const Employee = require('../models/Employee');
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

// Helper function to calculate Compatibility Score
const calculateCompatibility = (proposal, preferences) => {
  let score = 0;
  
  if (!preferences) return null;
  
  // 1. Same City (30%)
  if (preferences.city && proposal.city) {
    if (proposal.city.trim().toLowerCase() === preferences.city.trim().toLowerCase()) {
      score += 30;
    }
  }

  // 2. Same Caste (25%)
  if (preferences.caste && proposal.caste) {
    if (proposal.caste.trim().toLowerCase() === preferences.caste.trim().toLowerCase()) {
      score += 25;
    }
  }

  // 3. Education Match (25%)
  if (preferences.education && proposal.education) {
    if (proposal.education.trim().toLowerCase() === preferences.education.trim().toLowerCase()) {
      score += 25;
    }
  }

  // 4. Age within 5 years of preference (20%)
  if (preferences.age && proposal.dob) {
    const prefAge = parseInt(preferences.age);
    if (!isNaN(prefAge)) {
      const birthYear = new Date(proposal.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (Math.abs(age - prefAge) <= 5) {
        score += 20;
      }
    }
  }

  return score;
};

// @desc    Get all proposals (with filters & compatibility scoring)
// @route   GET /api/v1/proposals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      gender,
      maritalStatus,
      education,
      caste,
      city,
      religion,
      isFeatured,
      category,
      region,
      // Preference parameters for compatibility score
      prefCity,
      prefCaste,
      prefEducation,
      prefAge,
      limit,
      page
    } = req.query;

    const query = { showOnPublicWebsite: true };

    if (gender) query.gender = gender;
    if (maritalStatus) query.maritalStatus = maritalStatus;
    if (education) query.education = new RegExp(education, 'i');
    if (caste) query.caste = new RegExp(caste, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (religion) query.religion = new RegExp(religion, 'i');
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (category) query.category = category;

    // Region mapping
    if (region) {
      const reg = region.trim().toLowerCase();
      if (reg === 'lahore') {
        query.city = /Lahore/i;
      } else if (reg === 'karachi') {
        query.city = /Karachi/i;
      } else if (reg === 'islamabad/rawalpindi' || reg === 'islamabad' || reg === 'rawalpindi') {
        query.city = { $in: [/Islamabad/i, /Rawalpindi/i] };
      } else if (reg === 'kpk') {
        query.$or = [{ city: /Peshawar/i }, { state: /KPK/i }, { state: /Khyber/i }];
      } else if (reg === 'kashmir') {
        query.$or = [{ city: /Muzaffarabad/i }, { city: /Kashmir/i }, { state: /Kashmir/i }];
      } else if (reg === 'south punjab') {
        query.city = { $in: [/Multan/i, /Bahawalpur/i, /Dera Ghazi Khan/i, /DG Khan/i] };
      } else if (reg === 'punjab other cities') {
        query.city = { $in: [/Faisalabad/i, /Sialkot/i, /Gujranwala/i, /Sargodha/i, /Gujrat/i] };
      } else if (reg === 'international') {
        query.country = { $ne: 'Pakistan' };
      }
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const proposals = await Proposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Proposal.countDocuments(query);

    // Dynamic compatibility calculations if preferences are supplied
    const hasPreferences = prefCity || prefCaste || prefEducation || prefAge;
    const mappedProposals = proposals.map((proposal) => {
      const proposalObj = proposal.toObject();
      if (hasPreferences) {
        proposalObj.compatibilityScore = calculateCompatibility(proposalObj, {
          city: prefCity,
          caste: prefCaste,
          education: prefEducation,
          age: prefAge
        });
      } else {
        proposalObj.compatibilityScore = null;
      }
      return proposalObj;
    });

    res.json({
      success: true,
      count: mappedProposals.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: mappedProposals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single proposal
// @route   GET /api/v1/proposals/:id
// @access  Public
// @desc    Get all proposals for Admin/Data Bank (both public and private)
// @route   GET /api/v1/proposals/admin
// @access  Private
router.get('/admin', protect, async (req, res) => {
  try {
    const {
      gender,
      maritalStatus,
      education,
      caste,
      city,
      religion,
      isFeatured,
      category,
      region,
      prefCity,
      prefCaste,
      prefEducation,
      prefAge,
      limit,
      page
    } = req.query;

    const query = {};

    if (gender) query.gender = gender;
    if (maritalStatus) query.maritalStatus = maritalStatus;
    if (education) query.education = new RegExp(education, 'i');
    if (caste) query.caste = new RegExp(caste, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (religion) query.religion = new RegExp(religion, 'i');
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (category) query.category = category;

    if (region) {
      const reg = region.trim().toLowerCase();
      if (reg === 'lahore') {
        query.city = /Lahore/i;
      } else if (reg === 'karachi') {
        query.city = /Karachi/i;
      } else if (reg === 'islamabad/rawalpindi' || reg === 'islamabad' || reg === 'rawalpindi') {
        query.city = { $in: [/Islamabad/i, /Rawalpindi/i] };
      } else if (reg === 'kpk') {
        query.$or = [{ city: /Peshawar/i }, { state: /KPK/i }, { state: /Khyber/i }];
      } else if (reg === 'kashmir') {
        query.$or = [{ city: /Muzaffarabad/i }, { city: /Kashmir/i }, { state: /Kashmir/i }];
      } else if (reg === 'south punjab') {
        query.city = { $in: [/Multan/i, /Bahawalpur/i, /Dera Ghazi Khan/i, /DG Khan/i] };
      } else if (reg === 'punjab other cities') {
        query.city = { $in: [/Faisalabad/i, /Sialkot/i, /Gujranwala/i, /Sargodha/i, /Gujrat/i] };
      } else if (reg === 'international') {
        query.country = { $ne: 'Pakistan' };
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const proposals = await Proposal.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Proposal.countDocuments(query);

    // Calculate compatibility if preference params exist
    let responseData = proposals;
    if (prefCity || prefCaste || prefEducation || prefAge) {
      responseData = proposals.map(p => {
        const score = calculateCompatibility(p, {
          city: prefCity,
          caste: prefCaste,
          education: prefEducation,
          age: prefAge
        });
        const obj = p.toObject();
        obj.compatibilityScore = score;
        return obj;
      });
      responseData.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }

    res.json({
      success: true,
      count: proposals.length,
      total,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new proposal (Admin only, handles optional photo upload)
// @route   POST /api/v1/proposals
// @access  Private
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const proposalData = { ...req.body };
    
    // Parse nested contactDetails if passed as JSON string
    if (typeof proposalData.contactDetails === 'string') {
      proposalData.contactDetails = JSON.parse(proposalData.contactDetails);
    }

    // Handle Cloudinary photo upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      proposalData.photoUrl = result.secure_url;
      proposalData.photoPublicId = result.public_id;
    }

    const proposal = await Proposal.create(proposalData);

    // Track activity log
    const employee = await Employee.findOne({ adminId: req.admin._id });
    const name = employee ? employee.fullName : 'Super Administrator';
    await ActivityLog.create({
      employee: employee ? employee._id : null,
      username: req.admin.username,
      name,
      action: 'Create Proposal',
      details: `${name} created new Proposal (Profile ID: ${proposal.profileId}).`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update proposal (Admin only)
// @route   PUT /api/v1/proposals/:id
// @access  Private
router.put('/:id', protect, upload.single('photo'), async (req, res) => {
  try {
    let proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const proposalData = { ...req.body };
    
    // Parse nested contactDetails if passed as JSON string
    if (typeof proposalData.contactDetails === 'string') {
      proposalData.contactDetails = JSON.parse(proposalData.contactDetails);
    }

    // Handle photo update
    if (req.file) {
      // Delete old photo if it exists
      if (proposal.photoPublicId) {
        await deleteFromCloudinary(proposal.photoPublicId);
      }
      
      const result = await uploadToCloudinary(req.file.buffer);
      proposalData.photoUrl = result.secure_url;
      proposalData.photoPublicId = result.public_id;
    }

    proposal = await Proposal.findByIdAndUpdate(req.params.id, proposalData, {
      new: true,
      runValidators: true,
    });

    // Track activity log
    const employee = await Employee.findOne({ adminId: req.admin._id });
    const name = employee ? employee.fullName : 'Super Administrator';
    await ActivityLog.create({
      employee: employee ? employee._id : null,
      username: req.admin.username,
      name,
      action: 'Update Proposal',
      details: `${name} updated Proposal (Profile ID: ${proposal.profileId}).`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete proposal (Admin only)
// @route   DELETE /api/v1/proposals/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Delete photo from Cloudinary
    if (proposal.photoPublicId) {
      await deleteFromCloudinary(proposal.photoPublicId);
    }

    const deletedProfileId = proposal.profileId;
    await proposal.deleteOne();

    // Track activity log
    const employee = await Employee.findOne({ adminId: req.admin._id });
    const name = employee ? employee.fullName : 'Super Administrator';
    await ActivityLog.create({
      employee: employee ? employee._id : null,
      username: req.admin.username,
      name,
      action: 'Delete Proposal',
      details: `${name} deleted Proposal (Profile ID: ${deletedProfileId}).`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: 'Proposal removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// @desc    AI Matchmaker Assistant intent parsing and proposals matching
// @route   POST /api/v1/proposals/ai-matchmaker
// @access  Public
router.post('/ai-matchmaker', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const text = message.toLowerCase();

    // 1. Extract Gender
    let gender = null;
    if (/\b(groom|male|boy|son|dulha|larka|man)\b/.test(text)) {
      gender = 'Male';
    } else if (/\b(bride|female|girl|daughter|dulhan|larki|woman)\b/.test(text)) {
      gender = 'Female';
    }

    // 2. Extract City
    let city = null;
    const cities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'sialkot', 'peshawar', 'gujranwala', 'abbottabad'];
    for (const c of cities) {
      if (text.includes(c)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // 3. Extract Caste
    let caste = null;
    const castes = ['rajput', 'awan', 'syed', 'butt', 'jatoi', 'gujjar', 'mughal', 'sheikh', 'malik', 'abbasi', 'janjua', 'rana', 'chaudhary'];
    for (const cst of castes) {
      if (text.includes(cst)) {
        caste = cst.charAt(0).toUpperCase() + cst.slice(1);
        break;
      }
    }

    // 4. Extract Profession
    let profession = null;
    const professions = ['doctor', 'engineer', 'software', 'business', 'teacher', 'it', 'css', 'manager', 'accountant', 'lawyer'];
    for (const prof of professions) {
      if (text.includes(prof)) {
        profession = prof.charAt(0).toUpperCase() + prof.slice(1);
        break;
      }
    }

    // Build DB Query
    let query = {};
    if (gender) query.gender = gender;
    if (city) query.city = new RegExp(city, 'i');
    if (caste) query.caste = new RegExp(caste, 'i');
    if (profession) {
      query.$or = [
        { occupation: new RegExp(profession, 'i') },
        { education: new RegExp(profession, 'i') }
      ];
    }

    let proposals = await Proposal.find(query).limit(3);
    let fallback = false;

    // Fallback: If no matches, search by gender + caste (relax city and profession)
    if (proposals.length === 0 && (caste || city)) {
      fallback = true;
      let relaxedQuery = {};
      if (gender) relaxedQuery.gender = gender;
      
      if (caste) {
        relaxedQuery.caste = new RegExp(caste, 'i');
      } else if (city) {
        relaxedQuery.city = new RegExp(city, 'i');
      }
      
      proposals = await Proposal.find(relaxedQuery).limit(3);
    }

    res.json({
      success: true,
      extracted: { gender, city, caste, profession },
      fallback,
      data: proposals
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

