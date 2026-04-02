import { generateReview } from "../ai/mistral.js";

const aiController = {
    review: async (req, res) => {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content (diff) is required" });

        try {
            const response = await generateReview(content);
            // response is now a structured JSON object (not a string)
            res.json({ review: response });
        } catch (error) {
            console.error("Error generating review:", error);
            res.status(500).json({ error: "Failed to generate review" });
        }
    },
};

export default aiController;
