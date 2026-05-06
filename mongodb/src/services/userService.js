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
      const githubIdNumber = Number(githubId);
      const query = Number.isFinite(githubIdNumber)
        ? { githubId: githubIdNumber }
        : { githubId };

      return await User.findOne(query);
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async updateUser(githubId, updateData) {
    try {
      const githubIdNumber = Number(githubId);
      const query = Number.isFinite(githubIdNumber)
        ? { githubId: githubIdNumber }
        : { githubId };

      return await User.findOneAndUpdate(
        query,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async deleteUser(githubId) {
    try {
      const githubIdNumber = Number(githubId);
      const query = Number.isFinite(githubIdNumber)
        ? { githubId: githubIdNumber }
        : { githubId };

      return await User.findOneAndDelete(query);
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await User.find();
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
