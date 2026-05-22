import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

app.post("/ask", async (req, res) => {

  const message = req.body.message;

  if (!message) {
    return res.json({ reply: "Ask me something." });
  }

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are AskJawad, an assistant on Jawad Azeem's portfolio.
                            Jawad is a backend engineer focused on AWS, Spring Boot, and distributed systems.
                            Projects: Blueprint (Backend service for telecom billing analytics. Ingests large 
                            CSV files, transforms raw records into structured data, and exposes metrics through 
                            a REST API. Deployed on AWS.), Resonance (A high-concurrency backend engine that models 
                            business workflows as strict state machines and executes them through a queue-based 
                            processing core, like SQS, but with built-in rules, retries, recovery, and full traceability.), 
                            Sentinel (A real-time monitoring and alerting system for tracking application performance and infrastructure health).

                            User question: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response.";

    res.json({ reply });

  } catch (error) {

    console.error("Gemini error:", error);

    res.json({
      reply: "AI service temporarily unavailable."
    });

  }

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});