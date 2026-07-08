import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const CHAT_MODEL = openai("gpt-5.4-nano");
export const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");
