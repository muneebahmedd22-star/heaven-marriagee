const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// Apply protection to all employee routes
router.use(protect);

// @desc    Get all employees
// @route   GET /api/v1/employees
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ joiningDate: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new employee
// @route   POST /api/v1/employees
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    // 1. Create matching Admin account first
    const admin = await Admin.create({
      username: req.body.username,
      password: req.body.password,
      role: 'Employee'
    });

    // 2. Create Employee profile
    const employeeData = { ...req.body };
    employeeData.adminId = admin._id;
    const employee = await Employee.create(employeeData);

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update employee details
// @route   PUT /api/v1/employees/:id
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Sync admin credentials if updated
    if (employee.adminId) {
      if (req.body.password) {
        const adminDoc = await Admin.findById(employee.adminId);
        if (adminDoc) {
          adminDoc.password = req.body.password;
          if (req.body.username) adminDoc.username = req.body.username;
          await adminDoc.save();
        }
      } else if (req.body.username) {
        await Admin.findByIdAndUpdate(employee.adminId, { username: req.body.username });
      }
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete associated Admin account
    if (employee.adminId) {
      await Admin.findByIdAndDelete(employee.adminId);
    }

    await employee.deleteOne();
    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
