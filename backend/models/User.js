const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['donor', 'recipient', 'hospital', 'admin']
  },
  bloodType: {
    type: String,
    required: false,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  age: {
    type: Number,
    required: false
  },
  hospitalName: {
    type: String,
    required: false
  },
  licenseNumber: {
    type: String,
    required: false
  },
  // Donor-specific fields
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    required: false,
    enum: ['male', 'female', 'other']
  },
  weight: {
    type: Number,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  pincode: {
    type: String,
    required: false
  },
  medicalHistory: {
    type: String,
    required: false
  },
  lastDonation: {
    type: Date,
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
  // Password reset fields
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpires: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);