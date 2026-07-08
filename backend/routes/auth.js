const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new admin (Public for setup, can be restricted later)
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      username,
      password,
    });

    if (admin) {
      res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          username: admin.username,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Auth admin & get token
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check for admin
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Find Employee associated with this Admin account
    const employee = await Employee.findOne({ adminId: admin._id });
    const name = employee ? employee.fullName : 'Super Administrator';

    // Log the successful login as Attendance
    await ActivityLog.create({
      employee: employee ? employee._id : null,
      username: admin.username,
      name: name,
      action: 'Login',
      details: `${name} logged in successfully.`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      data: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current admin profile
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
});

module.exports = router;
