import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
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

// Canned replies the CHO must reproduce verbatim. Kept as constants so the exact
// wording and contact details live in a single place.
const OUT_OF_SCOPE_MESSAGE = `I'm sorry, but I'm unable to provide the information you're looking for at the moment.

For detailed assistance regarding your query, please contact our **Customer Care team** at **[1800 103 1644](tel:18001031644)** or email us at **[daburcares@dabur.com](mailto:daburcares@dabur.com)**.

You can also visit **[www.daburhoney.com](https://www.daburhoney.com)** for more information about Dabur Honey products and services.`;

const LEGAL_DISCLAIMER = `*data shown as per public domain.*

For detailed assistance regarding your query, please contact our **Customer Care team** at **[1800 103 1644](tel:18001031644)** or email us at **[daburcares@dabur.com](mailto:daburcares@dabur.com)**.

You can also visit **[www.daburhoney.com](https://www.daburhoney.com)** for more information about Dabur Honey products and services.

Our team will be happy to assist you.`;

const SYSTEM_PROMPT = `You are the "Chief Honey Officer" (CHO), a warm, helpful assistant for Dabur Litchi Honey.
Answer the user's question using ONLY the context below, which is extracted from a Q&A document.

Always respond in clean, well-structured **Markdown** — use short paragraphs, **bold** for emphasis,
and bullet/numbered lists where it helps readability.

If the answer to the user's question is NOT clearly present in the context, do NOT guess or use any outside knowledge. Reply with EXACTLY the following text and nothing else (no extra words, headings, or formatting before or after it):

${OUT_OF_SCOPE_MESSAGE}

Context:
{context}`;

export async function POST(req: Request) {
  try {
    const { message, history } = (await req.json()) as {
      message?: string;
      history?: { role?: string; content?: string }[];
    };
    if (!message || typeof message !== "string") {
      return new Response("Missing 'message'", { status: 400 });
    }

    // Short-term memory: the last few turns the client kept in its tab session,
    // converted to LangChain messages so the model has conversational context.
    const historyMsgs: BaseMessage[] = (Array.isArray(history) ? history : [])
      .slice(-5)
      .filter((h) => h && typeof h.content === "string" && h.content.trim())
      .map((h) =>
        h.role === "bot" || h.role === "assistant"
          ? new AIMessage(h.content as string)
          : new HumanMessage(h.content as string)
      );

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
      new MessagesPlaceholder("history"),
      ["human", "{question}"],
    ]);

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      streaming: true,
    });

    // One RAG chain so LangSmith traces retrieval + prompt + LLM as a single run.
    type ChainInput = { question: string; history: BaseMessage[] };
    const chain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input: ChainInput) => input.question,
          retriever,
          formatDocs,
        ]),
        question: (input: ChainInput) => input.question,
        history: (input: ChainInput) => input.history,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const tokenStream = await chain.stream(
      { question: message, history: historyMsgs },
      { runName: "cho-rag", tags: ["rag", "chat"] }
    );

    // The legal/compliance/certifications/tests disclaimer is appended in code
    // (not via the prompt) so it is added reliably and ONLY for those topics —
    // the small model tends to over- or under-apply such a conditional rule.
    const needsDisclaimer =
      /\b(legal|complian\w*|certif\w*|tests?|tested|testing|labs?|laborator\w*|fssai|nmr|accredit\w*|regulat\w*|licen[sc]e\w*|standards?)\b/i.test(
        message
      );

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let acc = "";
        try {
          for await (const token of tokenStream) {
            acc += token;
            controller.enqueue(encoder.encode(token));
          }
          // Never append the disclaimer to the out-of-knowledge fallback reply.
          const isFallback = acc.includes(
            "unable to provide the information you're looking for"
          );
          if (needsDisclaimer && !isFallback) {
            controller.enqueue(encoder.encode(`\n\n${LEGAL_DISCLAIMER}`));
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
