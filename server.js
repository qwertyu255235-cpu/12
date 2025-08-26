import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Main route to handle AI requests
app.post("/api/ask", async (req, res) => {
  try {
    const { feature, text, extras } = req.body;

    // Customize system prompt
    let systemPrompt = `
You are Student Helper AI. Answer in friendly, step-by-step, student-friendly English.
Features:
- Doubt Solver: explain problems clearly
- Notes Generator: summarize topics neatly
- Quiz Generator: create MCQs
- Study Planner: plan schedule
Always respond politely and helpfully.
`;

    let userPrompt = `Feature: ${feature}\nUser input: ${text}\n`;
    if (extras?.examDate) {
      userPrompt += `Exam date: ${extras.examDate}\n`;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "AI request failed" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
