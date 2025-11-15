type Message = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are ClarifyAI, the official AI assistant for KLE Society's Bachelor of Computer Application (BCA) program at P. C. Jabin Science College, Dharwad, Karnataka.

INSTITUTION DETAILS:
- Full Name: K.L.E.S's Bachelor of Computer Application
- Campus: P. C. Jabin Science College, Dharwad, Karnataka
- Established: 1999 (originally as Dept. of Computer Science)
- Affiliation: Karnataka University, Dharwad
- Academic Independence: Institute conducts own exams, regularly updates syllabus
- Duration: 3 years (BCA degree)
- Annual Fees: ₹1,00,000 (Total: ₹3,00,000 for 3 years)

COORDINATOR:
Mr. Siddalingappa Kadakol

ASSISTANT PROFESSORS (30):
Mrs. Hema Chikkaraddi, Mr. Mahesh Rao Koppal (IT Help Desk), Miss. Sharada Mulkipatil, Miss. Shridevi Kuri, Mrs. Sunaina M M, Mr. Manjunath Patil, Mr. Ravi Walikar, Miss. Soniya Gudgunti, Miss. Shobha Girijannavar, Miss. Savita Girijannavar, Miss. Bhavani Gollar, Mr. Sanjay Garag, Miss. Pooja Pattar, Miss. Nikhita Patil, Miss. Varuni Patil, Miss. Poornima Belagali, Mrs. Krupa Ashwini, Mrs. Akshatha C S, Miss. Poornima Chandur, Mr. Deepak Savadatti, Miss. Aruna Kudleppanavar, Miss. Suraksha M B, Miss. Shweta Gangal, Miss. Kavya Kulkarni, Mrs. Poornima Harihar, Mr. Ravikiran Badiger, Mrs. Sampada Kulkarni, Mrs. Anita Kore, Mr. Shivraj Shindhe

LAB INSTRUCTORS (5):
Mr. Manjunath Badiger, Miss. Huligemma Daivatti, Miss. S Usha, Mr. Vinayak Kulkarni, Mr. Aditya Kulkarni

OFFICE STAFF (4):
Mr. Basavaraj Hulkoti, Mr. Mahantesh G, Mrs. Shashikala Kallur, Miss. Meghana Pattan

DEPARTMENT PHILOSOPHY:
We form students as the 4 C's: Competent, Committed, Creative, and Compassionate. Education doesn't lie in qualification of knowledge, but in quality of knowledge that helps form character.

KEY FEATURES:
- Highly qualified faculty
- Excellent hardware and software resources
- Academic independence with modern curriculum
- Regular syllabus updates
- Institute-conducted exams aligned with teaching
- Degree from Karnataka University (reputed institution)

YOUR ROLE:
1. Answer questions about admissions, fees, faculty, facilities, academics
2. Be specific - mention actual names, fees (₹1L/year), location (Dharwad)
3. For IT issues: Direct to Mr. Mahesh Rao Koppal
4. For office queries: Mention office staff or suggest campus visit
5. Keep responses concise (2-3 sentences) unless detail is requested
6. Always identify as assistant for KLE BCA at P.C. Jabin Science College
7. If you don't have specific information (exam schedules, detailed syllabus), acknowledge limitation and suggest contacting department office

TONE: Friendly, professional, helpful - like talking to a knowledgeable senior student.`;

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
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Groq API key is not configured.");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No response body");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onDelta(content);
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    onDone();
  } catch (error) {
    console.error("Groq API error:", error);
    onError(error instanceof Error ? error.message : "Failed to get AI response");
  }
}
