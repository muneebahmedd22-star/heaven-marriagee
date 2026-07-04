const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

const defaultReviews = [
  { fullName: "Mian Haroon", rating: 5, message: "Excellent and highly professional matrimonial service in Lahore. Our family is extremely satisfied with their elite matchmaker services." },
  { fullName: "Dr. Amna Malik", rating: 5, message: "Heaven Marriage Bureau helped me find my perfect match. Absolute confidentiality and background check is highly respectable." },
  { fullName: "Sobia Chaudhry", rating: 5, message: "Very satisfied with the Elite VIP service. They match families with mutual values and high credentials." },
  { fullName: "Khawaja Fawad", rating: 5, message: "Highly recommended for families looking for respectable and genuine proposals. Their team is dedicated and responsive." },
  { fullName: "Ayesha Noor", rating: 5, message: "Best elite matchmaking in Islamabad. Found matching proposals according to our expectations in short duration." },
  { fullName: "Zainab Rashid", rating: 5, message: "Absolute privacy and respect throughout our matching journey. A very professional team." },
  { fullName: "Faraz Ahmed", rating: 5, message: "Very helpful and cooperative matchmakers. Excellent experience for overseas families." },
  { fullName: "Saad Butt", rating: 5, message: "Thank you Heaven Marriage Bureau for helping us secure a highly compatible and verified rishta." },
  { fullName: "Mrs. Siddiqui", rating: 5, message: "Highly secure and professional. The background check on every candidate gives deep peace of mind." },
  { fullName: "Bilal Ghazi", rating: 5, message: "Alhamdulillah, had an amazing experience with their team. Professionalism is their key." },
  { fullName: "Naureen Khan", rating: 5, message: "Best doctor matching services in Karachi. Very systematic and verified process." },
  { fullName: "Imran Mughal", rating: 4, message: "Cooperative staff and respectable verified family circles. Satisfied with the service." },
  { fullName: "Samina Shah", rating: 5, message: "Excellent experience. Found highly suitable match for my daughter. JazakAllah." },
  { fullName: "Hamza Bajwa", rating: 4, message: "Very professional communication. High level of confidentiality was maintained." },
  { fullName: "Zahid Qureshi", rating: 5, message: "Very trustable. They do deep family background verifications before matching." },
  { fullName: "Mariam Ali", rating: 5, message: "Elite matching services at their best. Extremely satisfied with our matchmaking consultant." }
];

// Get reviews (auto-seed if empty)
router.get('/', async (req, res) => {
  try {
    let count = await Review.countDocuments();
    if (count < 15) {
      // Seed default reviews
      await Review.insertMany(defaultReviews);
    }
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
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
