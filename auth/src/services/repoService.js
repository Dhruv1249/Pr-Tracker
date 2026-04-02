const axios = require("axios");
const User = require("../model/user");
const { decrypt } = require("./encryptionService");

async function getUserRepos() {
  // get logged user (for now first user)
  const user = await User.findOne();

  if (!user) throw new Error("No user found");

  const token = decrypt(user.accessTokenEncrypted);

  const response = await axios.get("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  return response.data;
}

module.exports = { getUserRepos };