const { PullRequest } = require('../models');

class PullRequestService {
  async createPullRequest(prData) {
    try {
      const pullRequest = new PullRequest(prData);
      await pullRequest.save();
      return pullRequest;
    } catch (error) {
      throw new Error(`Error creating pull request: ${error.message}`);
    }
  }

  async findPullRequestByGithubId(githubId) {
    try {
      return await PullRequest.findOne({ githubId }).populate('repository');
    } catch (error) {
      throw new Error(`Error finding pull request: ${error.message}`);
    }
  }

  async findPullRequestById(id) {
    try {
      return await PullRequest.findById(id).populate('repository');
    } catch (error) {
      throw new Error(`Error finding pull request: ${error.message}`);
    }
  }

  async updatePullRequest(githubId, updateData) {
    try {
      return await PullRequest.findOneAndUpdate(
        { githubId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating pull request: ${error.message}`);
    }
  }

  async deletePullRequest(githubId) {
    try {
      return await PullRequest.findOneAndDelete({ githubId });
    } catch (error) {
      throw new Error(`Error deleting pull request: ${error.message}`);
    }
  }

  async getAllPullRequests(filters = {}) {
    try {
      return await PullRequest.find(filters)
        .populate('repository')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching pull requests: ${error.message}`);
    }
  }

  async getPullRequestsByRepository(repositoryId) {
    try {
      return await PullRequest.find({ repository: repositoryId })
        .populate('repository')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching pull requests by repository: ${error.message}`);
    }
  }

  async getPullRequestsByState(state) {
    try {
      return await PullRequest.find({ state })
        .populate('repository')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching pull requests by state: ${error.message}`);
    }
  }

  async getPullRequestsByAuthor(authorLogin) {
    try {
      return await PullRequest.find({ 'author.login': authorLogin })
        .populate('repository')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching pull requests by author: ${error.message}`);
    }
  }

  async mergePullRequest(githubId) {
    try {
      return await PullRequest.findOneAndUpdate(
        { githubId },
        { state: 'merged', mergedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error merging pull request: ${error.message}`);
    }
  }

  async closePullRequest(githubId) {
    try {
      return await PullRequest.findOneAndUpdate(
        { githubId },
        { state: 'closed', closedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error closing pull request: ${error.message}`);
    }
  }

  async reopenPullRequest(githubId) {
    try {
      return await PullRequest.findOneAndUpdate(
        { githubId },
        { state: 'open' },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error reopening pull request: ${error.message}`);
    }
  }

  async getPullRequestsByRepositoryGithubId(repoGithubId) {
    try {
      const { Repository } = require('../models');
      const repo = await Repository.findOne({ githubId: repoGithubId });
      if (!repo) return [];
      return await PullRequest.find({ repository: repo._id })
        .populate('repository')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching pull requests by repo github id: ${error.message}`);
    }
  }
}

module.exports = new PullRequestService();
