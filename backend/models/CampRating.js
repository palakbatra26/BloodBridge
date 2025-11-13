const mongoose = require('mongoose');

const campRatingSchema = new mongoose.Schema({
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodCamp',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  attendedCamp: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate ratings from same user for same camp
campRatingSchema.index({ campId: 1, userId: 1 }, { unique: true });

// Static method to get average rating for a camp
campRatingSchema.statics.getAverageRating = async function(campId) {
  const result = await this.aggregate([
    { $match: { campId: mongoose.Types.ObjectId(campId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalRatings: 0 };
};

// Static method to get overall feedback statistics
campRatingSchema.statics.getFeedbackStats = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        positiveRatings: {
          $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] }
        },
        negativeRatings: {
          $sum: { $cond: [{ $lt: ['$rating', 3] }, 1, 0] }
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      positiveRatings: 0,
      negativeRatings: 0,
      positivePercentage: 0
    };
  }
  
  const stats = result[0];
  stats.positivePercentage = stats.totalRatings > 0 
    ? Math.round((stats.positiveRatings / stats.totalRatings) * 100) 
    : 0;
  
  return stats;
};

module.exports = mongoose.model('CampRating', campRatingSchema);