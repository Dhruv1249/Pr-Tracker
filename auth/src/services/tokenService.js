const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      githubId: user.githubId,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { generateToken };