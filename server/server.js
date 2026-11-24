
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AI StudyMate backend is running!");
});

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const asText = (value, maxLength) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

async function generateText(contents, config) {
  let lastOverload;
  let delay = 1000;

  for (let index = 0; index < MODELS.length; index += 1) {
    const model = MODELS[index];

    try {
      console.log(`Gemini model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      if (!response?.text) {
        throw new Error("Gemini returned an empty response.");
      }

      return response.text;
    } catch (error) {
      const status = Number(error.status || error.code);

      if (status !== 503) {
        throw error;
      }

      lastOverload = error;
      const nextModel = MODELS[index + 1];

      if (!nextModel) {
        break;
      }

      console.log(
        `${model} is overloaded (503). Waiting ${delay / 1000}s before ${nextModel}.`
      );
      await wait(delay);
      delay *= 2;
    }
  }

  const failure = new Error(
    "Gemini is unavailable. gemini-3.8-flash and the fallback models returned HTTP 503 because of high demand. Please try again later."
  );
  failure.status = 503;
  failure.cause = lastOverload;
  throw failure;
}

function sendGeminiError(res, error) {
  console.error("FULL GEMINI ERROR:", error);

  res.status(error.status || 500).json({
    error: error.message || "Unknown Gemini error",
  });
}

app.post("/api/generate-plan", async (req, res) => {
  try {
    const { subjects, examDate, studyHours, studyStyle } = req.body;

    if (!subjects || !examDate || !studyHours || !studyStyle) {
      return res.status(400).json({
        error: "Please provide all study plan details.",
      });
    }

    const prompt = `
You are an expert academic study planner.

Create a practical personalized study timetable.

Subjects: ${subjects}
Exam date: ${examDate}
Available study hours per day: ${studyHours}
Study style: ${studyStyle}

Requirements:
- Create a day-by-day study timetable.
- Divide time across the supplied subjects.
- Include breaks and revision sessions.
- Prioritize difficult subjects.
- Include realistic daily goals.
- Format clearly using headings and bullet points.
- Do not invent the current date.
`;

    const plan = await generateText(prompt);

    res.json({ plan });
  } catch (error) {
    sendGeminiError(res, error);
  }
});

app.post("/api/explain-topic", async (req, res) => {
  try {
    const topic = asText(req.body?.topic, 300);
    const level = asText(req.body?.level, 40);

    const allowedLevels = ["Beginner", "Intermediate", "Advanced"];

    if (!topic) {
      return res.status(400).json({
        error: "Please enter a topic to explain.",
      });
    }

    if (!allowedLevels.includes(level)) {
      return res.status(400).json({
        error: "Please choose Beginner, Intermediate, or Advanced.",
      });
    }

    const prompt = `
You are a college tutor. Explain the topic for a ${level} student.

Topic: ${topic}

Use these exact headings:
## Simple explanation
## Examples
## Important points
## Short summary

Rules:
- Match the ${level} difficulty.
- Use clear language and short paragraphs.
- Include at least two concrete examples.
- List 4 to 6 important points as bullets.
- End with a short summary of 3 to 5 sentences.
- Stay on this topic. Do not add unrelated study advice.
`;

    const explanation = await generateText(prompt);

    res.json({ explanation });
  } catch (error) {
    sendGeminiError(res, error);
  }
});

app.post("/api/generate-quiz", async (req, res) => {
  try {
    const subject = asText(req.body?.subject, 120);
    const topic = asText(req.body?.topic, 200);
    const count = Number(req.body?.count);

    if (!subject || !topic) {
      return res.status(400).json({
        error: "Please enter both a subject and a topic.",
      });
    }

    if (![5, 10, 15].includes(count)) {
      return res.status(400).json({
        error: "Choose 5, 10, or 15 questions.",
      });
    }

    const prompt = `
Create a college quiz.

Subject: ${subject}
Topic: ${topic}
Number of questions: ${count}

Return only JSON with this shape:
{
  "title": "short quiz title",
  "questions": [
    {
      "question": "question text",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "answer": 0,
      "explanation": "why the correct option is right"
    }
  ]
}

Rules:
- Exactly ${count} questions.
- Exactly 4 options per question.
- "answer" is the index of the correct option: 0, 1, 2, or 3.
- One clearly correct answer per question.
- Explanations should be one or two sentences.
- Questions must be about ${topic} in ${subject}.
`;

    const raw = await generateText(prompt, {
      responseMimeType: "application/json",
      temperature: 0.4,
    });

    const quiz = parseQuiz(raw, count);

    res.json({ quiz });
  } catch (error) {
    sendGeminiError(res, error);
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = asText(req.body?.message, 2000);
    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-12)
      : [];

    if (!message) {
      return res.status(400).json({
        error: "Please type a question.",
      });
    }

    const contents = [];

    for (const item of history) {
      const role = item?.role === "model" ? "model" : item?.role === "user" ? "user" : "";
      const text = asText(item?.text, 4000);

      if (!role || !text) {
        return res.status(400).json({
          error: "Chat history is invalid.",
        });
      }

      contents.push({
        role,
        parts: [{ text }],
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const reply = await generateText(contents, {
      systemInstruction:
        "You are AI StudyMate, a helpful college study tutor. Answer academic questions clearly, with examples when useful. If a question is not about studying, politely steer the student back to their coursework. Keep answers focused and readable.",
      temperature: 0.6,
    });

    res.json({ reply });
  } catch (error) {
    sendGeminiError(res, error);
  }
});

function parseQuiz(raw, count) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("The quiz response was not valid JSON. Please try again.");
  }

  if (!Array.isArray(parsed?.questions) || parsed.questions.length !== count) {
    throw new Error("The quiz did not contain the requested number of questions.");
  }

  const questions = parsed.questions.map((item, index) => {
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => String(option).trim()).filter(Boolean)
      : [];
    const answer = Number(item?.answer);

    if (
      !item?.question ||
      options.length !== 4 ||
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer > 3 ||
      !item?.explanation
    ) {
      throw new Error(`Question ${index + 1} was incomplete. Please try again.`);
    }

    return {
      question: String(item.question).trim(),
      options,
      answer,
      explanation: String(item.explanation).trim(),
    };
  });

  return {
    title: asText(parsed.title, 120) || "Practice Quiz",
    questions,
  };
}

app.listen(PORT, () => {
  console.log(`AI StudyMate backend running at http://localhost:${PORT}`);
});
