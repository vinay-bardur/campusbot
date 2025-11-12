import { GoogleGenerativeAI } from "@google/generative-ai";

type Message = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are a helpful campus assistant chatbot for a university. Your role is to:
- Answer student queries about campus facilities, events, academics, and general information
- Provide accurate information about campus locations, timings, and services
- Be concise, friendly, and professional in your responses
- If you don't know something specific, suggest contacting the campus administration
- Help students navigate campus life and resources

Keep your responses clear and student-friendly.`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_PROMPT
    });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        onDelta(text);
      }
    }

    onDone();
  } catch (error) {
    console.error("Gemini API error:", error);
    onError(error instanceof Error ? error.message : "Failed to get AI response");
  }
}
