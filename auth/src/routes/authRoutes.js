const express = require("express");
const router = express.Router();
const { githubLogin, githubCallback, internalDecrypt } = require("../controllers/authController");

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.post("/internal/decrypt", internalDecrypt);

module.exports = router;