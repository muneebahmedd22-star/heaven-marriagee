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

    const username = 'admin';
    const password = 'admin123';

    let admin = await Admin.findOne({ username });

    if (admin) {
      console.log('Admin user found. Updating password to "admin123"...');
      admin.password = password;
      await admin.save();
      console.log('Password updated successfully.');
    } else {
      console.log('Admin user not found. Creating default admin...');
      await Admin.create({
        username,
        password,
        role: 'SuperAdmin'
      });
      console.log('Admin user created successfully.');
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
