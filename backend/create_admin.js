const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected.');

    let admin = await Admin.findOne({ username: 'admin' });

    if (admin) {
      console.log('Admin user found. Updating password to "admin123"...');
      admin.password = 'admin123';
      await admin.save();
      console.log('Password updated successfully.');
    } else {
      console.log('Admin user not found. Creating default admin...');
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        role: 'SuperAdmin'
      });
      console.log('Admin user created successfully.');
    }

    let staff = await Admin.findOne({ username: 'staff' });
    if (staff) {
      console.log('Staff user found. Updating password to "staff123"...');
      staff.password = 'staff123';
      await staff.save();
      console.log('Staff password updated successfully.');
    } else {
      console.log('Staff user not found. Creating default staff...');
      await Admin.create({
        username: 'staff',
        password: 'staff123',
        role: 'Employee'
      });
      console.log('Staff user created successfully.');
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

createAdmin();
