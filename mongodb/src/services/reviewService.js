const { Review } = require('../models');

class ReviewService {
  async createReview(reviewData) {
    try {
      const review = new Review(reviewData);
      await review.save();
      return review;
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  async findReviewByGithubId(githubId) {
    try {
      return await Review.findOne({ githubId }).populate('pullRequest');
    } catch (error) {
      throw new Error(`Error finding review: ${error.message}`);
    }
  }

  async findReviewById(id) {
    try {
      return await Review.findById(id).populate('pullRequest');
    } catch (error) {
      throw new Error(`Error finding review: ${error.message}`);
    }
  }

  async updateReview(githubId, updateData) {
    try {
      return await Review.findOneAndUpdate(
        { githubId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  async deleteReview(githubId) {
    try {
      return await Review.findOneAndDelete({ githubId });
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

  async getAllReviews() {
    try {
      return await Review.find().populate('pullRequest').sort({ submittedAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }
  }

  async getReviewsByPullRequest(pullRequestId) {
    try {
      return await Review.find({ pullRequest: pullRequestId })
        .populate('pullRequest')
        .sort({ submittedAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching reviews by pull request: ${error.message}`);
    }
  }

  async getReviewsByUser(userLogin) {
    try {
      return await Review.find({ 'user.login': userLogin })
        .populate('pullRequest')
        .sort({ submittedAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching reviews by user: ${error.message}`);
    }
  }

  async getReviewsByState(state) {
    try {
      return await Review.find({ state })
        .populate('pullRequest')
        .sort({ submittedAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching reviews by state: ${error.message}`);
    }
  }
}

module.exports = new ReviewService();
