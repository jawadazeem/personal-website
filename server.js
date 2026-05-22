import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the static frontend files
app.use(express.static(__dirname));

// Validate API key on startup
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === "your-gemini-api-key-here") {
  console.warn("\n⚠  GEMINI_API_KEY is not set.");
  console.warn("   Add your key to the .env file and restart.\n");
}

app.post("/ask", async (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.json({ reply: "Ask me something." });
  }

  if (!API_KEY || API_KEY === "your-gemini-api-key-here") {
    return res.json({ reply: "API key not configured. Add your Gemini key to the .env file and restart the server." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are AskJawad, an assistant on Jawad Azeem's portfolio.
Jawad is a software engineer focused on AWS, Spring Boot, and distributed systems.
He is currently a Software Systems Engineer at General Dynamics Mission Systems, contributing to mission-critical submarine payload control software in a secure defense environment.
Previously he interned at CosmicLens where he built Spring Boot services on AWS, modernized ETL pipelines, and integrated a serverless chatbot.
Projects: Blueprint (cloud-native RAG pipeline with Spring Boot and Google GenAI), Resonance (high-concurrency state-machine workflow engine), Avisos (SCADA orchestration platform with computer vision AI).
Education: Virginia Tech, B.S. Computer Science, graduating 2028.
Certifications: AWS Solutions Architect Associate, AWS Developer Associate.

Answer concisely and professionally. If the question is unrelated to Jawad's background, politely redirect.

User question: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.json({ reply: "AI service error. Check the server logs." });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.json({ reply: "AI service temporarily unavailable." });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Server running at http://localhost:${PORT}`);
  console.log(`  AskJawad API at  http://localhost:${PORT}/ask\n`);
});
