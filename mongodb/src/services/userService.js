const { User } = require('../models');

class UserService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async findUserByGithubId(githubId) {
    try {
      return await User.findOne({
        githubId: String(githubId)
      }).populate('repositories');
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findUserById(id) {
    try {
      return await User.findById(id).populate('repositories');
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async updateUser(githubId, updateData) {
    try {
      return await User.findOneAndUpdate(
        { githubId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async deleteUser(githubId) {
    try {
      return await User.findOneAndDelete({ githubId });
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await User.find().populate('repositories');
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async addRepositoryToUser(githubId, repositoryId) {
    try {
      return await User.findOneAndUpdate(
        { githubId },
        { $addToSet: { repositories: repositoryId } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding repository to user: ${error.message}`);
    }
  }
}

module.exports = new UserService();
