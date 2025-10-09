const mongoose = require('mongoose');

const bloodCampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: false // Make this optional since we're adding startTime and endTime
  },
  startTime: {
    type: String,
    required: false
  },
  endTime: {
    type: String,
    required: false
  },
  organizer: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String, // Changed from mongoose.Schema.Types.ObjectId to String
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodCamp', bloodCampSchema);