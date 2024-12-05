# RAG PDF Legal Document Chat Application

## Overview

This application provides an intelligent, context-aware chatbot for legal document analysis using Retrieval Augmented Generation (RAG) with Pinecone vector storage and Google Gemini AI.

## Features

- 📄 Upload and process legal documents
- 🔍 Semantic search through document content
- 💬 AI-powered query answering
- 🧠 Contextual understanding of legal documents

## Technologies Used

- Next.js
- TypeScript
- Pinecone Vector Database
- Google Gemini AI
- Hugging Face Inference
- Vector Embedding

## Prerequisites

- Node.js (v18+)
- Pinecone Account
- Google AI Studio Account
- Hugging Face Account

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in the values with your actual credentials
3. Do not commit your `.env` file

```bash
PINECONE_API_KEY=your_pinecone_api_key
HF_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_google_ai_studio_key
```

## Installation

1. Clone the repository
```bash
git clone https://your-repo-url.git
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

## Key Components

### Vector Storage (`utils.ts`)
- Handles embedding generation
- Queries Pinecone vector store
- Retrieves contextually relevant document sections

### Route Handler (`route.ts`)
- Processes user queries
- Integrates document context
- Streams AI-generated responses

## Embedding Model

Uses `mixedbread-ai/mxbai-embed-large-v1` for high-quality semantic embeddings

## Deployment Considerations

- Ensure vector index is pre-populated
- Configure proper environment variables
- Use serverless/edge runtime compatible deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
