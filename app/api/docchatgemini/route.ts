import { Pinecone } from "@pinecone-database/pinecone";
import { queryPineconeVectorStore } from "@/utils";
import { Message, streamText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const google = createGoogleGenerativeAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GEMINI_API_KEY
});

const model = google('models/gemini-1.5-flash-8b');

export async function POST(req: Request) {
    const reqBody = await req.json();
    const messages: Message[] = reqBody.messages;
    const userQuestion = `${messages[messages.length - 1].content}`;

    const documentData: string = reqBody.data.reportData;
    const query = `Represent this for searching relevant passages: user document says: \n${documentData}. \n\n${userQuestion}`;

    const retrievals = await queryPineconeVectorStore(pinecone, 'rag-pdf-chat', "testspace", query);

    let finalPrompt = '';

    console.log("Retrievals:", retrievals);

    if (retrievals === "<nomatches>") {
        console.log("No relevant data retrieved. Falling back to general knowledge.");
        finalPrompt = `The user has asked a question unrelated to any provided document. Use general knowledge to answer accurately, clearly, and concisely.
        
        **User Query:**\n${userQuestion}
        \n\n**Answer:**`;
    } else {
        finalPrompt = `Here is a summary of a legal document, and a user query. Some generic legal insights are also provided that may or may not be relevant for the document.
        Go through the legal document and answer the user query.
        Ensure the response is legally precise, and demonstrates a thorough understanding of the query topic and the document's contents.
        Before answering you may enrich your knowledge by going through the provided legal insights. 
        The legal insights are generic information and not part of the specific legal document. Do not include any legal insight if it is not relevant for the specific case.
        
        \n\n**Legal Document Summary:** \n${documentData}. 
        \n**end of legal document** 
        
        \n\n**User Query:**\n${userQuestion}?
        \n**end of user query** 
        
        \n\n**Generic Legal Insights:**
        \n\n${retrievals}. 
        \n\n**end of generic legal insights** 
        
        \n\nProvide thorough legal reasoning and justification for your answer.
        \n\n**Answer:**`;
    }

    const result = await streamText({
        model: model,
        prompt: finalPrompt,
    });

    return result.toDataStreamResponse();
}