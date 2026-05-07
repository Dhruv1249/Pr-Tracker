const { repositoryService } = require('../services');
const mongoose = require('mongoose');

const repositoryController = {
  async createRepository(req, res, next) {
    console.log(`[repositoryController] createRepository: ${req.body.fullName}`);
    try {
      const repoData = { ...req.body };
      const userId = req.headers['x-user-id'];

      if (userId && !Array.isArray(userId) && mongoose.Types.ObjectId.isValid(userId)) {
        const existingUsers = Array.isArray(repoData.users) ? repoData.users : [];
        // Ensure the creating user is linked to the repo
        repoData.users = [...new Set([...existingUsers.map(String), String(userId)])];
      }

      const repository = await repositoryService.createRepository(repoData);
      res.status(201).json({ success: true, data: repository });
    } catch (error) {
      console.error(`[repositoryController] createRepository FAILED for ${req.body.fullName}: ${error.message}`);
      next(error);
    }
  },

  async getRepositoryByGithubId(req, res, next) {
    try {
      const repository = await repositoryService.findRepositoryByGithubId(req.params.githubId);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }
      const userId = req.headers['x-user-id'];
      if (userId && !repository.users.some(u => u._id.toString() === userId || u.toString() === userId)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      res.json({ success: true, data: repository });
    } catch (error) {
      next(error);
    }
  },

  async getRepositoryById(req, res, next) {
    try {
      const repository = await repositoryService.findRepositoryById(req.params.id);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }
      const userId = req.headers['x-user-id'];
      if (userId && !repository.users.some(u => u._id.toString() === userId || u.toString() === userId)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      res.json({ success: true, data: repository });
    } catch (error) {
      next(error);
    }
  },

  async updateRepository(req, res, next) {
    try {
      const repository = await repositoryService.updateRepository(req.params.githubId, req.body);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }
      res.json({ success: true, data: repository });
    } catch (error) {
      next(error);
    }
  },

  async deleteRepository(req, res, next) {
    try {
      const repository = await repositoryService.deleteRepository(req.params.githubId);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }
      res.json({ success: true, message: 'Repository deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getAllRepositories(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const filters = { ...req.query };
      if (userId && !Array.isArray(userId)) {
        filters.users = userId;
      }
      console.log(`[repositoryController] Listing repos for user: ${userId || 'all'}, filters:`, JSON.stringify(filters));
      const repositories = await repositoryService.getAllRepositories(filters);
      res.json({ success: true, data: repositories, count: repositories.length });
    } catch (error) {
      next(error);
    }
  },

  async getRepositoriesByOwner(req, res, next) {
    try {
      const repositories = await repositoryService.getRepositoriesByOwner(req.params.owner);
      res.json({ success: true, data: repositories, count: repositories.length });
    } catch (error) {
      next(error);
    }
  },

  async getRepositoryByFullName(req, res, next) {
    const fullName = decodeURIComponent(req.params.fullName);
    console.log(`[repositoryController] getRepositoryByFullName: ${fullName}`);
    try {
      const repository = await repositoryService.findRepositoryByFullName(fullName);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }
      const userId = req.headers['x-user-id'];
      if (userId && !repository.users.some(u => u._id.toString() === userId || u.toString() === userId)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      res.json({ success: true, data: repository });
    } catch (error) {
      console.error(`[repositoryController] getRepositoryByFullName FAILED for ${fullName}: ${error.message}`);
      next(error);
    }
  },


  async importRepositories(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const { repoIds } = req.body;

      if (!userId || Array.isArray(userId)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user id' });
      }

      if (!Array.isArray(repoIds) || repoIds.length === 0) {
        return res.status(400).json({ success: false, error: 'repoIds (non-empty array) is required' });
      }

      const user = await repositoryService.importRepositories(repoIds, userId);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
};

module.exports = repositoryController;
