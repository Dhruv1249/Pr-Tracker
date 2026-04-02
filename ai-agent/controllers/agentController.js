import { agentChat } from "../ai/mistral.js";

const agentController = {
    interact: async (req, res) => {
        const { query, context } = req.body;
        const authHeader = req.headers.authorization;
        if (!query) return res.status(400).json({ error: "Query is required" });

        try {
            const response = await agentChat(query, context, authHeader);
            res.json({ message: response });
        } catch (error) {
            console.error("Error running agent:", error?.message || error);
            if (error?.stack) console.error(error.stack);
            res.status(500).json({ error: "Agent encountered an error" });
        }
    },
};
 
export default agentController;
