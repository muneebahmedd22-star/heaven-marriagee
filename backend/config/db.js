const mongoose = require('mongoose');

const DEFAULT_URI = "mongodb://muneebahmedd22_db_user:muneeb1122@ac-xkpgucz-shard-00-00.2dmaozv.mongodb.net:27017,ac-xkpgucz-shard-00-01.2dmaozv.mongodb.net:27017,ac-xkpgucz-shard-00-02.2dmaozv.mongodb.net:27017/heaven-marriage-bureau?ssl=true&replicaSet=atlas-2dv5z0-shard-0&authSource=admin&appName=heavenmarriage";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const uri = process.env.MONGODB_URI || DEFAULT_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.warn('Backend server will continue running. Please check your database connection/IP whitelist.');
  }
};

module.exports = connectDB;
