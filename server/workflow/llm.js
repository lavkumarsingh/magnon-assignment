import Groq from "groq-sdk";
import { VALID_COMPLEXITIES, SYSTEM_PROMPT, RESPONSE_FORMAT } from "./prompts.js";

const MODEL = "openai/gpt-oss-120b";

let client;
export function getClient() {
    if(!client) {
        const apiKey = process.env.GROQ_API_KEY;
        if(!apiKey) throw new Error("GROQ_API_KEY is not set. Add the key to your .env file.");

        client = new Groq({ apiKey, maxRetries: 3, timeout: 60_000});
    }

    return client;
}

export async function processWithLLM({ title, description }) {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Title: ${title}\nDescription: ${description}` },
    ],
    response_format: RESPONSE_FORMAT,
    reasoning_effort: "medium",
    include_reasoning: false,
    max_completion_tokens: 1024,
  });

  const choice = response.choices?.[0];
  // Finish response is 'length' if truncated. 
  if (choice?.finish_reason === "length") {
    throw new Error(
      "LLM response was truncated before the JSON was complete; raise max_completion_tokens"
    );
  }

  const text = choice?.message?.content;
  if (!text) throw new Error("No text response from LLM");
  
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("LLM did not return valid JSON: " + cleaned);
  }

  const missing = ["summary", "keyMessaging", "recommendedFormat"].filter(
    (field) => typeof parsed[field] !== "string" || !parsed[field].trim()
  );
  if (missing.length || !VALID_COMPLEXITIES.includes(parsed.complexity)) {
    throw new Error("Malformed LLM output: " + cleaned);
  }

  return {
    summary: parsed.summary,
    keyMessaging: parsed.keyMessaging,
    recommendedFormat: parsed.recommendedFormat,
    complexity: parsed.complexity,
  };
}