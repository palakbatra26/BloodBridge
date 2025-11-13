const mongoose = require('mongoose');
const CampRating = require('../models/CampRating');
const BloodCamp = require('../models/BloodCamp');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedFeedbackData() {
  try {
    console.log('🌱 Seeding feedback data...');
    
    // Get existing camps
    const camps = await BloodCamp.find({ status: 'approved' }).limit(5);
    
    if (camps.length === 0) {
      console.log('No approved camps found. Please add some camps first.');
      return;
    }
    
    // Clear existing ratings
    await CampRating.deleteMany({});
    
    // Sample user IDs (you can replace these with actual user IDs from your database)
    const sampleUserIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
    ];
    
    const sampleRatings = [];
    
    // Create ratings for each camp
    for (const camp of camps) {
      // Generate 3-5 ratings per camp
      const numRatings = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numRatings; i++) {
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
        const feedbacks = [
          'Great organization and friendly staff!',
          'Well managed camp, smooth process.',
          'Could improve waiting time.',
          'Excellent experience, will donate again.',
          'Good facilities and professional team.',
          'Quick and efficient process.',
          'Staff was very helpful and caring.',
          'Clean environment and good organization.'
        ];
        
        sampleRatings.push({
          campId: camp._id,
          userId: sampleUserIds[i % sampleUserIds.length],
          rating: rating,
          feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
          attendedCamp: true
        });
      }
    }
    
    // Insert sample ratings
    await CampRating.insertMany(sampleRatings);
    
    console.log(`✅ Successfully seeded ${sampleRatings.length} feedback entries`);
    
    // Display stats
    const stats = await CampRating.getFeedbackStats();
    console.log('📊 Feedback Statistics:');
    console.log(`Total Ratings: ${stats.totalRatings}`);
    console.log(`Average Rating: ${stats.averageRating.toFixed(1)}/5`);
    console.log(`Positive Ratings: ${stats.positiveRatings} (${stats.positivePercentage}%)`);
    console.log(`Negative Ratings: ${stats.negativeRatings}`);
    
  } catch (error) {
    console.error('❌ Error seeding feedback data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedFeedbackData();