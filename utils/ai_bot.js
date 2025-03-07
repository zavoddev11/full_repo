import { config } from "dotenv"
import { OpenAI } from "openai"
import { message_context } from "./message_prompt.js";
import { querySimilarDocuments } from "./vector/ai_session.js";

config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export const chatWithGPT = async function (website_id, session_id, ai_query, previous_messages, userMessage) {    

    const retrievedDocs = (await querySimilarDocuments(website_id, userMessage)).map(match => ({
        role: "system",
        content: match.metadata.text, // Store each retrieved document as a separate message
    }));

    let prev_message = await message_context(previous_messages)

    let messages = [
        { role: "system", content: "Use the following company documents to answer the user query accurately." },

        ...retrievedDocs,
        ...prev_message,

        { role: "user", content: `Question: ${userMessage}` }

    ]

    try {
        let response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });

        let full_response = {
            sender_type: "bot",
            session_id,
            message: response.choices[0].message.content.trim()
        }

        console.log({ response: full_response })
        return full_response
    } catch (error) {
        console.error("ChatGPT Error:", error.message);
        throw "Error processing request.";
    }
}
