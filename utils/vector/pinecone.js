import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import { config } from "dotenv";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

config();

const pinecone = new Pinecone({
    apiKey: process.env.PINE_KEYS,
});

// Get pine index
export const getPineconeIndex = async (indexName) => {
    // Check if index exists
    const existingIndexes = (await pinecone.listIndexes()).indexes.map(index => index.name);
    if (!existingIndexes.includes(indexName)) {
        await pinecone.createIndex({
            name: indexName,
            dimension: 1536, // Replace with your model dimensions
            metric: 'cosine', // Replace with your model metric
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }// Must match OpenAI embeddings' dimension
        });
    }

    return pinecone.Index(indexName);
};


// ChatGpt embedding
export const getEmbedding = async (text) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
    });
    return response.data[0].embedding;
};


// upload embedding and index
export const upsertDocument = async (role, id, text) => {
    const index = await getPineconeIndex();
    const embedding = await getEmbedding(text);

    const vector = {
        id: id,
        values: embedding,
        metadata: {
            role
        },
    };

    await index.upsert([
        vector
    ]);
};


//Query
export const querySimilarDocuments = async (sessionId, text, topK = 5) => {
    const index = await getPineconeIndex(sessionId);
    const embedding = await getEmbedding(text);

    const queryResponse = await index.query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
    });
    return queryResponse.matches;
};