const mongoose = require('mongoose');

const bulkOperationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'sms', 'approve', 'delete', 'import', 'export'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetCount: {
    type: Number,
    default: 0
  },
  processedCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  content: {
    type: String // Email/SMS content
  },
  targetIds: [{
    type: String // IDs of target items
  }],
  results: [{
    targetId: String,
    status: String,
    error: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient querying
bulkOperationSchema.index({ initiatedBy: 1, createdAt: -1 });
bulkOperationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BulkOperation', bulkOperationSchema);