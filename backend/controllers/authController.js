const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Handle user signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType, bloodType, age, hospitalName, licenseNumber,
      dateOfBirth, gender, weight, address, city, state, pincode, medicalHistory, lastDonation, emergencyContact, emergencyPhone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      password: hashedPassword, 
      userType,
      bloodType,
      age,
      hospitalName,
      licenseNumber,
      dateOfBirth,
      gender,
      weight,
      address,
      city,
      state,
      pincode,
      medicalHistory,
      lastDonation,
      emergencyContact,
      emergencyPhone
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error during signup', error: error.message });
  }
};

// Handle user signin
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({ 
      message: 'User signed in successfully',
      token,
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Error during signin', error: error.message });
  }
};

// Handle donor registration
const registerDonor = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, bloodType, gender, weight, address, city, state, pincode, 
      medicalHistory, lastDonation, emergencyContact, emergencyPhone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Calculate age from date of birth
    const birthDate = new Date(dateOfBirth);
    const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    // Hash phone as temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(phone, salt);
    
    // Create new donor user
    const donor = new User({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      password: hashedPassword,
      userType: 'donor',
      bloodType,
      age,
      dateOfBirth,
      gender,
      weight,
      address,
      city,
      state,
      pincode,
      medicalHistory,
      lastDonation: lastDonation ? new Date(lastDonation) : null,
      emergencyContact,
      emergencyPhone
    });
    
    await donor.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: donor._id, email: donor.email, userType: donor.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: 'Donor registered successfully',
      token,
      donor: { 
        id: donor._id,
        firstName: donor.firstName,
        lastName: donor.lastName,
        email: donor.email,
        phone: donor.phone,
        bloodType: donor.bloodType,
        userType: donor.userType
      }
    });
  } catch (error) {
    console.error('Error during donor registration:', error);
    res.status(500).json({ message: 'Error during donor registration', error: error.message });
  }
};

module.exports = {
  signup,
  signin,
  registerDonor
};