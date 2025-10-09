const mongoose = require('mongoose');
require('dotenv').config();

// Import the BloodCamp model
const BloodCamp = require('./models/BloodCamp');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Count camps before deletion
    const campCountBefore = await BloodCamp.countDocuments();
    console.log(`Found ${campCountBefore} blood camps in the database`);
    
    if (campCountBefore > 0) {
      // Delete all camps
      const result = await BloodCamp.deleteMany({});
      console.log(`Deleted ${result.deletedCount} blood camps`);
    } else {
      console.log('No blood camps found to delete');
    }
    
    // Count camps after deletion
    const campCountAfter = await BloodCamp.countDocuments();
    console.log(`Remaining blood camps in database: ${campCountAfter}`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });