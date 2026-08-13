const requestLog = globalThis.__aarnavGeminiRequestLog || new Map();
globalThis.__aarnavGeminiRequestLog = requestLog;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_OUTPUT_TOKENS = 300;

function getClientId(request) {
  const forwarded = request.headers["x-forwarded-for"];
  return (forwarded ? forwarded.split(",")[0] : request.socket?.remoteAddress || "unknown").trim();
}

function isRateLimited(clientId) {
  const now = Date.now();
  const recent = (requestLog.get(clientId) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(clientId, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(clientId, recent);
  return false;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Only POST requests are allowed." });
  }

  const { message } = request.body || {};
  if (!message || typeof message !== "string") {
    return response.status(400).json({ error: "Please enter a question." });
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return response.status(413).json({ error: "Please keep your question under 1,000 characters." });
  }

  if (isRateLimited(getClientId(request))) {
    return response.status(429).json({ error: "Please wait a few minutes before asking more AI questions." });
  }

  try {
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are Ask Aarnav AI, the assistant for Aarnav Thakur's portfolio.
Answer questions about Aarnav's website, coding, books, places, sports, guitar, music,
channels, and navigation. You can also answer ordinary safe general questions, such as
greetings, learning, coding, productivity, and simple explanations. Use approved portfolio
information only when making claims about Aarnav. Never invent personal facts or say you
have browsed the web. If a question needs current information, private data, or details not
provided here, say so clearly and offer a useful next step. Be concise, friendly, and helpful.
Use short paragraphs. When giving several places, books, steps, or options, use Markdown
bullet points beginning with "- ".`,
            }],
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim().slice(0, 1000) }],
          }],
          generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.5,
          },
        }),
      },
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      if (geminiResponse.status === 400 || geminiResponse.status === 401 || geminiResponse.status === 403) {
        return response.status(502).json({ error: "Ask Aarnav cannot reach Gemini. Check the GEMINI_API_KEY in Vercel." });
      }
      if (geminiResponse.status === 429) {
        return response.status(429).json({ error: "The AI request limit has been reached. Please try again later." });
      }
      return response.status(502).json({ error: "Gemini is temporarily unavailable. Please try again shortly." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return response.status(200).json({ reply: reply || "I could not generate a reply." });
  } catch {
    return response.status(500).json({ error: "The chatbot is temporarily unavailable." });
  }
}
