const express = require("express");
const router = express.Router();
const { fetchRepos } = require("../controllers/repoController");

router.get("/repos", fetchRepos);

module.exports = router;