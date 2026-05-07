import { agentChat } from "../ai/mistral.js";

const agentController = {
    interact: async (req, res) => {
        const { query, context } = req.body;
        const authHeader = req.headers.authorization;
        // Also forward the cookie — the frontend uses cookie-based auth (JWT in
        // an HTTP-only cookie), so we need to pass it to the backend tool calls.
        const cookieHeader = req.headers.cookie;
        if (!query || typeof query !== 'string') return res.status(400).json({ error: "Query is required and must be a string" });
        if (query.length > 2000) return res.status(400).json({ error: "Query is too long" });

        // Sanitize context to prevent payload corruption or oversized prompt injections
        let sanitizedContext = {};
        if (context && typeof context === 'object') {
            if (context.activeRepo) {
                sanitizedContext.activeRepo = {
                    id: String(context.activeRepo.id || "").slice(0, 100),
                    name: String(context.activeRepo.name || "").slice(0, 100),
                    owner: String(context.activeRepo.owner || "").slice(0, 100),
                    fullName: String(context.activeRepo.fullName || "").slice(0, 200)
                };
            }
            if (context.username) {
                sanitizedContext.username = String(context.username).slice(0, 100);
            }
            if (context.forceTool && typeof context.forceTool === 'object') {
                sanitizedContext.forceTool = context.forceTool;
            }
        }
        try {
            const response = await agentChat(query, sanitizedContext, authHeader, cookieHeader);
            res.json({ message: response });
        } catch (error) {
            console.error("Error running agent:", error?.message || error);
            if (error?.stack) console.error(error.stack);
            res.status(500).json({ error: "Agent encountered an error" });
        }
    },
};
 
export default agentController;
