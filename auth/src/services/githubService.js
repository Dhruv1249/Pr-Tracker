const axios = require("axios");

async function getAccessToken(code) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
  });

  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    }
  );

  console.log("GitHub token response:", JSON.stringify(response.data));

  if (response.data.error) {
    throw new Error(`GitHub OAuth error: ${response.data.error} - ${response.data.error_description}`);
  }

  return response.data.access_token;
}

async function getGithubUser(accessToken) {
  const response = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });

  return response.data;
}

module.exports = { getAccessToken, getGithubUser };