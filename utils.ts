import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_TOKEN)

async function generateEmbeddings(text: string): Promise<number[]> {
    try {
        const apiOutput = await hf.featureExtraction({
            model: "mixedbread-ai/mxbai-embed-large-v1",
            inputs: text,
        });
        
        const flatEmbedding = Array.isArray(apiOutput) 
            ? apiOutput.flat(2) 
            : Array.from(apiOutput);
            
        if (!flatEmbedding.every(val => typeof val === 'number')) {
            throw new Error('Embedding contains non-numeric values');
        }
        
        return flatEmbedding;
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw error;
    }
}

interface Document {
    id: string;
    text: string;
    metadata?: Record<string, any>;
}

export async function upsertToPinecone(
    client: Pinecone,
    indexName: string,
    namespace: string,
    documents: Document[]
): Promise<void> {
    try {
        const index = client.Index(indexName);
        
        const BATCH_SIZE = 100;
        for (let i = 0; i < documents.length; i += BATCH_SIZE) {
            const batch = documents.slice(i, i + BATCH_SIZE);
            
            const vectors = await Promise.all(
                batch.map(async (doc) => {
                    const embedding = await generateEmbeddings(doc.text);
                    return {
                        id: doc.id,
                        values: embedding,
                        metadata: {
                            ...doc.metadata,
                            chunk: doc.text
                        }
                    };
                })
            );

            await index.namespace(namespace).upsert(vectors);
            console.log(`Upserted batch ${i / BATCH_SIZE + 1} to Pinecone`);
        }
        
        console.log("Successfully upserted all documents to Pinecone");
    } catch (error) {
        console.error("Error upserting to Pinecone:", error);
        throw error;
    }
}

export async function queryPineconeVectorStore(
    client: Pinecone,
    indexName: string,
    namespace: string,
    searchQuery: string
): Promise<string> {
    try {
        const queryEmbedding = await generateEmbeddings(searchQuery);
        const index = client.Index(indexName);
        
        const queryResponse = await index.namespace(namespace).query({
            topK: 5,
            vector: queryEmbedding,
            includeMetadata: true,
            includeValues: false,
        });

        console.log("Pinecone Query Response:", queryResponse);

        if (queryResponse.matches.length > 0) {
            const concatenatedRetrievals = queryResponse.matches
                .map((match, index) => `\nDocument Finding ${index + 1}: \n${match.metadata?.chunk}`)
                .join(". \n\n");
            return concatenatedRetrievals;
        } else {
            console.log("No matches found in Pinecone.");
            return "<nomatches>";
        }
    } catch (error) {
        console.error("Error in queryPineconeVectorStore:", error);
        return "<nomatches>";
    }
}