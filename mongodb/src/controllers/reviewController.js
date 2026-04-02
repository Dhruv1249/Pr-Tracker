const { reviewService } = require('../services');

const reviewController = {
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async getReviewByGithubId(req, res, next) {
    try {
      const review = await reviewService.findReviewByGithubId(req.params.githubId);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async getReviewById(req, res, next) {
    try {
      const review = await reviewService.findReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async updateReview(req, res, next) {
    try {
      const review = await reviewService.updateReview(req.params.githubId, req.body);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const review = await reviewService.deleteReview(req.params.githubId);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getAllReviews(req, res, next) {
    try {
      const reviews = await reviewService.getAllReviews();
      res.json({ success: true, data: reviews, count: reviews.length });
    } catch (error) {
      next(error);
    }
  },

  async getReviewsByPullRequest(req, res, next) {
    try {
      const reviews = await reviewService.getReviewsByPullRequest(req.params.pullRequestId);
      res.json({ success: true, data: reviews, count: reviews.length });
    } catch (error) {
      next(error);
    }
  },

  async getReviewsByUser(req, res, next) {
    try {
      const reviews = await reviewService.getReviewsByUser(req.params.user);
      res.json({ success: true, data: reviews, count: reviews.length });
    } catch (error) {
      next(error);
    }
  },

  async getReviewsByState(req, res, next) {
    try {
      const reviews = await reviewService.getReviewsByState(req.params.state);
      res.json({ success: true, data: reviews, count: reviews.length });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reviewController;
