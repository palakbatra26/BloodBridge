const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'palakbatra79@gmail.com' });
    
    // Create new admin user with correct password
    const newUser = new User({
      firstName: 'Palak',
      lastName: 'Batra',
      email: 'palakbatra79@gmail.com',
      phone: '7986904164',
      password: 'admin123', // This will be hashed automatically by the pre-save hook
      userType: 'admin'
    });
    
    await newUser.save();
    console.log('Admin user recreated successfully!');
    console.log('- Email: palakbatra79@gmail.com');
    console.log('- Password: admin123');
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });