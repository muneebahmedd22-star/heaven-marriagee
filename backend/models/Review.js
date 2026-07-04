const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: [true, 'Please add a review message'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending'],
    default: 'Approved' // Let's auto-approve for now, or keep it approved. To allow immediate view.
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
