const mongoose = require('mongoose');
const Counter = require('./Counter');

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add employee name'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Please add employee role'],
  },
  email: {
    type: String,
    required: [true, 'Please add employee email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
  },
  salary: {
    type: Number,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
});

// Auto-increment EmployeeId (format: HMB-EMP-001)
EmployeeSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'employeeId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const seqStr = String(counter.seq).padStart(3, '0');
      this.employeeId = `HMB-EMP-${seqStr}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
