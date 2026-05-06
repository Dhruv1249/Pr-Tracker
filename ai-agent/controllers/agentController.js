import { agentChat } from "../ai/mistral.js";

const agentController = {
    interact: async (req, res) => {
        const { query, context } = req.body;
        const authHeader = req.headers.authorization;
        // Also forward the cookie — the frontend uses cookie-based auth (JWT in
        // an HTTP-only cookie), so we need to pass it to the backend tool calls.
        const cookieHeader = req.headers.cookie;
        if (!query) return res.status(400).json({ error: "Query is required" });

        try {
            const response = await agentChat(query, context, authHeader, cookieHeader);
            res.json({ message: response });
        } catch (error) {
            console.error("Error running agent:", error?.message || error);
            if (error?.stack) console.error(error.stack);
            res.status(500).json({ error: "Agent encountered an error" });
        }
    },
};
 
export default agentController;
