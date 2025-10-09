const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Test finding the admin user
    const user = await User.findOne({ email: 'palakbatra79@gmail.com' });
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.firstName, user.lastName);
      console.log('- Email:', user.email);
      console.log('- User Type:', user.userType);
      console.log('- Password hash:', user.password.substring(0, 20) + '...');
      
      // Test password comparison
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log('Password match with "admin123":', isMatch);
      
      const isMatch2 = await bcrypt.compare('testpassword', user.password);
      console.log('Password match with "testpassword":', isMatch2);
    } else {
      console.log('No user found with email: palakbatra79@gmail.com');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });