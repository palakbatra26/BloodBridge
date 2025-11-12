const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['hospital', 'camp', 'platform'],
    required: true
  },
  targetId: {
    type: String,
    required: function() {
      return this.targetType !== 'platform';
    }
  },
  targetName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['service', 'cleanliness', 'staff', 'facilities', 'overall'],
    default: 'overall'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

feedbackSchema.index({ targetType: 1, targetId: 1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
