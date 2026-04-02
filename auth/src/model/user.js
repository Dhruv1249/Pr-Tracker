const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    email: String,
    accessTokenEncrypted: {
      type: String,
      required: true,
    },
    refreshTokenEncrypted: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);