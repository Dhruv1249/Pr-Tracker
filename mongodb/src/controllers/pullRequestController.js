const { pullRequestService } = require('../services');

const pullRequestController = {
  async createPullRequest(req, res, next) {
    try {
      const pullRequest = await pullRequestService.createPullRequest(req.body);
      res.status(201).json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async getPullRequestByGithubId(req, res, next) {
    try {
      const pullRequest = await pullRequestService.findPullRequestByGithubId(req.params.githubId);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async getPullRequestById(req, res, next) {
    try {
      const pullRequest = await pullRequestService.findPullRequestById(req.params.id);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async updatePullRequest(req, res, next) {
    try {
      const pullRequest = await pullRequestService.updatePullRequest(req.params.githubId, req.body);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async deletePullRequest(req, res, next) {
    try {
      const pullRequest = await pullRequestService.deletePullRequest(req.params.githubId);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, message: 'Pull request deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getAllPullRequests(req, res, next) {
    try {
      const pullRequests = await pullRequestService.getAllPullRequests(req.query);
      res.json({ success: true, data: pullRequests, count: pullRequests.length });
    } catch (error) {
      next(error);
    }
  },

  async getPullRequestsByRepository(req, res, next) {
    try {
      const pullRequests = await pullRequestService.getPullRequestsByRepository(req.params.repositoryId);
      res.json({ success: true, data: pullRequests, count: pullRequests.length });
    } catch (error) {
      next(error);
    }
  },

  async getPullRequestsByState(req, res, next) {
    try {
      const pullRequests = await pullRequestService.getPullRequestsByState(req.params.state);
      res.json({ success: true, data: pullRequests, count: pullRequests.length });
    } catch (error) {
      next(error);
    }
  },

  async getPullRequestsByAuthor(req, res, next) {
    try {
      const pullRequests = await pullRequestService.getPullRequestsByAuthor(req.params.author);
      res.json({ success: true, data: pullRequests, count: pullRequests.length });
    } catch (error) {
      next(error);
    }
  },

  async mergePullRequest(req, res, next) {
    try {
      const pullRequest = await pullRequestService.mergePullRequest(req.params.githubId);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async closePullRequest(req, res, next) {
    try {
      const pullRequest = await pullRequestService.closePullRequest(req.params.githubId);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async reopenPullRequest(req, res, next) {
    try {
      const pullRequest = await pullRequestService.reopenPullRequest(req.params.githubId);
      if (!pullRequest) {
        return res.status(404).json({ success: false, error: 'Pull request not found' });
      }
      res.json({ success: true, data: pullRequest });
    } catch (error) {
      next(error);
    }
  },

  async getPullRequestsByRepoGithubId(req, res, next) {
    try {
      const pullRequests = await pullRequestService.getPullRequestsByRepositoryGithubId(req.params.repoGithubId);
      res.json({ success: true, data: pullRequests, count: pullRequests.length });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = pullRequestController;
