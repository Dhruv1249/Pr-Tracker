const { encrypt } = require("../services/encryptionService");
const { generateToken } = require("../services/tokenService");
const { getAccessToken, getGithubUser } = require("../services/githubService");
const axios = require("axios");

// All calls go through the service-router gateway
const PROXY = process.env.PROXY_URL || "http://localhost:5003";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

const dbClient = axios.create({
  baseURL: PROXY,
  headers: {
    "Content-Type": "application/json",
    ...(INTERNAL_SECRET ? { "x-internal-secret": INTERNAL_SECRET } : {}),
  },
});

// redirect to github
exports.githubLogin = (req, res) => {
  const crypto = require("crypto");
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000, // 10 minutes
    sameSite: 'lax'
  });
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user repo&state=${state}`;
  res.redirect(url);
};

// callback 
exports.githubCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;
    const storedState = req.cookies.oauth_state;

    res.clearCookie("oauth_state");

    if (!state || !storedState || state !== storedState) {
        return res.status(403).send("Invalid OAuth state. Possible CSRF attack.");
    }

    // get token from github
    const accessToken = await getAccessToken(code);

    // get user info
    const githubUser = await getGithubUser(accessToken);

    const encryptedToken = encrypt(accessToken);

    // check if user exists via gateway → mongodb service
    let user = null;
    try {
      const { data } = await dbClient.get(`/api/db/users/github/${githubUser.id}`);
      user = data.data;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
    }

    if (!user) {
      const { data } = await dbClient.post("/api/db/users", {
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        accessTokenEncrypted: encryptedToken,
      });
      user = data.data;
    } else {
      const { data } = await dbClient.put(`/api/db/users/github/${githubUser.id}`, {
        accessTokenEncrypted: encryptedToken,
      });
      user = data.data;
    }

    // create jwt
    const jwtToken = generateToken(user);

    console.log("cookie set!");

    // redirect frontend – prevent caching to avoid 304 on OAuth callback
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.redirect(`${process.env.GATEWAY_URL}/api/auth/success?token=${jwtToken}`);


  } catch (error) {
    console.log(error?.response?.data || error);
    res.send("Login failed");
  }
};

// internal decrypt endpoint for backend
exports.internalDecrypt = (req, res) => {
    const internalSecret = req.headers["x-internal-secret"];
    if (!INTERNAL_SECRET || internalSecret !== INTERNAL_SECRET) {
        return res.status(403).json({ error: "Forbidden: Invalid internal secret" });
    }

    const { encryptedToken } = req.body;
    if (!encryptedToken) {
        return res.status(400).json({ error: "Missing encrypted token" });
    }

    try {
        const { decrypt } = require("../services/encryptionService");
        const plaintext = decrypt(encryptedToken);
        res.json({ token: plaintext });
    } catch (err) {
        console.error("Failed to decrypt token in auth service:", err.message);
        res.status(500).json({ error: "Decryption failed" });
    }
};