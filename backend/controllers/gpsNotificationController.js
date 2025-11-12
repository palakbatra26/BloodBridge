const Notification = require('../models/Notification');
const BloodCamp = require('../models/BloodCamp');
const User = require('../models/User');

// Create GPS-based notification
exports.createGPSNotification = async (req, res) => {
  try {
    const { campId, radius = 10 } = req.body; // radius in km
    
    const camp = await BloodCamp.findById(campId);
    if (!camp) {
      return res.status(404).json({ message: 'Camp not found' });
    }

    // In a real implementation, you would:
    // 1. Get users with location preferences
    // 2. Calculate distance from camp location
    // 3. Send notifications to nearby users
    
    const notification = {
      type: 'camp_nearby',
      title: 'Blood Donation Camp Near You!',
      message: `${camp.name} is happening at ${camp.location}. Join us and save lives!`,
      campId: camp._id,
      location: {
        type: 'Point',
        coordinates: camp.coordinates || [0, 0],
        address: camp.location
      },
      priority: 'high',
      expiresAt: new Date(camp.date)
    };

    res.json({ message: 'GPS notification created', notification });
  } catch (error) {
    console.error('Create GPS notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const notifications = await Notification.find({ userId })
      .populate('campId')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get nearby camps based on user location
exports.getNearbyCamps = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const camps = await BloodCamp.find({
      status: 'approved',
      date: { $gte: new Date() }
    });

    // In a real implementation with geospatial queries:
    // const camps = await BloodCamp.find({
    //   location: {
    //     $near: {
    //       $geometry: { type: 'Point', coordinates: [longitude, latitude] },
    //       $maxDistance: radius * 1000
    //     }
    //   }
    // });

    res.json({ camps });
  } catch (error) {
    console.error('Get nearby camps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
