const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Look for the user with the specific email
    const email = 'priyabatra13july@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.firstName, user.lastName);
      console.log('- Email:', user.email);
      console.log('- User Type:', user.userType);
      console.log('- Created At:', user.createdAt);
    } else {
      console.log('No user found with email:', email);
    }
    
    // Also check how many users exist in total
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });