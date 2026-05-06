const { Repository } = require('../models');
const User = require('../models/User');

class RepositoryService {
  async createRepository(repoData) {
    try {
      const repository = new Repository(repoData);
      await repository.save();
      return repository;
    } catch (error) {
      throw new Error(`Error creating repository: ${error.message}`);
    }
  }



  async findRepositoryByGithubId(githubId) {
    try {
      return await Repository.findOne({ githubId: Number(githubId) }).populate('users');
    } catch (error) {
      throw new Error(`Error finding repository: ${error.message}`);
    }
  }

  async findRepositoryById(id) {
    try {
      const mongoose = require('mongoose');
      // If it looks like a valid MongoDB ObjectId, use findById.
      // Otherwise treat it as a GitHub numeric repo ID and look up by githubId.
      if (mongoose.Types.ObjectId.isValid(id) && String(id).length === 24) {
        return await Repository.findById(id).populate('users');
      }
      // Fallback: numeric GitHub repo ID
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        throw new Error(`Invalid repository id: ${id}`);
      }
      return await Repository.findOne({ githubId: numericId }).populate('users');
    } catch (error) {
      throw new Error(`Error finding repository: ${error.message}`);
    }
  }

  async updateRepository(githubId, updateData) {
    try {
      return await Repository.findOneAndUpdate(
        { githubId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating repository: ${error.message}`);
    }
  }

  async deleteRepository(githubId) {
    try {
      return await Repository.findOneAndDelete({ githubId });
    } catch (error) {
      throw new Error(`Error deleting repository: ${error.message}`);
    }
  }

  async getAllRepositories(filters = {}) {
    try {
      const query = { isActive: true, ...filters };
      return await Repository.find(query).populate('users').sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching repositories: ${error.message}`);
    }
  }

  async findRepositoryByFullName(fullName) {
    try {
      return await Repository.findOne({ fullName }).populate('users');
    } catch (error) {
      throw new Error(`Error finding repository by full name: ${error.message}`);
    }
  }

  async getRepositoriesByOwner(ownerLogin) {
    try {
      return await Repository.find({ 'owner.login': ownerLogin, isActive: true })
        .populate('users')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching repositories by owner: ${error.message}`);
    }
  }

  async addUserToRepository(githubId, userId) {
    try {
      return await Repository.findOneAndUpdate(
        { githubId },
        { $addToSet: { users: userId } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding user to repository: ${error.message}`);
    }
  }

  async importRepositories(repoGithubIds, userId) {
    const normalizedRepoIds = (Array.isArray(repoGithubIds) ? repoGithubIds : [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    if (normalizedRepoIds.length === 0) {
      throw new Error('repoIds must contain at least one numeric GitHub repository id');
    }

    // 1) Store the list on the user document (github repo IDs)
    await User.updateOne(
      { _id: userId },
      { $addToSet: { repositories: { $each: normalizedRepoIds } } }
    );

    // 2) Link the user onto repository documents so /api/repositories filtered by `users` works
    await Repository.updateMany(
      { githubId: { $in: normalizedRepoIds } },
      { $addToSet: { users: userId } }
    );

    return await User.findById(userId);
  }
}

module.exports = new RepositoryService();
