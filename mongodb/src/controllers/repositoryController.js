const { repositoryService } = require('../services');

const repositoryController = {
  async createRepository(req, res, next) {
    try {
      const repository = await repositoryService.createRepository(req.body);
      res.status(201).json({ success: true, data: repository });
    } catch (error) {
      next(error);
    }
  },

  async getRepositoryByGithubId(req, res, next) {
    try {
      const repository = await repositoryService.findRepositoryByGithubId(req.params.githubId);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
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
      if (userId) {
        filters.users = userId;
      }
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
    try {
      const repository = await repositoryService.findRepositoryByFullName(req.params.fullName);
      if (!repository) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }
      res.json({ success: true, data: repository });
    } catch (error) {
      next(error);
    }
  },

  async importRepositories(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      console.log("userid is:", userId );
      const { repoIds } = req.body;
      console.log("repo ids in req body are: ", req.body.repoIds);

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
