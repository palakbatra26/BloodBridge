const CampRegistration = require('../models/CampRegistration');
const BloodCamp = require('../models/BloodCamp');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all blood camps (public endpoint)
const getAllBloodCamps = async (req, res) => {
  try {
    const camps = await BloodCamp.find().sort({ date: 1 }); // Sort by date ascending
    res.status(200).json(camps);
  } catch (error) {
    console.error('Error fetching blood camps:', error);
    res.status(500).json({ message: 'Error fetching blood camps', error: error.message });
  }
};

// Register a user for a blood camp
const registerForCamp = async (req, res) => {
  try {
    const { campId, firstName, lastName, email, phone, bloodType, age, emergencyContact, emergencyPhone, medicalHistory } = req.body;
    
    // Validate camp ID
    if (!campId || !mongoose.Types.ObjectId.isValid(campId)) {
      return res.status(400).json({ message: 'Valid camp ID is required' });
    }
    
    // Check if camp exists
    const camp = await BloodCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }
    
    // Check if user is already registered for this camp
    const existingRegistration = await CampRegistration.findOne({ camp: campId, email });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this camp' });
    }
    
    // Create registration
    const registration = new CampRegistration({
      camp: campId,
      user: req.user ? req.user.userId : null, // If user is logged in, associate with their account
      firstName,
      lastName,
      email,
      phone,
      bloodType,
      age,
      emergencyContact,
      emergencyPhone,
      medicalHistory
    });
    
    await registration.save();
    
    res.status(201).json({
      message: 'Successfully registered for the blood camp',
      registration
    });
  } catch (error) {
    console.error('Error registering for camp:', error);
    res.status(500).json({ message: 'Error registering for camp', error: error.message });
  }
};

// Get all registrations for a specific camp
const getCampRegistrations = async (req, res) => {
  try {
    const { campId } = req.params;
    
    // Validate camp ID
    if (!campId || !mongoose.Types.ObjectId.isValid(campId)) {
      return res.status(400).json({ message: 'Valid camp ID is required' });
    }
    
    // Check if camp exists
    const camp = await BloodCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }
    
    // Get all registrations for this camp
    const registrations = await CampRegistration.find({ camp: campId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching camp registrations:', error);
    res.status(500).json({ message: 'Error fetching camp registrations', error: error.message });
  }
};

// Get registration details by ID
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate registration ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Valid registration ID is required' });
    }
    
    // Get registration
    const registration = await CampRegistration.findById(id)
      .populate('camp', 'name location date time')
      .populate('user', 'firstName lastName email');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.status(200).json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ message: 'Error fetching registration', error: error.message });
  }
};

// Update registration status (for admin use)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate registration ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Valid registration ID is required' });
    }
    
    // Validate status
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Update registration
    const registration = await CampRegistration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.status(200).json({
      message: 'Registration status updated successfully',
      registration
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ message: 'Error updating registration status', error: error.message });
  }
};

// Delete registration
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate registration ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Valid registration ID is required' });
    }
    
    // Delete registration
    const registration = await CampRegistration.findByIdAndDelete(id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.status(200).json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ message: 'Error deleting registration', error: error.message });
  }
};

module.exports = {
  getAllBloodCamps,
  registerForCamp,
  getCampRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration
};