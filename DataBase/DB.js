const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
  
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDB;