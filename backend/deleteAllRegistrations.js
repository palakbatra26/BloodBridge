const mongoose = require('mongoose');
require('dotenv').config();

// Import the CampRegistration model
const CampRegistration = require('./models/CampRegistration');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Count registrations before deletion
    const regCountBefore = await CampRegistration.countDocuments();
    console.log(`Found ${regCountBefore} camp registrations in the database`);
    
    if (regCountBefore > 0) {
      // Delete all registrations
      const result = await CampRegistration.deleteMany({});
      console.log(`Deleted ${result.deletedCount} camp registrations`);
    } else {
      console.log('No camp registrations found to delete');
    }
    
    // Count registrations after deletion
    const regCountAfter = await CampRegistration.countDocuments();
    console.log(`Remaining camp registrations in database: ${regCountAfter}`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });