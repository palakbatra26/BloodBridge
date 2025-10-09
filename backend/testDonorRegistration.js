const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bloodbridge')
.then(async () => {
  console.log('MongoDB connected successfully');
  
  // Define user schema (simplified version)
  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    userType: String,
    bloodType: String,
    dateOfBirth: Date,
    gender: String,
    weight: Number,
    address: String,
    city: String,
    state: String,
    pincode: String,
    medicalHistory: String,
    lastDonation: Date,
    emergencyContact: String,
    emergencyPhone: String
  }, {
    timestamps: true
  });
  
  const User = mongoose.model('User', userSchema);
  
  // Retrieve all donors
  try {
    const donors = await User.find({ userType: 'donor' });
    console.log('All donors in database:');
    console.log(donors);
    
    if (donors.length === 0) {
      console.log('No donors found in database');
    }
  } catch (err) {
    console.error('Error retrieving donors:', err);
  } finally {
    mongoose.connection.close();
  }
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bloodbridge')
.then(async () => {
  console.log('MongoDB connected successfully');
  
  // Define user schema (simplified version)
  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    userType: String,
    bloodType: String,
    dateOfBirth: Date,
    gender: String,
    weight: Number,
    address: String,
    city: String,
    state: String,
    pincode: String,
    medicalHistory: String,
    lastDonation: Date,
    emergencyContact: String,
    emergencyPhone: String
  }, {
    timestamps: true
  });
  
  const User = mongoose.model('User', userSchema);
  
  // Retrieve all donors
  try {
    const donors = await User.find({ userType: 'donor' });
    console.log('All donors in database:');
    console.log(donors);
    
    if (donors.length === 0) {
      console.log('No donors found in database');
    }
  } catch (err) {
    console.error('Error retrieving donors:', err);
  } finally {
    mongoose.connection.close();
  }
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});