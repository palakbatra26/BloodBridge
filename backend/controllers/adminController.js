const BloodCamp = require('../models/BloodCamp');
const mongoose = require('mongoose');

// Add a new blood camp
const addBloodCamp = async (req, res) => {
  try {
    const { name, location, date, time, startTime, endTime, organizer, contactEmail, contactPhone, description, imageUrl } = req.body;
    
    // Use the user ID from the Clerk session (which is a string, not an ObjectId)
    const createdBy = req.user.id; // This is the Clerk user ID
    
    // Format time as "startTime - endTime" if both are provided
    let formattedTime = time; // Keep existing time field for backward compatibility
    if (startTime && endTime) {
      formattedTime = `${startTime} - ${endTime}`;
    } else if (startTime) {
      formattedTime = startTime;
    }
    
    const camp = new BloodCamp({ 
      name, 
      location, 
      date, 
      time: formattedTime,
      startTime,
      endTime,
      organizer, 
      contactEmail, 
      contactPhone,
      description,
      imageUrl,
      createdBy // Store the Clerk user ID as a string
    });
    
    await camp.save();
    
    res.status(201).json({ 
      message: 'Blood camp added successfully',
      camp
    });
  } catch (error) {
    console.error('Error adding blood camp:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error adding blood camp', error: error.message });
  }
};

// Get all blood camps
const getAllBloodCamps = async (req, res) => {
  try {
    const camps = await BloodCamp.find().sort({ createdAt: -1 });
    res.status(200).json(camps);
  } catch (error) {
    console.error('Error fetching blood camps:', error);
    res.status(500).json({ message: 'Error fetching blood camps', error: error.message });
  }
};

// Update a blood camp
const updateBloodCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, date, time, startTime, endTime, organizer, contactEmail, contactPhone, description, imageUrl } = req.body;
    
    // Format time as "startTime - endTime" if both are provided
    let formattedTime = time; // Keep existing time field for backward compatibility
    if (startTime && endTime) {
      formattedTime = `${startTime} - ${endTime}`;
    } else if (startTime) {
      formattedTime = startTime;
    }
    
    const camp = await BloodCamp.findByIdAndUpdate(
      id,
      { name, location, date, time: formattedTime, startTime, endTime, organizer, contactEmail, contactPhone, description, imageUrl },
      { new: true, runValidators: true }
    );
    
    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }
    
    res.status(200).json({ 
      message: 'Blood camp updated successfully',
      camp
    });
  } catch (error) {
    console.error('Error updating blood camp:', error);
    res.status(500).json({ message: 'Error updating blood camp', error: error.message });
  }
};

// Delete a blood camp
const deleteBloodCamp = async (req, res) => {
  try {
    const { id } = req.params;
    
    const camp = await BloodCamp.findByIdAndDelete(id);
    
    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }
    
    res.status(200).json({ 
      message: 'Blood camp deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood camp:', error);
    res.status(500).json({ message: 'Error deleting blood camp', error: error.message });
  }
};

module.exports = {
  addBloodCamp,
  getAllBloodCamps,
  updateBloodCamp,
  deleteBloodCamp
};