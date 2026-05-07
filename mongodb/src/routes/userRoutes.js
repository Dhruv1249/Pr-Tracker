const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { userSchema } = require('../schemas');

// User routes
router.post('/', validate(userSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/me', userController.getCurrentUser);
router.get('/github/:githubId', userController.getUserByGithubId);
router.put('/github/:githubId', validate(userSchema), userController.updateUser);
router.delete('/github/:githubId', userController.deleteUser);

module.exports = router;
