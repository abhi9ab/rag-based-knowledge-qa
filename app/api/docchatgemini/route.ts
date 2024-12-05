import { Pinecone } from "@pinecone-database/pinecone";
import { queryPineconeVectorStore } from "@/utils";
import { Message } from "ai/react";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

export async function POST(req: Request, res: Response) {
    const reqBody = await req.json();
    console.log(reqBody);

    const messages: Message[] = reqBody.messages;
    const userQuestion = `${messages[messages.length - 1].content}`;

    const reportData: string = reqBody.data.reportData;
    const query = `Represent this for searching relevant passages: user document says: \n${reportData}. \n\n${userQuestion}`;

    const retrievals = await queryPineconeVectorStore(pinecone, 'rag-pdf-chat', "testspace", query);

    return new Response("dummy response", {status: 200});
}