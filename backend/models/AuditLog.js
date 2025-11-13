const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['admin', 'user', 'security', 'data'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  targetId: {
    type: String // ID of the affected resource
  },
  targetType: {
    type: String // Type of the affected resource (camp, user, etc.)
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Additional data
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ type: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

// Static method to log an action
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const log = new this(actionData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging action:', error);
    return null;
  }
};

// Static method to get logs by type
auditLogSchema.statics.getLogsByType = async function(type, limit = 50) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

// Static method to get recent logs
auditLogSchema.statics.getRecentLogs = async function(limit = 100) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);