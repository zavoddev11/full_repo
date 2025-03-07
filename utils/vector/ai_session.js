import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { config } from "dotenv";
import data from "./data.js";
import { encoding_for_model } from "tiktoken";
import Sitedata from "../../models/sitedata.js";

config(); // Load environment variables

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINE_KEYS,
});

function decodeUint8Array(uint8Array) {
    return new TextDecoder("utf-8").decode(uint8Array);
}

/**
 * Split text into chunks of maxTokens (default: 500)
 */


function splitTextByTokens(text, maxTokens = 500) {
    const encoder = encoding_for_model("gpt-4"); // Use GPT-4 tokenizer
    const tokens = encoder.encode(text);

    let chunks = [];
    let start = 0;

    while (start < tokens.length) {
        let end = Math.min(start + maxTokens, tokens.length);
        const chunkText = encoder.decode(tokens.slice(start, end)); // Convert back to readable text
        chunks.push(chunkText);
        start = end;
    }

    return chunks; // Returns an array of split text chunks
}


// ✅ Get Pinecone Index (creates if it doesn't exist)
export const getPineconeIndex = async (indexName) => {
    try {
        const existingIndexes = (await pinecone.listIndexes()).indexes.map(idx => idx.name);

        if (!existingIndexes.includes(indexName)) {
            console.log(`Creating Pinecone index: ${indexName}...`);

            await pinecone.createIndex({
                name: indexName,
                dimension: 1536, // Match OpenAI embeddings' dimension
                metric: "cosine",
                spec: { serverless: { cloud: "aws", region: "us-east-1" } },
            });
        }

        console.log(`Using Pinecone index: ${indexName}`);
        return pinecone.Index(indexName);
    } catch (error) {
        console.error("Error getting Pinecone index:", error);
        throw error;
    }
};

export const deletePineconeIndex = async (indexName) => {
    try {
        await pinecone.deleteIndex(indexName);
        console.log(`Index "${indexName}" deleted successfully.`);
    } catch (error) {
        console.error("Error deleting index:", error);
    }
};

// ✅ Generate embeddings using OpenAI
export const getEmbedding = async (text) => {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        console.log({ response })
        console.log({ data: response.data })

        return response.data[0].embedding; // Fixed response structure
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

// ✅ Upload split text chunks into Pinecone
export const saveWebsiteData = async (id, text) => {
    try {

        console.log({ text })

        const index = await getPineconeIndex(id);

        // ✅ Split the text into chunks of 500 tokens
        let chunks = splitTextByTokens(text, 500);
        console.log(`🔹 Splitting into ${chunks.length} chunks...`);
        chunks = chunks.map(decodeUint8Array);
        console.log({ chunks })

        // ✅ Process each chunk separately
        const vectors = await Promise.all(
            chunks.map(async (chunk, i) => {

                const embedding = await getEmbedding(chunk);

                return {
                    id: `${id}_chunk${i}`, // Unique ID per chunk
                    values: embedding,
                    metadata: { text: chunk, chunk_index: i }, // Store chunk info
                };
            })
        );

        // ✅ Upsert all chunks into Pinecone
        await index.upsert(
            vectors, // Must be wrapped in `vectors`
        );

        console.log(`✅ Successfully stored ${chunks.length} chunks in Pinecone!`);
    } catch (error) {
        console.error("Error saving data to Pinecone:", error);
    }
};


export const querySimilarDocuments = async (indexPoint, text, topK = 5) => {
    const index = await getPineconeIndex(indexPoint);
    const embedding = await getEmbedding(text);

    const queryResponse = await index.query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
    });
    console.log({ matches: JSON.stringify(queryResponse.matches) })
    return queryResponse.matches;
};



async function run() {
    let id = "67c093e44b6e3ee3a8a1fa84"
    try {
        await pinecone.deleteIndex(id);
    } catch (error) {
        console.log({ error })
    }
    let websites = await Sitedata.find({ website_id: id });
    let text = JSON.stringify(websites)
    let chunkSize = 500000
    let chunks = [];
    let start = 0;
    if (text.length > 1000000) {

        while (start < text.length) {
            let end = start + chunkSize;

            // Ensure we don't exceed the string length
            if (end >= text.length) {
                chunks.push(text.substring(start));
                break;
            }

            // Find the nearest space before the limit
            while (end > start && text[end] !== ' ') {
                end--;
            }

            // If no space was found, fall back to a hard split
            if (end === start) {
                end = start + chunkSize;
            }

            chunks.push(text.substring(start, end).trim());
            start = end + 1; // Move past the space
        }

        // Process each chunk (simulate async save)
        for (const chunk of chunks) {
            console.log({ chuncks: chunks.length })
            await saveWebsiteData(id, chunk);
        }
    } else
        await saveWebsiteData(id, text);

    // Finally, delete the Pinecone index
    // await deletePineconeIndex("67c093e44b6e3ee3a8a1fa84");
}

// run()