import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "tinyllama";

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── Load knowledge base for RAG ──────────────────────────────────────────────
let knowledge = [];
try {
  knowledge = JSON.parse(readFileSync(join(__dirname, "knowledge.json"), "utf-8"));
  console.log(`  Loaded ${knowledge.length} knowledge chunks`);
} catch {
  console.warn("  Could not load knowledge.json — RAG disabled");
}

// ── Simple TF-IDF-like retrieval ─────────────────────────────────────────────
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}

function computeScore(query, doc) {
  const queryTokens = tokenize(query);
  const docTokens = new Set(tokenize(doc));
  let hits = 0;
  for (const t of queryTokens) {
    if (docTokens.has(t)) hits++;
    // partial match bonus for longer tokens
    for (const d of docTokens) {
      if (d.includes(t) && d !== t) { hits += 0.3; break; }
    }
  }
  return hits / Math.max(queryTokens.length, 1);
}

function retrieveContext(query, topK = 3) {
  const scored = knowledge.map((chunk) => ({
    ...chunk,
    score: computeScore(query, chunk.topic + " " + chunk.content),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((c) => c.score > 0);
}

// ── Ollama generation ────────────────────────────────────────────────────────
async function askOllama(systemPrompt, userMessage) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.message?.content || "No response generated.";
}

// ── Gemini fallback ──────────────────────────────────────────────────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function askGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

// ── Check if Ollama is reachable ─────────────────────────────────────────────
let ollamaAvailable = false;

async function probeOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2000) });
    ollamaAvailable = res.ok;
  } catch {
    ollamaAvailable = false;
  }
  console.log(`  Ollama: ${ollamaAvailable ? "connected" : "unavailable (will use Gemini fallback)"}`);
}

// ── /ask endpoint ────────────────────────────────────────────────────────────
app.post("/ask", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.json({ reply: "Ask me something." });

  // Retrieve relevant knowledge chunks
  const chunks = retrieveContext(message);
  const context = chunks.length
    ? chunks.map((c) => c.content).join("\n\n")
    : "No specific context found.";

  const systemPrompt = `You are AskJawad, a helpful assistant on Jawad Azeem's portfolio website.
Use ONLY the following context to answer the user's question. Be concise, professional, and friendly.
If the question is unrelated to Jawad's background, politely redirect.

Context:
${context}`;

  try {
    let reply;

    if (ollamaAvailable) {
      reply = await askOllama(systemPrompt, message);
    } else if (GEMINI_KEY && GEMINI_KEY !== "your-gemini-api-key-here") {
      reply = await askGemini(`${systemPrompt}\n\nUser question: ${message}`);
    } else {
      return res.json({ reply: "AI service not configured. Start Ollama or add a Gemini API key." });
    }

    res.json({ reply });
  } catch (error) {
    console.error("AI error:", error.message);
    res.json({ reply: "AI service temporarily unavailable." });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
await probeOllama();

app.listen(PORT, () => {
  console.log(`\n  Server running at http://localhost:${PORT}`);
  console.log(`  AskJawad API at  http://localhost:${PORT}/ask\n`);
});
