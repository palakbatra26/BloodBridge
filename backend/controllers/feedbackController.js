const Feedback = require('../models/Feedback');

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { targetType, targetId, targetName, rating, review, category } = req.body;
    const userId = req.user.id;
    const userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Anonymous';
    const userEmail = req.user.email;

    if (!targetType || !rating || !review || !targetName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this target
    const existingFeedback = await Feedback.findOne({ userId, targetType, targetId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already reviewed this item. Please edit or delete your existing review.' });
    }

    const feedback = new Feedback({
      userId,
      userName,
      userEmail,
      targetType,
      targetId,
      targetName,
      rating,
      review,
      category: category || 'overall'
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get feedback by target
exports.getFeedbackByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    
    const query = { targetType };
    if (targetId && targetId !== 'platform') {
      query.targetId = targetId;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    const ratingDistribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length
    };

    res.json({
      feedbacks,
      stats: {
        total: feedbacks.length,
        averageRating: avgRating.toFixed(1),
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's feedback
exports.getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const feedbacks = await Feedback.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark feedback as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Marked as helpful', feedback });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const feedback = await Feedback.findOne({ _id: id, userId });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or you do not have permission to delete it' });
    }

    await Feedback.findByIdAndDelete(id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, review, category } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedback = await Feedback.findOne({ _id: id, userId });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or you do not have permission to edit it' });
    }

    if (rating) feedback.rating = rating;
    if (review) feedback.review = review;
    if (category) feedback.category = category;

    await feedback.save();
    res.json({ message: 'Feedback updated successfully', feedback });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
