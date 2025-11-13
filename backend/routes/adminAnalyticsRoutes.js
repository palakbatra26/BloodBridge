const express = require('express');
const router = express.Router();
const AdminAnalytics = require('../models/AdminAnalytics');
const AuditLog = require('../models/AuditLog');
const BulkOperation = require('../models/BulkOperation');
const BloodCamp = require('../models/BloodCamp');
const User = require('../models/User');
const CampRating = require('../models/CampRating');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get admin analytics/dashboard data
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let analytics = await AdminAnalytics.getAnalytics();
    
    // Update analytics if it's been more than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (analytics.lastUpdated < oneHourAgo) {
      analytics = await analytics.updateAnalytics();
    }
    
    // Log the action
    await AuditLog.logAction({
      action: 'Dashboard Viewed',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: 'Admin viewed dashboard analytics',
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get audit logs
router.get('/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    
    let logs;
    if (type && type !== 'all') {
      logs = await AuditLog.getLogsByType(type, parseInt(limit));
    } else {
      logs = await AuditLog.getRecentLogs(parseInt(limit));
    }
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Export audit logs
router.get('/audit-logs/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.getRecentLogs(1000);
    
    // Log the export action
    await AuditLog.logAction({
      action: 'Audit Logs Exported',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Exported ${logs.length} audit log entries`,
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Convert to CSV format
    const csvHeader = 'Timestamp,Action,User,Details,Type,IP Address\n';
    const csvData = logs.map(log => {
      return `"${log.createdAt}","${log.action}","${log.user}","${log.details}","${log.type}","${log.ipAddress || 'N/A'}"`;
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// Bulk email operation
router.post('/bulk-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { content, targetIds } = req.body;
    
    if (!content || !targetIds || targetIds.length === 0) {
      return res.status(400).json({ error: 'Content and target IDs are required' });
    }
    
    // Create bulk operation record
    const bulkOp = new BulkOperation({
      type: 'email',
      initiatedBy: req.user.id,
      targetCount: targetIds.length,
      content,
      targetIds
    });
    await bulkOp.save();
    
    // Log the action
    await AuditLog.logAction({
      action: 'Bulk Email Sent',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Initiated bulk email to ${targetIds.length} recipients`,
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      targetId: bulkOp._id.toString(),
      targetType: 'bulk_operation'
    });
    
    // In a real implementation, you would queue this for background processing
    // For now, we'll simulate success
    bulkOp.status = 'completed';
    bulkOp.processedCount = targetIds.length;
    bulkOp.successCount = targetIds.length;
    await bulkOp.save();
    
    res.json({ 
      message: 'Bulk email operation initiated successfully',
      operationId: bulkOp._id,
      status: 'completed'
    });
  } catch (error) {
    console.error('Error initiating bulk email:', error);
    res.status(500).json({ error: 'Failed to initiate bulk email' });
  }
});

// Bulk SMS operation
router.post('/bulk-sms', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { content, targetIds } = req.body;
    
    if (!content || !targetIds || targetIds.length === 0) {
      return res.status(400).json({ error: 'Content and target IDs are required' });
    }
    
    // Create bulk operation record
    const bulkOp = new BulkOperation({
      type: 'sms',
      initiatedBy: req.user.id,
      targetCount: targetIds.length,
      content,
      targetIds
    });
    await bulkOp.save();
    
    // Log the action
    await AuditLog.logAction({
      action: 'Bulk SMS Sent',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Initiated bulk SMS to ${targetIds.length} recipients`,
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      targetId: bulkOp._id.toString(),
      targetType: 'bulk_operation'
    });
    
    // Simulate processing
    bulkOp.status = 'completed';
    bulkOp.processedCount = targetIds.length;
    bulkOp.successCount = targetIds.length;
    await bulkOp.save();
    
    res.json({ 
      message: 'Bulk SMS operation initiated successfully',
      operationId: bulkOp._id,
      status: 'completed'
    });
  } catch (error) {
    console.error('Error initiating bulk SMS:', error);
    res.status(500).json({ error: 'Failed to initiate bulk SMS' });
  }
});

// Bulk approve camps
router.post('/bulk-approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { campIds } = req.body;
    
    if (!campIds || campIds.length === 0) {
      return res.status(400).json({ error: 'Camp IDs are required' });
    }
    
    // Update camps to approved status
    const result = await BloodCamp.updateMany(
      { _id: { $in: campIds }, status: 'pending' },
      { status: 'approved' }
    );
    
    // Create bulk operation record
    const bulkOp = new BulkOperation({
      type: 'approve',
      initiatedBy: req.user.id,
      targetCount: campIds.length,
      processedCount: result.modifiedCount,
      successCount: result.modifiedCount,
      targetIds: campIds,
      status: 'completed'
    });
    await bulkOp.save();
    
    // Log the action
    await AuditLog.logAction({
      action: 'Bulk Camp Approval',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Bulk approved ${result.modifiedCount} camps`,
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      targetId: bulkOp._id.toString(),
      targetType: 'bulk_operation'
    });
    
    res.json({ 
      message: `Successfully approved ${result.modifiedCount} camps`,
      approvedCount: result.modifiedCount,
      operationId: bulkOp._id
    });
  } catch (error) {
    console.error('Error bulk approving camps:', error);
    res.status(500).json({ error: 'Failed to bulk approve camps' });
  }
});

