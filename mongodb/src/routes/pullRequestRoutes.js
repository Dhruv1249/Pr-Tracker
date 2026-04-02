const express = require('express');
const router = express.Router();
const pullRequestController = require('../controllers/pullRequestController');

// Pull Request routes
router.post('/', pullRequestController.createPullRequest);
router.get('/', pullRequestController.getAllPullRequests);
router.get('/github/:githubId', pullRequestController.getPullRequestByGithubId);
router.get('/repository/:repositoryId', pullRequestController.getPullRequestsByRepository);
router.get('/state/:state', pullRequestController.getPullRequestsByState);
router.get('/author/:author', pullRequestController.getPullRequestsByAuthor);
router.get('/:id', pullRequestController.getPullRequestById);
router.put('/github/:githubId', pullRequestController.updatePullRequest);
router.put('/github/:githubId/merge', pullRequestController.mergePullRequest);
router.put('/github/:githubId/close', pullRequestController.closePullRequest);
router.put('/github/:githubId/reopen', pullRequestController.reopenPullRequest);
router.get('/repo-github/:repoGithubId', pullRequestController.getPullRequestsByRepoGithubId);
router.delete('/github/:githubId', pullRequestController.deletePullRequest);

module.exports = router;
