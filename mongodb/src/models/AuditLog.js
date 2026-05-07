const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  actor: {
    type: String,
    required: true,
    index: true // e.g., 'user:<githubId>', 'system:ai-agent', 'service:gateway'
  },
  target: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true // Prevent modification
  }
}, { timestamps: false });

// Prevent updates to audit logs (immutable)
auditLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error('Audit logs cannot be modified'));
});
auditLogSchema.pre('updateOne', function(next) {
  next(new Error('Audit logs cannot be modified'));
});
auditLogSchema.pre('remove', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});
auditLogSchema.pre('deleteOne', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
