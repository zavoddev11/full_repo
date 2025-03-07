import { querySimilarDocuments, upsertDocument } from "./pinecone.js";
import { OpenAI } from "openai";
import { config } from "dotenv";

config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithGPT = async (role, sessionId, userMessage) => {
    // Retrieve similar past messages
    const similarMessages = await querySimilarDocuments(role, sessionId, userMessage);

    // Construct the conversation history
    const messages = [
        { role: "system", content: "You are a helpful assistant. Please provide a concise and accurate answer in no more than 60 words. Minimize formatting." },
        ...similarMessages.map((msg) => ({
            role: msg.metadata.role,
            content: msg.metadata.text,
        })),
        { role: "user", content: userMessage },
    ];

    // Get the assistant's response
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
    });

    const assistantMessage = response.choices[0].message.content.trim();

    // Store the user's message and assistant's response
    await upsertDocument(`${sessionId}-user-${Date.now()}`, userMessage, {
        sessionId: sessionId,
        role: "user",
    });

    await upsertDocument(`${sessionId}-assistant-${Date.now()}`, assistantMessage, {
        sessionId: sessionId,
        role: "assistant",
    });

    return assistantMessage;
};
