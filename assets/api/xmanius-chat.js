const requests = globalThis.__xmaniusRequests || new Map();
globalThis.__xmaniusRequests = requests;
const SYSTEM = `You are Xmanius 1, a friendly general-purpose AI assistant. Answer safe everyday questions, explanations, coding questions, planning requests, brainstorming, and productivity questions naturally. Be concise, warm, and useful. Do not claim personal facts about any person, do not invent private information, and politely refuse harmful, hateful, abusive, or explicit requests while offering a safe alternative. Use short paragraphs and Markdown bullets when useful.`;
export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Only POST requests are allowed." });
  const message = request.body?.message;
  if (typeof message !== "string" || !message.trim()) return response.status(400).json({ error: "Please enter a question." });
  if (message.trim().length > 1000) return response.status(413).json({ error: "Please keep your question under 1,000 characters." });
  const id = request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown";
  const now = Date.now(), recent = (requests.get(id) || []).filter(t => now - t < 600000);
  if (recent.length >= 8) return response.status(429).json({ error: "Please wait a few minutes before asking more questions." });
  recent.push(now); requests.set(id, recent);
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: "Online AI is not configured." });
  try {
    const result = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts: [{ text: message.trim() }] }], generationConfig: { maxOutputTokens: 300, temperature: .5 } }) });
    const data = await result.json();
    if (!result.ok) return response.status(502).json({ error: "Xmanius is temporarily unavailable." });
    return response.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a reply." });
  } catch { return response.status(500).json({ error: "The chatbot is temporarily unavailable." }); }
}
