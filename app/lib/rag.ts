import path from "path";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// The FAISS index is persisted here (faiss.index + docstore.json).
const STORE_DIR = path.join(process.cwd(), "faiss_store");

// Free local embedding model (transformers.js — no API key).
function embeddings() {
  return new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });
}

// Cached store for the running server process.
let storePromise: Promise<FaissStore> | null = null;

// Extract a PDF (uploaded Blob or a file path), embed it, and persist to disk.
async function buildAndSave(
  source: Blob | string
): Promise<{ store: FaissStore; chunks: number }> {
  const loader = new PDFLoader(source);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(docs);

  const store = await FaissStore.fromDocuments(chunks, embeddings());
  await mkdir(STORE_DIR, { recursive: true });
  await store.save(STORE_DIR);

  return { store, chunks: chunks.length };
}

/**
 * Build the FAISS index from a freshly uploaded PDF, persist it to disk, and
 * refresh the in-memory cache. Returns the number of chunks indexed.
 */
export async function ingestPdf(source: Blob | string): Promise<number> {
  const { store, chunks } = await buildAndSave(source);
  storePromise = Promise.resolve(store);
  return chunks;
}

/**
 * Get the vector store for querying. Loads the persisted index from disk if it
 * exists; otherwise seeds it from the bundled /public/qa.pdf on first use.
 */
export function getVectorStore(): Promise<FaissStore> {
  if (!storePromise) {
    storePromise = (async () => {
      if (existsSync(path.join(STORE_DIR, "faiss.index"))) {
        return FaissStore.load(STORE_DIR, embeddings());
      }
      const { store } = await buildAndSave(
        path.join(process.cwd(), "public", "qa.pdf")
      );
      return store;
    })().catch((err) => {
      storePromise = null; // allow a retry on the next request
      throw err;
    });
  }
  return storePromise;
}
