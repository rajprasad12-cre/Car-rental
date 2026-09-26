import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message
    });

    res.json({ reply: response.text });

  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.json({ reply: "AI is busy right now, please try again." });
  }
};