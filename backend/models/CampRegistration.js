const mongoose = require('mongoose');

const campRegistrationSchema = new mongoose.Schema({
  camp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodCamp',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made this optional
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  emergencyContact: {
    type: String,
    required: false
  },
  emergencyPhone: {
    type: String,
    required: false
  },
  medicalHistory: {
    type: String,
    required: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CampRegistration', campRegistrationSchema);