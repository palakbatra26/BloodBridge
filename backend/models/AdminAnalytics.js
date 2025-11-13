const mongoose = require('mongoose');

const adminAnalyticsSchema = new mongoose.Schema({
  totalDonors: {
    type: Number,
    default: 0
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  totalCamps: {
    type: Number,
    default: 0
  },
  activeCamps: {
    type: Number,
    default: 0
  },
  urgentRequests: {
    type: Number,
    default: 0
  },
  hospitalPartners: {
    type: Number,
    default: 0
  },
  bloodUnitsCollected: {
    type: Number,
    default: 0
  },
  donorGrowth: {
    type: String,
    default: "0%"
  },
  campGrowth: {
    type: String,
    default: "0%"
  },
  donationGrowth: {
    type: String,
    default: "0%"
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get or create analytics
adminAnalyticsSchema.statics.getAnalytics = async function() {
  let analytics = await this.findOne();
  if (!analytics) {
    analytics = await this.create({});
  }
  return analytics;
};

// Method to update analytics
adminAnalyticsSchema.methods.updateAnalytics = async function() {
  const BloodCamp = require('./BloodCamp');
  const User = require('./User');
  
  try {
    // Count total camps
    const totalCamps = await BloodCamp.countDocuments();
    const activeCamps = await BloodCamp.countDocuments({ 
      status: 'approved',
      date: { $gte: new Date() }
    });
    
    // Count total donors (users with role 'donor')
    const totalDonors = await User.countDocuments({ role: 'donor' });
    
    // Calculate growth (simplified - you can make this more sophisticated)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newDonorsThisMonth = await User.countDocuments({ 
      role: 'donor',
      createdAt: { $gte: lastMonth }
    });
    const newCampsThisMonth = await BloodCamp.countDocuments({ 
      createdAt: { $gte: lastMonth }
    });
    
    const donorGrowthPercent = totalDonors > 0 ? ((newDonorsThisMonth / totalDonors) * 100).toFixed(1) : 0;
    const campGrowthPercent = totalCamps > 0 ? ((newCampsThisMonth / totalCamps) * 100).toFixed(1) : 0;
    
    // Update analytics
    this.totalDonors = totalDonors;
    this.totalCamps = totalCamps;
    this.activeCamps = activeCamps;
    this.totalDonations = Math.floor(totalDonors * 1.8); // Estimate
    this.bloodUnitsCollected = Math.floor(totalDonors * 2.1); // Estimate
    this.urgentRequests = Math.floor(Math.random() * 10) + 3; // Random for demo
    this.hospitalPartners = 156; // Static for now
    this.donorGrowth = `+${donorGrowthPercent}%`;
    this.campGrowth = `+${campGrowthPercent}%`;
    this.donationGrowth = `+${(parseFloat(donorGrowthPercent) * 1.2).toFixed(1)}%`;
    this.lastUpdated = new Date();
    
    await this.save();
    return this;
  } catch (error) {
    console.error('Error updating analytics:', error);
    return this;
  }
};

module.exports = mongoose.model('AdminAnalytics', adminAnalyticsSchema);