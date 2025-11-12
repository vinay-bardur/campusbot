import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function sendMessageToGemini(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const systemPrompt = `You are a helpful campus assistant chatbot. Answer student queries about campus facilities, events, academics, and general information. Be concise, friendly, and professional. If you don't know something, suggest contacting the campus administration.`;
    
    const prompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get response from AI");
  }
}

export async function saveChatLog(userMessage: string, botResponse: string, token: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/chat-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_message: userMessage,
        bot_response: botResponse,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save chat log");
    }
  } catch (error) {
    console.error("Error saving chat log:", error);
  }
}
