const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.post('/', auditController.createLog);
router.get('/', auditController.getLogs);

module.exports = router;
