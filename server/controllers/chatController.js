const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const model = process.env.OLLAMA_MODEL || "llama3.2";

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Message is too long"
            });
        }

        const response = await fetch(ollamaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                stream: false,
                messages: [
                    {
                        role: "system",
                        content: `
                You are the Vehicle Hub AI Assistant.

                Vehicle Hub is a car rental platform.

                Help users with:
                - Finding suitable cars
                - Understanding car categories
                - Booking guidance
                - Rental-related questions
                - Owner car listing guidance
                - Payment guidance
                - General questions about using Vehicle Hub

                Be friendly, concise and helpful.

                Do not claim that a car is available unless
                availability information has actually been provided.
            `
                    },
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama returned HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.message?.content) {
            throw new Error("Ollama returned an empty response");
        }

        res.json({
            success: true,
            reply: data.message.content
        });

    } catch (error) {
        console.error("AI Error:", error?.message || "Unknown AI error");

        res.status(503).json({
            success: false,
            message: "Local AI is unavailable. Start Ollama and run: ollama run llama3.2"
        });
    }
};