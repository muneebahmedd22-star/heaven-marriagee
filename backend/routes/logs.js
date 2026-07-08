const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// Apply protection to all logs routes (SuperAdmin only)
router.use(protect);

// Middleware to restrict access to SuperAdmin only
const restrictToSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. SuperAdmin privileges required.' });
  }
};

router.use(restrictToSuperAdmin);

// @desc    Get all raw logs (Activity & Attendance)
// @route   GET /api/v1/logs
// @access  Private (SuperAdmin only)
router.get('/', async (req, res) => {
  try {
    const { limit = 100, page = 1, action, username } = req.query;
    
    const query = {};
    if (action) query.action = action;
    if (username) query.username = new RegExp(username, 'i');

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      total,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get monthly attendance summary for salary calculations
// @route   GET /api/v1/logs/summary
// @access  Private (SuperAdmin only)
router.get('/summary', async (req, res) => {
  try {
    // Expected query format: ?month=2026-07 (Defaults to current month)
    const monthQuery = req.query.month || new Date().toISOString().slice(0, 7);
    const startOfMonth = new Date(`${monthQuery}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch all login logs of the selected month
    const loginLogs = await ActivityLog.find({
      action: 'Login',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: 1 });

    // Group in memory to compute unique active days and timestamps
    const employeeMap = {};

    loginLogs.forEach(log => {
      const empId = log.employee ? log.employee.toString() : 'super-admin';
      const dateStr = new Date(log.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY

      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          employeeId: log.employee,
          username: log.username,
          name: log.name || 'Super Administrator',
          activeDaysCount: 0,
          uniqueDates: new Set(),
          logins: []
        };
      }

      employeeMap[empId].uniqueDates.add(dateStr);
      employeeMap[empId].logins.push(log.createdAt);
    });

    const summary = Object.values(employeeMap).map(emp => {
      // Calculate active days count
      emp.activeDaysCount = emp.uniqueDates.size;
      
      // Calculate first and last login times
      const sortedLogins = emp.logins.sort((a, b) => new Date(a) - new Date(b));
      emp.firstLogin = sortedLogins[0] || null;
      emp.lastLogin = sortedLogins[sortedLogins.length - 1] || null;

      // Clean up Set object before JSON serialization
      delete emp.uniqueDates;
      delete emp.logins;
      
      return emp;
    });

    res.json({
      success: true,
      month: monthQuery,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
