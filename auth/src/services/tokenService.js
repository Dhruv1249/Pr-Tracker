const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
  }
  return jwt.sign(
    {
      id: user._id,
      githubId: user.githubId,
      username: user.username,
    },
    JWT_SECRET,
    { 
        expiresIn: "7d",
        issuer: "pr-tracker-auth",
        audience: "pr-tracker-system"
    }
  );
}

module.exports = { generateToken };