const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');
const validate = require('../middleware/validate');
const { repoSchema } = require('../schemas');

// Repository routes
router.post('/', validate(repoSchema), repositoryController.createRepository);
router.get('/', repositoryController.getAllRepositories);
router.get('/github/:githubId', repositoryController.getRepositoryByGithubId);
router.get('/fullname/:fullName', repositoryController.getRepositoryByFullName);
router.get('/owner/:owner', repositoryController.getRepositoriesByOwner);
router.get('/:id', repositoryController.getRepositoryById);
router.put('/github/:githubId', validate(repoSchema), repositoryController.updateRepository);
router.delete('/github/:githubId', repositoryController.deleteRepository);
router.post('/import', repositoryController.importRepositories);

module.exports = router;
