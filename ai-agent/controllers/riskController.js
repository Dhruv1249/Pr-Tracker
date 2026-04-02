import { assessRisk } from "../ai/mistral.js";

const riskController = {
    assessRisk: async (req, res) => {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content (diff) is required" });

        try {
            const response = await assessRisk(content);
            res.json(response); // response is already a JSON object from mistral.js
        } catch (error) {
            console.error("Error assessing risk:", error);
            res.status(500).json({ error: "Failed to assess risk" });
        }
    },
};
 
export default riskController;
