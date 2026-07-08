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
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
  },
  lookingFor: {
    type: String,
    enum: ['Male', 'Female'],
  },
  dob: {
    type: Date,
  },
  maritalStatus: {
    type: String,
    enum: ['Unmarried', 'Divorced', 'Widowed', 'Awaiting Divorce'],
  },
  height: {
    type: String,
  },
  caste: {
    type: String,
    trim: true,
  },
  education: {
    type: String,
  },
  profession: {
    type: String,
    trim: true,
  },
  region: {
    type: String,
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
