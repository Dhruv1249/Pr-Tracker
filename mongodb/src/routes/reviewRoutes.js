const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes
router.post('/', reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/github/:githubId', reviewController.getReviewByGithubId);
router.get('/pullrequest/:pullRequestId', reviewController.getReviewsByPullRequest);
router.get('/user/:user', reviewController.getReviewsByUser);
router.get('/state/:state', reviewController.getReviewsByState);
router.get('/:id', reviewController.getReviewById);
router.put('/github/:githubId', reviewController.updateReview);
router.delete('/github/:githubId', reviewController.deleteReview);

module.exports = router;