// Export donors data
router.get('/export/donors', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' })
      .select('firstName lastName email phone bloodType createdAt')
      .sort({ createdAt: -1 });
    
    // Log the action
    await AuditLog.logAction({
      action: 'Donors Data Exported',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Exported ${donors.length} donor records`,
      type: 'data',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Convert to CSV
    const csvHeader = 'First Name,Last Name,Email,Phone,Blood Type,Registration Date\n';
    const csvData = donors.map(donor => {
      return `"${donor.firstName}","${donor.lastName}","${donor.email}","${donor.phone || 'N/A'}","${donor.bloodType || 'N/A'}","${donor.createdAt}"`;
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=donors-export.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('Error exporting donors:', error);
    res.status(500).json({ error: 'Failed to export donors data' });
  }
});

// Export camps data
router.get('/export/camps', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const camps = await BloodCamp.find()
      .select('name location date time organizer contactEmail status createdAt')
      .sort({ createdAt: -1 });
    
    // Log the action
    await AuditLog.logAction({
      action: 'Camps Data Exported',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Exported ${camps.length} camp records`,
      type: 'data',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Convert to CSV
    const csvHeader = 'Name,Location,Date,Time,Organizer,Contact Email,Status,Created Date\n';
    const csvData = camps.map(camp => {
      return `"${camp.name}","${camp.location}","${camp.date}","${camp.time}","${camp.organizer}","${camp.contactEmail}","${camp.status}","${camp.createdAt}"`;
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=camps-export.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('Error exporting camps:', error);
    res.status(500).json({ error: 'Failed to export camps data' });
  }
});

// Get bulk operation status
router.get('/bulk-operations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const operation = await BulkOperation.findById(req.params.id)
      .populate('initiatedBy', 'firstName lastName email');
    
    if (!operation) {
      return res.status(404).json({ error: 'Bulk operation not found' });
    }
    
    res.json(operation);
  } catch (error) {
    console.error('Error fetching bulk operation:', error);
    res.status(500).json({ error: 'Failed to fetch bulk operation' });
  }
});

// Get feedback statistics
router.get('/feedback-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await CampRating.getFeedbackStats();
    
    // Calculate growth (simplified - you can make this more sophisticated)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthRatings = await CampRating.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const growthPercentage = stats.totalRatings > 0 
      ? Math.round((lastMonthRatings / stats.totalRatings) * 100) 
      : 0;
    
    res.json({
      ...stats,
      growthPercentage: `+${growthPercentage}%`,
      issues: stats.negativeRatings
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch feedback stats' });
  }
});

// Get geographic distribution
router.get('/geographic-distribution', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const distribution = await BloodCamp.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: {
            $trim: {
              input: {
                $arrayElemAt: [
                  { $split: ['$location', ','] },
                  -1
                ]
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const formattedDistribution = distribution.map(item => ({
      location: item._id || 'Unknown',
      count: item.count
    }));
    
    res.json(formattedDistribution);
  } catch (error) {
    console.error('Error fetching geographic distribution:', error);
    res.status(500).json({ error: 'Failed to fetch geographic distribution' });
  }
});

// Generate monthly report
router.get('/reports/monthly', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get monthly statistics
    const monthlyStats = await Promise.all([
      BloodCamp.countDocuments({ 
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'approved'
      }),
      BloodCamp.countDocuments({ 
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'pending'
      }),
      CampRating.countDocuments({ 
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      CampRating.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);
    
    const report = {
      month: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
      approvedCamps: monthlyStats[0],
      pendingCamps: monthlyStats[1],
      totalRatings: monthlyStats[2],
      averageRating: monthlyStats[3].length > 0 ? monthlyStats[3][0].avgRating.toFixed(1) : 0,
      generatedAt: new Date().toISOString()
    };
    
    // Log the action
    await AuditLog.logAction({
      action: 'Monthly Report Generated',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Generated monthly report for ${report.month}`,
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json(report);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

// Export camps with ratings
router.get('/export/camps-with-ratings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const campsWithRatings = await BloodCamp.aggregate([
      {
        $lookup: {
          from: 'campratings',
          localField: '_id',
          foreignField: 'campId',
          as: 'ratings'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$ratings.rating' },
          totalRatings: { $size: '$ratings' }
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          date: 1,
          time: 1,
          organizer: 1,
          contactEmail: 1,
          status: 1,
          averageRating: { $ifNull: ['$averageRating', 0] },
          totalRatings: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    
    // Log the action
    await AuditLog.logAction({
      action: 'Camps with Ratings Exported',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Exported ${campsWithRatings.length} camps with rating data`,
      type: 'data',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Convert to CSV
    const csvHeader = 'Name,Location,Date,Time,Organizer,Contact Email,Status,Average Rating,Total Ratings,Created Date\n';
    const csvData = campsWithRatings.map(camp => {
      return `"${camp.name}","${camp.location}","${camp.date}","${camp.time}","${camp.organizer}","${camp.contactEmail}","${camp.status}","${camp.averageRating.toFixed(1)}","${camp.totalRatings}","${camp.createdAt}"`;
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=camps-with-ratings.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('Error exporting camps with ratings:', error);
    res.status(500).json({ error: 'Failed to export camps with ratings' });
  }
});

// Bulk approve all pending camps
router.post('/bulk-approve-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await BloodCamp.updateMany(
      { status: 'pending' },
      { status: 'approved' }
    );
    
    // Log the action
    await AuditLog.logAction({
      action: 'Bulk Approve All Camps',
      user: req.user.firstName + ' ' + req.user.lastName,
      userId: req.user.id,
      details: `Bulk approved ${result.modifiedCount} pending camps`,
      type: 'admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ 
      message: `Successfully approved ${result.modifiedCount} camps`,
      approvedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk approving all camps:', error);
    res.status(500).json({ error: 'Failed to bulk approve all camps' });
  }
});

module.exports = router;