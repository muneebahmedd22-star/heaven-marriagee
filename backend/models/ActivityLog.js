const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false
  },
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  action: {
    type: String,
    enum: ['Login', 'Logout', 'Create Proposal', 'Update Proposal', 'Delete Proposal', 'Update Inquiry', 'Delete Inquiry', 'Update Employee', 'Create Employee'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
