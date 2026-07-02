const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const proposals = require('./routes/proposals');
const employees = require('./routes/employees');
const inquiries = require('./routes/inquiries');
const registrations = require('./routes/registrations');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/proposals', proposals);
app.use('/api/v1/employees', employees);
app.use('/api/v1/inquiries', inquiries);
app.use('/api/v1/registrations', registrations);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Heaven Marriage Bureau API' });
});

// Auto-seed a default SuperAdmin if DB is empty
const seedDefaultAdmin = async () => {
  try {
    let admin = await Admin.findOne({ username: 'admin' });
    if (!admin) {
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        role: 'SuperAdmin'
      });
      console.log('Default Admin Account Created: admin / admin123');
    } else {
      admin.password = 'admin123';
      await admin.save();
      console.log('Default Admin Account verified and password updated.');
    }

    let staff = await Admin.findOne({ username: 'staff' });
    if (!staff) {
      await Admin.create({
        username: 'staff',
        password: 'staff123',
        role: 'Employee'
      });
      console.log('Default Staff Account Created: staff / staff123');
    } else {
      staff.password = 'staff123';
      await staff.save();
      console.log('Default Staff Account verified and password updated.');
    }
  } catch (error) {
    console.error('Error seeding default admin & staff:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running in development mode on port ${PORT}`);
  await seedDefaultAdmin();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
