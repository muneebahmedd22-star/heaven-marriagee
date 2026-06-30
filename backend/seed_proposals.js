const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Proposal = require('./models/Proposal');
const Counter = require('./models/Counter');

// Load environment variables
dotenv.config();

const dummyProposals = [
  {
    fullName: 'Aisha Khan',
    gender: 'Female',
    maritalStatus: 'Never Married',
    dob: new Date('2000-05-15'), // 26 years old
    education: 'Bachelors in Graphic Design',
    occupation: 'UI/UX Designer',
    caste: 'Rajput',
    religion: 'Islam',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    aboutMe: 'Loving, family-oriented girl working at a tech company. Looking for an educated, well-settled life partner.',
    contactDetails: { phone: '+923007654321', email: 'aisha@example.com' },
    isFeatured: true,
    category: 'Other Educated',
    region: 'Lahore'
  },
  {
    fullName: 'Bilal Ahmed',
    gender: 'Male',
    maritalStatus: 'Never Married',
    dob: new Date('1995-10-22'), // 31 years old
    education: 'Masters in Computer Science',
    occupation: 'Senior Software Engineer',
    caste: 'Awan',
    religion: 'Islam',
    city: 'Islamabad',
    state: 'Federal',
    country: 'Pakistan',
    aboutMe: 'Software professional based in Islamabad. Values family tradition and modern growth. Looking for an educated girl.',
    contactDetails: { phone: '+923001112223', email: 'bilal@example.com' },
    isFeatured: true,
    category: 'Engineer',
    region: 'Islamabad/Rawalpindi'
  },
  {
    fullName: 'Fatima Ali',
    gender: 'Female',
    maritalStatus: 'Never Married',
    dob: new Date('2002-02-14'), // 24 years old
    education: 'Bachelors in English Literature',
    occupation: 'High School Teacher',
    caste: 'Syed',
    religion: 'Islam',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    aboutMe: 'Down-to-earth person who loves teaching. Looking for a family-oriented partner with good moral values.',
    contactDetails: { phone: '+923214567890', email: 'fatima@example.com' },
    isFeatured: false,
    category: 'Other Educated',
    region: 'Karachi'
  },
  {
    fullName: 'Muhammad Zain',
    gender: 'Male',
    maritalStatus: 'Never Married',
    dob: new Date('1998-08-05'), // 28 years old
    education: 'Masters in Business Administration',
    occupation: 'Marketing Manager',
    caste: 'Butt',
    religion: 'Islam',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    aboutMe: 'Working in a multinational firm in Lahore. Enjoys travel and fitness. Seeking a compatible partner.',
    contactDetails: { phone: '+923338765432', email: 'zain@example.com' },
    isFeatured: true,
    category: 'Other Educated',
    region: 'Lahore'
  },
  {
    fullName: 'Sana Yousuf',
    gender: 'Female',
    maritalStatus: 'Divorced',
    dob: new Date('1997-12-30'), // 29 years old
    education: 'Bachelors in Finance',
    occupation: 'Bank Analyst',
    caste: 'Sheikh',
    religion: 'Islam',
    city: 'Rawalpindi',
    state: 'Punjab',
    country: 'Pakistan',
    aboutMe: 'Working professional in Rawalpindi. Looking for a mature, understanding partner to restart life with.',
    contactDetails: { phone: '+923451234567', email: 'sana@example.com' },
    isFeatured: false,
    category: '2nd Marriage',
    region: 'Islamabad/Rawalpindi'
  },
  {
    fullName: 'Hamza Riaz',
    gender: 'Male',
    maritalStatus: 'Never Married',
    dob: new Date('1999-04-12'), // 27 years old
    education: 'Bachelors in Agriculture',
    occupation: 'Farm Manager & Business Owner',
    caste: 'Gujjar',
    religion: 'Islam',
    city: 'Faisalabad',
    state: 'Punjab',
    country: 'Pakistan',
    aboutMe: 'Manages family agricultural farms. Enjoys simple living. Looking for a simple, caring life partner.',
    contactDetails: { phone: '+923029876543', email: 'hamza@example.com' },
    isFeatured: false,
    category: 'Other Educated',
    region: 'Punjab Other Cities'
  },
  {
    fullName: 'Maria Tariq',
    gender: 'Female',
    maritalStatus: 'Never Married',
    dob: new Date('2001-09-08'), // 25 years old
    education: 'PharmD (Doctor of Pharmacy)',
    occupation: 'Clinical Pharmacist',
    caste: 'Rajput',
    religion: 'Islam',
    city: 'Multan',
    state: 'Punjab',
    country: 'Pakistan',
    aboutMe: 'Professional clinical pharmacist based in Multan. Values family respect and career. Looking for an educated groom.',
    contactDetails: { phone: '+923123456789', email: 'maria@example.com' },
    isFeatured: false,
    category: 'Doctor',
    region: 'South Punjab'
  },
  {
    fullName: 'Usman Khalid',
    gender: 'Male',
    maritalStatus: 'Widowed',
    dob: new Date('1991-03-20'), // 35 years old
    education: 'PhD in Education',
    occupation: 'University Professor',
    caste: 'Pashtun',
    religion: 'Islam',
    city: 'Peshawar',
    state: 'KPK',
    country: 'Pakistan',
    aboutMe: 'Respectable academician based in Peshawar. Looking for a kind, educated partner who can merge into my family.',
    contactDetails: { phone: '+923345556667', email: 'usman@example.com' },
    isFeatured: false,
    category: 'Late Marriage',
    region: 'KPK'
  },
  {
    fullName: 'Zara Naqvi',
    gender: 'Female',
    maritalStatus: 'Never Married',
    dob: new Date('1999-11-11'), // 27 years old
    education: 'MBBS (Medicine & Surgery)',
    occupation: 'Resident Doctor',
    caste: 'Syed',
    religion: 'Islam',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    aboutMe: 'Working at a public sector hospital in Lahore. Looking for a doctor or highly educated professional groom.',
    contactDetails: { phone: '+923004443332', email: 'zara@example.com' },
    isFeatured: false,
    category: 'Doctor',
    region: 'Lahore'
  },
  {
    fullName: 'Ali Raza',
    gender: 'Male',
    maritalStatus: 'Never Married',
    dob: new Date('1997-01-25'), // 29 years old
    education: 'MBA in Marketing',
    occupation: 'Digital Marketing Lead',
    caste: 'Jatoi',
    religion: 'Islam',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    aboutMe: 'Dynamic professional in Karachi corporate sector. Enjoys music and books. Seeking a smart, progressive girl.',
    contactDetails: { phone: '+923223334445', email: 'ali@example.com' },
    isFeatured: false,
    category: 'Ahle Tashi',
    region: 'Karachi'
  }
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    // Clear existing proposals & counters
    console.log('Clearing old proposals...');
    await Proposal.deleteMany({});
    await Counter.deleteMany({ id: 'profileId' });
    console.log('Collections cleared.');

    // Save one-by-one so pre-save hook auto-increments HMB00001 correctly
    console.log('Inserting 10 sample dummy proposals...');
    for (const prop of dummyProposals) {
      const created = await Proposal.create(prop);
      console.log(`Successfully created profile: ${created.fullName} (${created.profileId})`);
    }

    console.log('--- Database Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  }
}

seedData();
