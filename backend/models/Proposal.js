const mongoose = require('mongoose');
const Counter = require('./Counter');

const ProposalSchema = new mongoose.Schema({
  profileId: {
    type: String,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Please add full name'],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, 'Please select gender'],
    enum: ['Male', 'Female'],
  },
  maritalStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'],
    required: [true, 'Please select marital status'],
  },
  dob: {
    type: Date,
    required: [true, 'Please add date of birth'],
  },
  education: {
    type: String,
    required: [true, 'Please add education level'],
  },
  occupation: {
    type: String,
  },
  caste: {
    type: String,
    required: [true, 'Please add caste'],
    trim: true,
  },
  religion: {
    type: String,
    required: [true, 'Please add religion'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please add city'],
    trim: true,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    default: 'Pakistan',
  },
  photoUrl: {
    type: String,
    default: '',
  },
  photoPublicId: {
    type: String,
    default: '',
  },
  aboutMe: {
    type: String,
  },
  contactDetails: {
    phone: {
      type: String,
      required: [true, 'Please add contact phone number'],
    },
    email: {
      type: String,
    },
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['Doctor', 'Engineer', 'Other Educated', '2nd Marriage', 'Late Marriage', 'Ahle Tashi'],
    default: 'Other Educated',
  },
  region: {
    type: String,
    enum: ['Lahore', 'Karachi', 'Islamabad/Rawalpindi', 'KPK', 'Kashmir', 'South Punjab', 'Punjab Other Cities', 'International'],
    required: [true, 'Please select region'],
  },
  showOnPublicWebsite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-increment ProfileId (format: HMB00001)
ProposalSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'profileId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const seqStr = String(counter.seq).padStart(5, '0');
      this.profileId = `HMB${seqStr}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Proposal', ProposalSchema);
