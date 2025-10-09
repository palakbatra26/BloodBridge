const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Look for the user with the specific email
    const email = 'palakbatra79@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.firstName, user.lastName);
      console.log('- Email:', user.email);
      console.log('- Phone:', user.phone);
      console.log('- Current User Type:', user.userType);
      
      // Update user type to admin
      user.userType = 'admin';
      await user.save();
      
      console.log('User type updated to admin successfully!');
    } else {
      console.log('No user found with email:', email);
      console.log('Creating new admin user...');
      
      // Create new admin user if not found
      const newUser = new User({
        firstName: 'Palak',
        lastName: 'Batra',
        email: 'palakbatra79@gmail.com',
        phone: '7986904164',
        password: 'admin123', // This will be hashed automatically
        userType: 'admin'
      });
      
      await newUser.save();
      console.log('New admin user created successfully!');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });