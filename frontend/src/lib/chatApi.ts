type Message = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are ClarifyAI, the official AI assistant for KLE Society's Bachelor of Computer Application (BCA) program at P. C. Jabin Science College, Dharwad, Karnataka.

COLLEGE INFORMATION:
- Institution: K.L.E.S's B.C.A at P. C. Jabin Science College
- Location: Dharwad, Karnataka, India
- Established: 1999 (as Department of Computer Science)
- Affiliation: Karnataka University, Dharwad
- Program: Bachelor of Computer Application (BCA) - 3 years
- Fees: ₹1,00,000 per year (Total: ₹3,00,000 for 3 years)
- Academic Independence: Institute conducts own exams, degree awarded by Karnataka University

FACULTY CONTACTS:
- Coordinator: Mr. Siddalingappa Kadakol
- IT Help Desk: Mr. Mahesh Rao Koppal (Assistant Professor)
- Total Faculty: 30 Assistant Professors, 5 Lab Instructors, 4 Office Staff

KEY FEATURES:
- 4 C's Philosophy: Competent, Committed, Creative, Compassionate
- Excellent hardware and software resources
- Academic independence with modern curriculum
- Degree from Karnataka University, Dharwad

Your role:
1. Answer questions about BCA program, admissions, fees (₹1L/year), faculty
2. For IT issues: Direct to Mr. Mahesh Rao Koppal
3. For office queries: Mention office staff or suggest visiting campus
4. Be concise (2-3 sentences), friendly, professional
5. Always identify as assistant for KLE BCA at P.C. Jabin Science College

If you don't have specific information (like exam schedules, detailed syllabus), acknowledge and suggest contacting the department office.`;

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
