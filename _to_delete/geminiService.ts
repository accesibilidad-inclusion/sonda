import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    // Check if API Key is available
    if (!process.env.API_KEY) {
        console.warn("API Key not found. Mocking AI response.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSupportiveFeedback = async (userText: string): Promise<string> => {
    const ai = getAiClient();
    
    // Fallback if no API key
    if (!ai) {
        return "Gracias por compartir tu experiencia. Tu aporte es muy valioso para nosotros.";
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `The user is an autistic university student participating in a design probe. They have just shared a reflection about their university experience.
            
            User's text: "${userText}"
            
            Task: Provide a very brief (1 sentence), warm, non-judgmental, and validating acknowledgment. Do not give advice. Just acknowledge their effort or feeling.`,
        });

        return response.text?.trim() || "Gracias por compartir.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Gracias por compartir tu experiencia.";
    }
};
