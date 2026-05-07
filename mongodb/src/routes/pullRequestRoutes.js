const express = require('express');
const router = express.Router();
const pullRequestController = require('../controllers/pullRequestController');
const validate = require('../middleware/validate');
const { prSchema } = require('../schemas');

// Pull Request routes
router.post('/', validate(prSchema), pullRequestController.createPullRequest);
router.get('/', pullRequestController.getAllPullRequests);
router.get('/github/:githubId', pullRequestController.getPullRequestByGithubId);
router.get('/repository/:repositoryId', pullRequestController.getPullRequestsByRepository);
router.get('/state/:state', pullRequestController.getPullRequestsByState);
router.get('/author/:author', pullRequestController.getPullRequestsByAuthor);
router.get('/repo-github/:repoGithubId', pullRequestController.getPullRequestsByRepoGithubId);
router.get('/:id', pullRequestController.getPullRequestById);
router.put('/github/:githubId', validate(prSchema), pullRequestController.updatePullRequest);
router.put('/github/:githubId/merge', pullRequestController.mergePullRequest);
router.put('/github/:githubId/close', pullRequestController.closePullRequest);
router.put('/github/:githubId/reopen', pullRequestController.reopenPullRequest);
router.delete('/github/:githubId', pullRequestController.deletePullRequest);

module.exports = router;
