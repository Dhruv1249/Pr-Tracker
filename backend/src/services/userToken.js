// ---------------------------------------------------------------------------
// Extracts the user's GitHub token from JWT → MongoDB → decrypt.
// Attaches `req.githubToken` for use by controllers.
// Falls back to env GITHUB_TOKEN ONLY if no JWT is present (dev/CLI mode).
// If the user IS authenticated but token cannot be resolved, we throw
// immediately rather than silently downgrading to unauthenticated GitHub
// calls (which hit the 60 req/hr rate limit instead of 5000 req/hr).
// ---------------------------------------------------------------------------

const jwt = require("jsonwebtoken");
const db = require("./db");
const { decrypt } = require("./decrypt");

const JWT_SECRET = process.env.JWT_SECRET;

async function resolveGithubToken(req, options = {}) {
    const { required = false } = options;
    // 1. Extract JWT from Authorization header or cookie
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    // 2. Try per-user GitHub token (preferred — gives 5000 req/hr rate limit)
    if (token) {
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.warn("[resolveGithubToken] JWT verification failed:", err.message);
            decoded = null;
        }

        if (decoded?.githubId) {
            // The user is authenticated. We MUST use their stored token.
            // Any failure here should be surfaced, not silently downgraded.
            try {
                const user = await db.getUserByGithubId(decoded.githubId, req);
                if (user?.accessTokenEncrypted) {
                    try {
                        return decrypt(user.accessTokenEncrypted);
                    } catch (decryptErr) {
                        console.error(
                            "[resolveGithubToken] Failed to decrypt stored token for githubId:",
                            decoded.githubId,
                            decryptErr.message
                        );
                        const err = new Error(
                            "Failed to decrypt your stored GitHub token. Please re-authenticate."
                        );
                        err.status = 401;
                        throw err;
                    }
                }
                // User exists but has no stored token — force re-auth
                console.error(
                    "[resolveGithubToken] No accessTokenEncrypted in DB for githubId:",
                    decoded.githubId
                );
                const noTokenErr = new Error(
                    "No GitHub token stored for your account. Please re-authenticate with GitHub."
                );
                noTokenErr.status = 401;
                throw noTokenErr;
            } catch (err) {
                // Re-throw errors we explicitly created (status 401)
                if (err.status === 401) throw err;
                // For unexpected DB errors, log and surface them
                console.error(
                    "[resolveGithubToken] Unexpected error fetching user from DB:",
                    err.message
                );
                const dbErr = new Error(
                    "Could not retrieve your GitHub credentials from the database. Please try again."
                );
                dbErr.status = 503;
                throw dbErr;
            }
        }
    }

    // 3. No JWT present — fall back to env token (dev/CLI/webhook use only)
    if (process.env.GITHUB_TOKEN) {
        console.warn(
            "[resolveGithubToken] No user JWT found — using server-level GITHUB_TOKEN (unauthenticated fallback)."
        );
        return process.env.GITHUB_TOKEN;
    }

    if (required) {
        const error = new Error(
            "Authentication required. Please log in with GitHub to use this feature."
        );
        error.status = 401;
        throw error;
    }

    return null;
}

module.exports = { resolveGithubToken };
