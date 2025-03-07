import { config } from "dotenv"
import { OpenAI } from "openai"
import { message_context } from "./message_prompt.js";

config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export const chatWithGPT = async function (session_id, ai_query, previous_messages, userMessage) {

    let prev_message = await message_context(previous_messages)

    let messages = [
        { role: "system", content: ai_query },
        ...prev_message,
        { role: "user", content: userMessage }
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
