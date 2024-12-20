import { Pinecone } from "@pinecone-database/pinecone";
import { queryPineconeVectorStore, upsertToPinecone } from "@/utils";
import { Message, streamText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const google = createGoogleGenerativeAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GEMINI_API_KEY
});

const model = google('models/gemini-1.5-flash-8b');

export async function PUT(req: Request) {
    try {
        const { documents } = await req.json();

        if (!Array.isArray(documents)) {
            return NextResponse.json(
                { error: "Documents must be an array" },
                { status: 400 }
            );
        }

        const formattedDocs = documents.map((doc, index) => ({
            id: doc.id || `doc_${index}`,
            text: doc.text,
            metadata: {
                ...doc.metadata,
                timestamp: new Date().toISOString()
            }
        }));

        await upsertToPinecone(
            pinecone,
            'rag-pdf-chat',
            "testspace",
            formattedDocs
        );

        return NextResponse.json({
            success: true,
            message: `Successfully uploaded ${documents.length} documents`
        });
    } catch (error) {
        console.error("Error uploading documents:", error);
        return NextResponse.json(
            { error: "Failed to upload documents" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const reqBody = await req.json();
    const messages: Message[] = reqBody.messages;
    const userQuestion = `${messages[messages.length - 1].content}`;

    const documentData: string = reqBody.data.reportData;
    const query = `Represent this for searching relevant passages: user document says: \n${documentData}. \n\n${userQuestion}`;

    const retrievals = await queryPineconeVectorStore(pinecone, 'rag-pdf-chat', "testspace", query);

    let finalPrompt = '';

    console.log("Retrievals:", retrievals);

    if (retrievals === "<nomatches>" || !documentData) {
        // Handle general knowledge queries
        finalPrompt = `You are a knowledgeable AI assistant. Please provide an accurate, clear, and well-structured response to the following question. If the question involves historical facts, statistics, or specific data, include those details in your response.

        **User Query:**
        ${userQuestion}

        **Instructions:**
        1. Provide a comprehensive yet concise answer
        2. Include relevant dates, names, and facts when applicable
        3. If appropriate, provide context for better understanding
        4. If there are multiple aspects to the answer, structure them clearly

        **Answer:**`;
    } else {
        // Handle legal document queries
        finalPrompt = `Here is a summary of a legal document, and a user query. Some generic legal insights are also provided that may or may not be relevant for the document.
        Go through the legal document and answer the user query.
        Ensure the response is legally precise, and demonstrates a thorough understanding of the query topic and the document's contents.
        Before answering you may enrich your knowledge by going through the provided legal insights. 
        The legal insights are generic information and not part of the specific legal document. Do not include any legal insight if it is not relevant for the specific case.
        
        \n\n**Legal Document Summary:** \n${documentData}
        \n**end of legal document** 
        
        \n\n**User Query:**\n${userQuestion}
        \n**end of user query** 
        
        \n\n**Generic Legal Insights:**
        \n\n${retrievals}
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