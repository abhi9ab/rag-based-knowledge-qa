import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_TOKEN)

export async function queryPineconeVectorStore(
    client: Pinecone,
    indexName: string,
    namespace: string,
    searchQuery: string
): Promise<string> {
    try {
        const apiOutput = await hf.featureExtraction({
            model: "mixedbread-ai/mxbai-embed-large-v1",
            inputs: searchQuery,
        });
        console.log("Hugging Face API Output:", apiOutput);

        const queryEmbedding = Array.from(apiOutput);
        const index = client.Index(indexName);

        const queryResponse = await index.namespace(namespace).query({
            topK: 5,
            vector: queryEmbedding as any,
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
        return "<nomatches>"; // Fallback in case of errors.
    }
}