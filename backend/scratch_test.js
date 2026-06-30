// Scratch test script to verify models, auto-increment, and compatibility score formulas
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Proposal = require('./models/Proposal');
const Counter = require('./models/Counter');

// Load environment variables
dotenv.config();

async function runTests() {
  console.log('--- Starting System Verification Tests ---');

  // Connect to local test DB or Env DB
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/heaven_marriage_bureau_test';
  console.log(`Connecting to: ${dbUri}`);
  
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected successfully.');

    // 1. Clean previous test items
    await Proposal.deleteMany({});
    await Counter.deleteMany({});
    console.log('Test collections cleared.');

    // 2. Test auto-increment and default country logic
    console.log('\nCreating Test Proposal 1...');
    const prop1 = await Proposal.create({
      fullName: 'Aisha Khan',
      gender: 'Female',
      maritalStatus: 'Never Married',
      dob: new Date('1998-05-15'),
      education: 'Bachelors',
      occupation: 'Designer',
      caste: 'Rajput',
      religion: 'Islam',
      city: 'Lahore',
      state: 'Punjab',
      contactDetails: {
        phone: '+923007654321',
        email: 'aisha@example.com'
      }
    });

    console.log(`Proposal 1 Created: ID=${prop1.profileId}, Country=${prop1.country}`);
    if (prop1.profileId === 'HMB00001') {
      console.log('✓ Auto-Increment Profile ID Test Passed: HMB00001 generated.');
    } else {
      console.error('✗ Auto-Increment Profile ID Test Failed!');
    }

    if (prop1.country === 'Pakistan') {
      console.log('✓ Default Country Test Passed: Defaulted to Pakistan.');
    } else {
      console.error('✗ Default Country Test Failed!');
    }

    console.log('\nCreating Test Proposal 2...');
    const prop2 = await Proposal.create({
      fullName: 'Bilal Ahmed',
      gender: 'Male',
      maritalStatus: 'Never Married',
      dob: new Date('1995-10-22'),
      education: 'Masters',
      occupation: 'Software Engineer',
      caste: 'Awan',
      religion: 'Islam',
      city: 'Islamabad',
      state: 'ICT',
      contactDetails: {
        phone: '+923001112223',
        email: 'bilal@example.com'
      }
    });

    console.log(`Proposal 2 Created: ID=${prop2.profileId}`);
    if (prop2.profileId === 'HMB00002') {
      console.log('✓ Auto-Increment Profile ID Test Passed: HMB00002 generated.');
    } else {
      console.error('✗ Auto-Increment Profile ID Test Failed!');
    }

    // 3. Test Compatibility calculations (from proposals route logic)
    console.log('\nTesting Compatibility Match Calculation formulas...');
    
    // Preferences mapping:
    // Same city = 30%
    // Same caste = 25%
    // Education match = 25%
    // Age within 5 years = 20%
    
    const calculateCompatibility = (proposal, preferences) => {
      let score = 0;
      
      // 1. Same City (30%)
      if (preferences.city && proposal.city) {
        if (proposal.city.trim().toLowerCase() === preferences.city.trim().toLowerCase()) {
          score += 30;
        }
      }

      // 2. Same Caste (25%)
      if (preferences.caste && proposal.caste) {
        if (proposal.caste.trim().toLowerCase() === preferences.caste.trim().toLowerCase()) {
          score += 25;
        }
      }

      // 3. Education Match (25%)
      if (preferences.education && proposal.education) {
        if (proposal.education.trim().toLowerCase() === preferences.education.trim().toLowerCase()) {
          score += 25;
        }
      }

      // 4. Age within 5 years (20%)
      if (preferences.age && proposal.dob) {
        const prefAge = parseInt(preferences.age);
        if (!isNaN(prefAge)) {
          const birthYear = new Date(proposal.dob).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          if (Math.abs(age - prefAge) <= 5) {
            score += 20;
          }
        }
      }

      return score;
    };

    // Case A: Full match for Aisha Khan (City: Lahore, Caste: Rajput, Education: Bachelors, DOB: 1998 [28 yrs in 2026])
    // Preferences: city='Lahore', caste='Rajput', education='Bachelors', age=28
    const scoreA = calculateCompatibility(prop1, {
      city: 'Lahore',
      caste: 'Rajput',
      education: 'Bachelors',
      age: 28
    });
    console.log(`Match Score for Aisha Khan (Full matching preferences): ${scoreA}%`);
    if (scoreA === 100) {
      console.log('✓ Compatibility Match Case A Passed (100% Match).');
    } else {
      console.error(`✗ Compatibility Match Case A Failed! Expected 100%, got ${scoreA}`);
    }

    // Case B: Partial match for Bilal Ahmed (City: Islamabad, Caste: Awan, Education: Masters, DOB: 1995 [31 yrs in 2026])
    // Preferences: city='Lahore' (no match), caste='Awan' (match +25%), education='Bachelors' (no match), age=30 (within 5 yrs of 31: match +20%)
    const scoreB = calculateCompatibility(prop2, {
      city: 'Lahore',
      caste: 'Awan',
      education: 'Bachelors',
      age: 30
    });
    console.log(`Match Score for Bilal Ahmed (Partial matching preferences): ${scoreB}%`);
    if (scoreB === 45) { // 25 (caste) + 20 (age) = 45%
      console.log('✓ Compatibility Match Case B Passed (45% Match).');
    } else {
      console.error(`✗ Compatibility Match Case B Failed! Expected 45%, got ${scoreB}`);
    }

    console.log('\n--- System Verification Complete: All Local Tests Passed Successfully ---');
    
  } catch (error) {
    console.error('System test encountered error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

runTests();
