import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "dotenv";

config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});


const index = pc.createIndex("chat-memory"); // Your Pinecone index name

// Function to generate embeddings
export const getEmbedding = async (text) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",  
        input: text,
    });
    return response.data[0].embedding;
};

// Function to store messages as vectors
export const storeMessage = async (session_id, message, role) => {
    const vector = await getEmbedding(message);

    await index.upsert([
        {
            id: `${session_id}-${Date.now()}`,
            values: vector,
            metadata: { session_id, role, text: message },
        },
    ]);
};

// Function to retrieve similar past messages
export const retrieveRelevantMessages = async (userMessage) => {
    const userVector = await getEmbedding(userMessage);

    const results = await index.query({
        vector: userVector,
        topK: 5, // Fetch top 5 relevant messages
        includeMetadata: true,
    });

    return results.matches.map((match) => ({
        role: match.metadata.role,
        content: match.metadata.text,
    }));
};
