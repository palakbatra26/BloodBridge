const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Delete existing admin user if exists
    await User.deleteOne({ email: 'admin@bloodbridge.com' });
    
    // Create new admin user
    const newUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bloodbridge.com',
      phone: '1234567890',
      password: 'admin123', // This will be hashed automatically by the pre-save hook
      userType: 'admin'
    });
    
    await newUser.save();
    console.log('New admin user created successfully!');
    console.log('- Email: admin@bloodbridge.com');
    console.log('- Password: admin123');
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });