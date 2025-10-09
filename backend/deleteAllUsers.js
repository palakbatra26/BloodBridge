const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Count users before deletion
    const userCountBefore = await User.countDocuments();
    console.log(`Found ${userCountBefore} users in the database`);
    
    if (userCountBefore > 0) {
      // Delete all users
      const result = await User.deleteMany({});
      console.log(`Deleted ${result.deletedCount} users`);
    } else {
      console.log('No users found to delete');
    }
    
    // Count users after deletion
    const userCountAfter = await User.countDocuments();
    console.log(`Remaining users in database: ${userCountAfter}`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });