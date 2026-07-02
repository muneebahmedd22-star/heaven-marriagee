const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add full name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add contact phone number'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please add address/city'],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, 'Please select gender'],
    enum: ['Male', 'Female'],
  },
  lookingFor: {
    type: String,
    required: [true, 'Please select looking for'],
    enum: ['Male', 'Female'],
  },
  dob: {
    type: Date,
    required: [true, 'Please add date of birth'],
  },
  maritalStatus: {
    type: String,
    required: [true, 'Please select marital status'],
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'],
  },
  caste: {
    type: String,
    required: [true, 'Please add caste'],
    trim: true,
  },
  education: {
    type: String,
    required: [true, 'Please select education level'],
  },
  profession: {
    type: String,
    trim: true,
  },
  region: {
    type: String,
    required: [true, 'Please select region'],
    enum: ['Lahore', 'Karachi', 'Islamabad/Rawalpindi', 'KPK', 'Kashmir', 'South Punjab', 'Punjab Other Cities', 'International'],
  },
  partnerPreferences: {
    type: String,
    trim: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  photoPublicId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Converted'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Registration', RegistrationSchema);
