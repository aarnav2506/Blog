export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Only POST requests are allowed." });
  }

  const { message } = request.body || {};
  if (!message || typeof message !== "string") {
    return response.status(400).json({ error: "Please enter a question." });
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
channels, and navigation. Be concise, friendly, and helpful. Use only approved portfolio
information. If you do not know something, say that clearly. Do not invent personal facts.`,
            }],
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim().slice(0, 1000) }],
          }],
        }),
      },
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return response.status(502).json({ error: "Gemini is temporarily unavailable." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return response.status(200).json({ reply: reply || "I could not generate a reply." });
  } catch {
    return response.status(500).json({ error: "The chatbot is temporarily unavailable." });
  }
}
