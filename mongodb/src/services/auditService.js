const { AuditLog } = require('../models');

class AuditService {
  async createLog(data) {
    const log = new AuditLog(data);
    return await log.save();
  }

  async getLogs(filters = {}) {
    return await AuditLog.find(filters).sort({ timestamp: -1 }).limit(100);
  }
}

module.exports = new AuditService();
