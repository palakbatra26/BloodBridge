const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Test signin with the new admin user
    const { email, password } = {
      email: 'admin@bloodbridge.com',
      password: 'admin123'
    };
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      mongoose.connection.close();
      return;
    }
    
    console.log('User found:');
    console.log('- ID:', user._id);
    console.log('- Name:', user.firstName, user.lastName);
    console.log('- Email:', user.email);
    console.log('- User Type:', user.userType);
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (isMatch) {
      console.log('Login successful!');
    } else {
      console.log('Invalid credentials');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });