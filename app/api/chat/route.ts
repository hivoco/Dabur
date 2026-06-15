import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import type { Document } from "@langchain/core/documents";
import { getVectorStore } from "@/app/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 60;

// Allow the chat to be called from a different origin (e.g. local dev frontend
// hitting the deployed backend). Tighten "*" to a specific origin if you prefer.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const SYSTEM_PROMPT = `You are the "Chief Honey Officer" (CHO), a warm, helpful assistant for Dabur Litchi Honey.
Answer the user's question using ONLY the context below, which is extracted from a Q&A document.
If the answer is not in the context, politely say you don't have that information yet.

Always respond in clean, well-structured **Markdown** — use short paragraphs, **bold** for emphasis,
and bullet/numbered lists where it helps readability.

Context:
{context}`;

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };
    if (!message || typeof message !== "string") {
      return new Response("Missing 'message'", { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response("GROQ_API_KEY is not set", { status: 500 });
    }

    // Retrieve the most relevant chunks from the FAISS index.
    let store;
    try {
      store = await getVectorStore();
    } catch (err) {
      console.error("vector store load error", err);
      return new Response(
        "I couldn't load the knowledge base yet. Please upload a PDF to `/api/ingest` first.",
        { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
    const retriever = store.asRetriever(4);
    const formatDocs = (docs: Document[]) =>
      docs.map((d) => d.pageContent).join("\n\n---\n\n");

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      ["human", "{question}"],
    ]);

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      streaming: true,
    });

    // One RAG chain so LangSmith traces retrieval + prompt + LLM as a single run.
    const chain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input: { question: string }) => input.question,
          retriever,
          formatDocs,
        ]),
        question: (input: { question: string }) => input.question,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const tokenStream = await chain.stream(
      { question: message },
      { runName: "cho-rag", tags: ["rag", "chat"] }
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const token of tokenStream) {
            controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          console.error("chat stream error", err);
          controller.enqueue(encoder.encode("\n\n_Sorry, something went wrong._"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        ...CORS,
      },
    });
  } catch (err) {
    console.error("chat api error", err);
    return new Response("Server error", { status: 500 });
  }
}
