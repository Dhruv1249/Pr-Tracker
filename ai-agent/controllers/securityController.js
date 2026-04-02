import { detectSecurity } from "../ai/mistral.js";

const securityController = {
    detectSecurity: async (req, res) => {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content (diff) is required" });

        try {
            const response = await detectSecurity(content);
            res.json(response); // response is already a JSON object from mistral.js
        } catch (error) {
            console.error("Error detecting security issues:", error);
            res.status(500).json({ error: "Failed to detect security issues" });
        }
    },
};
 
export default securityController;
