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
      return await Repository.findOne({ githubRepoId: githubId }).populate('users');
    } catch (error) {
      throw new Error(`Error finding repository: ${error.message}`);
    }
  }

  async findRepositoryById(id) {
    try {
      return await Repository.findById(id).populate('users');
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
    console.log("user id", userId);
    console.log("repoIds", repoGithubIds);
    await User.updateOne(
      { _id: userId },
      { $addToSet: { repositories: { $each: repoGithubIds } } }
    );

    const user = await User.findById(userId);

    console.log("updated user with new repos", user);
    return user;
  }
}

module.exports = new RepositoryService();
