const requestLog = globalThis.__aarnavGeminiRequestLog || new Map();
globalThis.__aarnavGeminiRequestLog = requestLog;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_OUTPUT_TOKENS = 300;

// This is the assistant's approved source of truth. Keeping it server-side
// prevents visitors from changing the portfolio facts sent to Gemini.
const PORTFOLIO_CONTEXT = `
APPROVED AARNAV PORTFOLIO FACTS
- Name: Aarnav Thakur.
- Age shown by the portfolio: 17.
- Based in: Kolkata, India.
- Profile: student, coder, builder, athlete, guitarist, learner, and content creator.
- Interests: coding, AI-assisted building, sports, guitar, books, travel, content creation, and learning.
- Sports: football, basketball, and badminton; the portfolio highlights Badminton Nationals at U-15 level.
- Website creation: Aarnav used HTML, CSS, and JavaScript with AI tools to build the structure, styling, animations, music controls, page navigation, and interactions. AI helped him iterate faster, debug, and reduce effort while he kept his own creative direction.
- Guitar channel: Play With Aarnav.
- Technology/content channel: Techno Savvy.
- Books shown: Atomic Habits, Roald Dahl, Sudha Murty, Treasure Island, and Sherlock Holmes.
- Places shown: Havelock Island, Neil Island, Rameshwar Temple, Darbhanga Maharaj Mahal, Darjeeling, Eco Park, Marina Beach, Belur Math, Dakshineswar Kali Temple, Victoria Memorial, Rabindra Sarobar, Writers' Building, Nicco Park, Birla Mandir, Birla Museum, Kapaleeshwarar Temple, Snow Kingdom, and Hanuman Tok.
- Website pages: Home, Interests, Books, Places, and Find Me.
- Navigation: theme switch is at the top-right; Music and Instagram controls are at the bottom-right; Ask Aarnav is at the bottom-left.
`;

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

  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({ error: "GEMINI_API_KEY is missing in the Vercel Production environment." });
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
      text: `You are Ask Aarnav AI, a friendly general-purpose assistant and the guide for Aarnav Thakur's portfolio.
Answer normal conversation naturally: greetings, goodbyes, thanks, how-are-you questions,
basic arithmetic, simple explanations, and everyday safe questions. Never respond with a
refusal just because a question is not about the portfolio.
Answer questions about Aarnav's website, coding, books, places, sports, guitar, music,
channels, and navigation. You can also answer ordinary safe general questions, such as
greetings, learning, coding, productivity, and simple explanations. You may answer any
general safe question using your normal knowledge. Use approved portfolio information only
when making claims about Aarnav. If asked for private personal details about Aarnav, reply:
"I can't answer private personal details. I can only analyze information that Aarnav has
approved and provided on this website." Never invent personal facts or claim to browse the
web. For hateful, abusive, or explicit requests, refuse politely and offer a respectful,
educational alternative. Be concise, friendly, and helpful.
Use short paragraphs. When giving several places, books, steps, or options, use Markdown
bullet points beginning with "- ".

Use the approved portfolio facts below whenever the user asks about Aarnav. Do not add,
guess, or combine personal facts that are not listed. If the question asks for private
personal information, use the required privacy response instead.

${PORTFOLIO_CONTEXT}`,
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
      console.error("Gemini request failed", {
        status: geminiResponse.status,
        message: data?.error?.message || "Unknown Gemini error",
        reason: data?.error?.status || "Unknown status",
      });
      if (geminiResponse.status === 400 || geminiResponse.status === 401 || geminiResponse.status === 403) {
        return response.status(502).json({ error: "Gemini rejected the request. Check the Vercel function logs for the exact reason." });
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
