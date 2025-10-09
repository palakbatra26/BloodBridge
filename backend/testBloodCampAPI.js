// Test blood camp API
const mongoose = require('mongoose');
require('dotenv').config();

// Import the BloodCamp model
const BloodCamp = require('./models/BloodCamp');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Test creating a blood camp
    const camp = new BloodCamp({
      name: "Test Blood Camp",
      location: "123 Main Street, City",
      date: new Date(),
      time: "10:00",
      organizer: "Test Organization",
      contactEmail: "test@example.com",
      contactPhone: "1234567890",
      description: "This is a test blood camp for development purposes",
      imageUrl: "https://example.com/image.jpg",
      createdBy: "68e24d704f4939954f27b98a" // Example user ID
    });
    
    await camp.save();
    console.log('Blood camp created successfully:', camp);
    
    // Test fetching all blood camps
    const camps = await BloodCamp.find();
    console.log('Total blood camps:', camps.length);
    
    // Test updating a blood camp
    const updatedCamp = await BloodCamp.findByIdAndUpdate(
      camp._id,
      { name: "Updated Test Blood Camp" },
      { new: true }
    );
    console.log('Blood camp updated successfully:', updatedCamp);
    
    // Test deleting a blood camp
    await BloodCamp.findByIdAndDelete(camp._id);
    console.log('Blood camp deleted successfully');
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    mongoose.connection.close();
  });