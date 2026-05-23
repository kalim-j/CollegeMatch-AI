import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://collegematch-ai.vercel.app", // Required for OpenRouter
    "X-Title": "CollegeMatch-AI", // Optional but good for OpenRouter
  }
});
