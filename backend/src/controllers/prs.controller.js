const github = require("../services/github");
const db = require("../services/db");
const ai = require("../services/ai");
const { resolveGithubToken } = require("../services/userToken");

// GET /api/prs/:prId
exports.getPrDetails = async (req, res) => {
    console.log(`[prs.controller] GET /api/prs/${req.params.prId}`);
    try {
        const pr = await db.getPRById(req.params.prId, req);
        res.json(pr);
    } catch (err) {
        console.error(`[prs.controller] GET /api/prs/${req.params.prId} FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// GET /api/prs/:prId/conflicts
exports.checkConflicts = async (req, res) => {
    console.log(`[prs.controller] GET /api/prs/${req.params.prId}/conflicts`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        const ghPr = await github.getPullRequest(ownerLogin, repo.name, pr.number, token);
        res.json({
            mergeable: ghPr.mergeable,
            mergeable_state: ghPr.mergeable_state,
        });
    } catch (err) {
        console.error(`[prs.controller] GET /api/prs/${req.params.prId}/conflicts FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// GET /api/prs/:prId/diff
exports.getPrDiff = async (req, res) => {
    console.log(`[prs.controller] GET /api/prs/${req.params.prId}/diff`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        const diff = await github.getPullRequestDiff(ownerLogin, repo.name, pr.number, token);
        res.type("text/plain").send(diff);
    } catch (err) {
        console.error(`[prs.controller] GET /api/prs/${req.params.prId}/diff FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/merge
exports.mergePr = async (req, res) => {
    console.log(`[prs.controller] Attempting to merge PR ID: ${req.params.prId}`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        if (pr.state === "merged") return res.status(400).json({ error: "Already merged" });
        if (pr.state === "closed") return res.status(400).json({ error: "Cannot merge closed PR" });

        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        console.log(`[prs.controller] Merging ${ownerLogin}/${repo.name} PR #${pr.number}`);
        await github.mergePullRequest(ownerLogin, repo.name, pr.number, token);
        const updated = await db.mergePRInDb(pr.githubId, req);
        await db.createAuditLog({
            action: "MERGE_PR",
            actor: `user:${req.headers["x-user-github-id"] || "unknown"}`,
            target: `pr:${pr.number}`,
            details: { repoId: repo._id, repoName: repo.fullName, prId: pr._id }
        }, req).catch(console.error);
        res.json({ message: "PR merged", pr: updated });
    } catch (err) {
        console.error(`[prs.controller] Merge PR FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/close
exports.closePr = async (req, res) => {
    console.log(`[prs.controller] POST /api/prs/${req.params.prId}/close`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        if (pr.state === "merged") return res.status(400).json({ error: "Cannot close merged PR" });

        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        await github.closePullRequest(ownerLogin, repo.name, pr.number, token);
        const updated = await db.closePRInDb(pr.githubId, req);
        await db.createAuditLog({
            action: "CLOSE_PR",
            actor: `user:${req.headers["x-user-github-id"] || "unknown"}`,
            target: `pr:${pr.number}`,
            details: { repoId: repo._id, repoName: repo.fullName, prId: pr._id }
        }, req).catch(console.error);
        res.json({ message: "PR closed", pr: updated });
    } catch (err) {
        console.error(`[prs.controller] POST /api/prs/${req.params.prId}/close FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/reopen
exports.reopenPr = async (req, res) => {
    console.log(`[prs.controller] POST /api/prs/${req.params.prId}/reopen`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        if (pr.state !== "closed") return res.status(400).json({ error: "Only closed PRs can be reopened" });

        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        await github.reopenPullRequest(ownerLogin, repo.name, pr.number, token);
        const updated = await db.reopenPRInDb(pr.githubId, req);
        await db.createAuditLog({
            action: "REOPEN_PR",
            actor: `user:${req.headers["x-user-github-id"] || "unknown"}`,
            target: `pr:${pr.number}`,
            details: { repoId: repo._id, repoName: repo.fullName, prId: pr._id }
        }, req).catch(console.error);
        res.json({ message: "PR reopened", pr: updated });
    } catch (err) {
        console.error(`[prs.controller] POST /api/prs/${req.params.prId}/reopen FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/reviews
exports.submitReview = async (req, res) => {
    console.log(`[prs.controller] POST /api/prs/${req.params.prId}/reviews`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        const { decision, comment, reviewer } = req.body;
        const valid = ["approve", "request_changes", "comment"];
        if (!decision || !valid.includes(decision)) {
            return res.status(400).json({ error: `decision must be one of: ${valid.join(", ")}` });
        }

        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        // Map to GitHub API event names
        let githubEvent = "COMMENT";
        if (decision === "approve") githubEvent = "APPROVE";
        if (decision === "request_changes") githubEvent = "REQUEST_CHANGES";

        // Map to Review model enum names
        let dbState = "COMMENTED";
        if (decision === "approve") dbState = "APPROVED";
        if (decision === "request_changes") dbState = "CHANGES_REQUESTED";

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        const ghReview = await github.createPrReview(ownerLogin, repo.name, pr.number, githubEvent, comment || "", token);

        const review = await db.createReview({
            githubId: ghReview.id,
            pullRequest: pr._id,
            pullRequestNumber: pr.number,
            user: {
                login: reviewer || "anonymous",
            },
            state: dbState,
            body: comment || "",
            submittedAt: new Date().toISOString(),
        }, req);

        await db.createAuditLog({
            action: "SUBMIT_REVIEW",
            actor: `user:${req.headers["x-user-github-id"] || "unknown"}`,
            target: `pr:${pr.number}`,
            details: { decision, repoId: repo._id, repoName: repo.fullName, prId: pr._id }
        }, req).catch(console.error);

        res.status(201).json(review);
    } catch (err) {
        console.error(`[prs.controller] POST /api/prs/${req.params.prId}/reviews FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/comments
exports.addComment = async (req, res) => {
    console.log(`[prs.controller] POST /api/prs/${req.params.prId}/comments`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        const { body } = req.body;

        if (!body || !String(body).trim()) {
            return res.status(400).json({ error: "body is required" });
        }

        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        const ghComment = await github.createPrComment(ownerLogin, repo.name, pr.number, String(body).trim(), token);

        try {
            await db.updatePR(
                pr.githubId,
                { commentsCount: (pr.commentsCount || 0) + 1 },
                req
            );
        } catch (dbErr) {
            console.warn(`[prs.controller] Failed to increment commentsCount for PR ${pr.githubId}: ${dbErr.message}`);
        }

        await db.createAuditLog({
            action: "ADD_COMMENT",
            actor: `user:${req.headers["x-user-github-id"] || "unknown"}`,
            target: `pr:${pr.number}`,
            details: { repoId: repo._id, repoName: repo.fullName, prId: pr._id }
        }, req).catch(console.error);

        res.status(201).json({ message: "Comment added", comment: ghComment });
    } catch (err) {
        console.error(`[prs.controller] POST /api/prs/${req.params.prId}/comments FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// GET /api/prs/:prId/reviews
exports.listReviews = async (req, res) => {
    try {
        const pr = await db.getPRById(req.params.prId, req);
        const reviews = await db.getReviewsByPR(pr._id, req);
        res.json(reviews);
    } catch (err) {
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/tags
exports.addTag = async (req, res) => {
    try {
        const pr = await db.getPRById(req.params.prId, req);
        const { tag } = req.body;
        if (!tag) return res.status(400).json({ error: "tag is required" });

        const labels = pr.labels || [];
        if (!labels.some((l) => l.name === tag)) {
            labels.push({ name: tag, color: "" });
        }
        const updated = await db.updatePR(pr.githubId, { labels }, req);
        res.json({ message: "Tag added", tags: updated.labels });
    } catch (err) {
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// DELETE /api/prs/:prId/tags/:tag
exports.removeTag = async (req, res) => {
    try {
        const pr = await db.getPRById(req.params.prId, req);
        const labels = (pr.labels || []).filter((l) => l.name !== req.params.tag);
        if (labels.length === (pr.labels || []).length) {
            return res.status(404).json({ error: "Tag not found" });
        }
        const updated = await db.updatePR(pr.githubId, { labels }, req);
        res.json({ message: "Tag removed", tags: updated.labels });
    } catch (err) {
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};

// POST /api/prs/:prId/analyze — Run AI analysis on a PR and store results
exports.analyzePr = async (req, res) => {
    console.log(`[prs.controller] POST /api/prs/${req.params.prId}/analyze`);
    try {
        const token = await resolveGithubToken(req, { required: true });
        const pr = await db.getPRById(req.params.prId, req);
        const repo = pr.repository;
        if (!repo) return res.status(404).json({ error: "Repo not found" });

        const ownerLogin = repo.owner?.login || repo.fullName.split("/")[0];
        const diff = await github.getPullRequestDiff(ownerLogin, repo.name, pr.number, token);

        const analysis = await ai.analyzeFullPR(diff);
        const aiReviewString =
            typeof analysis.aiReview === "string" ? analysis.aiReview : JSON.stringify(analysis.aiReview ?? null);

        const updated = await db.updatePR(
            pr.githubId,
            {
                ...analysis,
                // Keep old columns in sync for dashboard queries
                aiReview: aiReviewString,
                aiAnalysis: analysis,
            },
            req
        );

        res.json({ message: "AI analysis complete", pr: updated });
    } catch (err) {
        console.error(`[prs.controller] POST /api/prs/${req.params.prId}/analyze FAILED: ${err.message}`);
        if (err.status === 404) return res.status(404).json({ error: "PR not found" });
        res.status(err.status || 500).json({ error: err.message });
    }
};
