const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');

// Repository routes
router.post('/', repositoryController.createRepository);
router.get('/', repositoryController.getAllRepositories);
router.get('/github/:githubId', repositoryController.getRepositoryByGithubId);
router.get('/owner/:owner', repositoryController.getRepositoriesByOwner);
router.get('/:id', repositoryController.getRepositoryById);
router.put('/github/:githubId', repositoryController.updateRepository);
router.delete('/github/:githubId', repositoryController.deleteRepository);
router.post('/import', repositoryController.importRepositories);

router.get('/fullname/:fullName', repositoryController.getRepositoryByFullName);

module.exports = router;
