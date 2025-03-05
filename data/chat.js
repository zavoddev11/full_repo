import dotenv from "dotenv"
import { OpenAI } from "openai"

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function chatWithGPT(session_id, prompt) {
    try {
        let response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
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

chatWithGPT("sdsds", "founder?")
export default { chatWithGPT };
