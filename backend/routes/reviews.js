const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'Approved' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post a review
router.post('/', async (req, res) => {
  try {
    const { fullName, rating, message } = req.body;
    const review = await Review.create({
      fullName,
      rating,
      message,
      status: 'Approved'
    });

    // Trigger WebSockets Notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new_review', {
        name: review.fullName,
        rating: review.rating,
        message: review.message,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
