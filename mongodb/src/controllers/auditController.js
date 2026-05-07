const { auditService } = require('../services');

const auditController = {
  async createLog(req, res, next) {
    try {
      const log = await auditService.createLog(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  },

  async getLogs(req, res, next) {
    try {
      const filters = { ...req.query };
      const logs = await auditService.getLogs(filters);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auditController;
