// ---------------------------------------------------------------------------
// Extracts the user's GitHub token from JWT → MongoDB → decrypt.
// Falls back to env GITHUB_TOKEN ONLY if no JWT is present (dev/CLI mode).
// ---------------------------------------------------------------------------

const db = require("./db");
const axios = require("axios");

const INTERNAL_SECRET = process.env.INTERNAL_SECRET;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth:5005";

async function resolveGithubToken(req, options = {}) {
    const { required = false } = options;

    // 1. Extract githubId from standardized internal headers
    const githubId = req.headers["x-user-github-id"];

    // 2. Try per-user GitHub token (preferred — gives 5000 req/hr rate limit)
    if (githubId) {
            try {
                const user = await db.getUserByGithubId(githubId, req);
                console.log(`[resolveGithubToken] DB user found: ${!!user}, hasToken: ${!!user?.accessTokenEncrypted}`);

                if (user?.accessTokenEncrypted) {
                    try {
                        const { data } = await axios.post(
                            `${AUTH_SERVICE_URL}/api/auth/internal/decrypt`,
                            { encryptedToken: user.accessTokenEncrypted },
                            { headers: { "x-internal-secret": INTERNAL_SECRET } }
                        );
                        const ghToken = data.token;
                        console.log(`[resolveGithubToken] Decrypted GitHub token ok, length: ${ghToken?.length}`);
                        return ghToken;
                    } catch (decryptErr) {
                        console.error("[resolveGithubToken] Decryption FAILED:", decryptErr.response?.data || decryptErr.message);
                        const err = new Error("Failed to decrypt your stored GitHub token. Please re-authenticate.");
                        err.status = 401;
                        throw err;
                    }
                }

                console.error("[resolveGithubToken] No accessTokenEncrypted in DB for githubId:", githubId);
                const noTokenErr = new Error("No GitHub token stored for your account. Please re-authenticate with GitHub.");
                noTokenErr.status = 401;
                throw noTokenErr;
            } catch (err) {
                if (err.status === 401) throw err;
                console.error("[resolveGithubToken] Unexpected DB error:", err.message);
                const dbErr = new Error("Could not retrieve your GitHub credentials from the database. Please try again.");
                dbErr.status = 503;
                throw dbErr;
            }
        }// Fallback removed due to security risk. Webhooks/internal calls that need a token must be rearchitected or explicitly handled.

    if (required) {
        console.error("[resolveGithubToken] No token available and required=true — throwing 401");
        const error = new Error("Authentication required. Please log in with GitHub to use this feature.");
        error.status = 401;
        throw error;
    }

    return null;
}

module.exports = { resolveGithubToken };
