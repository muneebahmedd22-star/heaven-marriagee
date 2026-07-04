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
  let adminId;
  try {
    // Check if username is already taken
    let existingAdmin = await Admin.findOne({ username: req.body.username });
    if (existingAdmin) {
      const linkedEmployee = await Employee.findOne({ adminId: existingAdmin._id });
      if (!linkedEmployee) {
        // Ghost document from previous failed creation. Delete it.
        await Admin.findByIdAndDelete(existingAdmin._id);
      } else {
        return res.status(400).json({ success: false, message: 'Username is already taken by another employee.' });
      }
    }

    // 1. Create matching Admin account first
    const admin = await Admin.create({
      username: req.body.username,
      password: req.body.password,
      role: req.body.accessRole || 'Employee'
    });
    adminId = admin._id;

    // 2. Create Employee profile
    const employeeData = { ...req.body };
    employeeData.adminId = admin._id;
    const employee = await Employee.create(employeeData);

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    // Cleanup if employee creation failed but admin was created
    if (adminId) {
      await Admin.findByIdAndDelete(adminId);
    }
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

    // Sync admin credentials and role if updated
    if (employee.adminId) {
      const updateFields = {};
      if (req.body.username) updateFields.username = req.body.username;
      if (req.body.accessRole) updateFields.role = req.body.accessRole;

      if (req.body.password) {
        const adminDoc = await Admin.findById(employee.adminId);
        if (adminDoc) {
          adminDoc.password = req.body.password;
          if (req.body.username) adminDoc.username = req.body.username;
          if (req.body.accessRole) adminDoc.role = req.body.accessRole;
          await adminDoc.save();
        }
      } else if (Object.keys(updateFields).length > 0) {
        await Admin.findByIdAndUpdate(employee.adminId, updateFields);
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
