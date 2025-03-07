import { chatWithGPT } from "./ai_chat.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

chatWithGPT