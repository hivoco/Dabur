import path from "path";
import { existsSync } from "fs";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// The knowledge base: every chunk of the source PDF with its embedding, kept
// on disk as one JSON file and in memory for search.
const STORE_DIR = path.join(process.cwd(), "knowledge_base");
const STORE_FILE = path.join(STORE_DIR, "index.json");
// Index written by the previous (FAISS) version; its chunk texts are migrated.
const LEGACY_DOCSTORE = path.join(process.cwd(), "faiss_store", "docstore.json");
// Bundled starter PDF — kept OUT of /public so it can't be downloaded.
const SEED_PDF = path.join(process.cwd(), "data", "qa.pdf");

// Free local embedding model (transformers.js — no API key).
const MODEL = "Xenova/all-MiniLM-L6-v2";

type Chunk = { text: string; embedding: number[] };
type KnowledgeBase = { model: string; chunks: Chunk[] };

// ---- Embeddings --------------------------------------------------------------

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

function embedder() {
  embedderPromise ??= pipeline("feature-extraction", MODEL, {
    // ONNX Runtime uses every CPU core by default, which pins a small server at
    // 100% on each chat. Two threads is plenty for this tiny model.
    session_options: { intraOpNumThreads: 2, interOpNumThreads: 1 },
  }).catch((err) => {
    embedderPromise = null;
    throw err;
  });
  return embedderPromise;
}

// Mean-pooled, L2-normalised sentence embeddings (so a dot product = cosine).
async function embed(texts: string[]): Promise<number[][]> {
  const pipe = await embedder();
  const out = await pipe(
    texts.map((t) => t.replace(/\n/g, " ")),
    { pooling: "mean", normalize: true }
  );
  return out.tolist() as number[][];
}

// ---- Building the knowledge base ---------------------------------------------

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 700,
  chunkOverlap: 200,
});

// Extract a PDF's text page by page and split it into overlapping chunks.
async function pdfChunks(source: Blob | string): Promise<string[]> {
  const data =
    typeof source === "string"
      ? new Uint8Array(await readFile(source))
      : new Uint8Array(await source.arrayBuffer());
  const parser = new PDFParse({ data });
  try {
    const { pages } = await parser.getText();
    const chunks: string[] = [];
    for (const page of pages) {
      if (page.text.trim()) chunks.push(...(await splitter.splitText(page.text)));
    }
    return chunks;
  } finally {
    await parser.destroy();
  }
}

// Embed the chunks and persist them (written to a temp file, then renamed, so
// a crash mid-write can never leave a half-written index behind).
async function buildAndSave(texts: string[]): Promise<KnowledgeBase> {
  if (texts.length === 0) throw new Error("No text found to index.");
  const vectors = await embed(texts);
  const kb: KnowledgeBase = {
    model: MODEL,
    chunks: texts.map((text, i) => ({ text, embedding: vectors[i] })),
  };
  await mkdir(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(kb));
  await rename(tmp, STORE_FILE);
  return kb;
}

// Chunk texts from the old FAISS docstore.json: [[[id, {pageContent}], …], map].
async function legacyTexts(): Promise<string[] | null> {
  if (!existsSync(LEGACY_DOCSTORE)) return null;
  try {
    const [entries] = JSON.parse(await readFile(LEGACY_DOCSTORE, "utf8")) as [
      [string, { pageContent: string }][],
    ];
    const texts = entries.map(([, doc]) => doc.pageContent).filter(Boolean);
    return texts.length ? texts : null;
  } catch {
    return null;
  }
}

// ---- Loading / caching -------------------------------------------------------

// Cached knowledge base for the running server process.
let kbPromise: Promise<KnowledgeBase> | null = null;
// When loading/building last failed. Building embeds the whole PDF (the most
// CPU-heavy job in the app), so after a failure wait before trying again
// instead of re-running it on every chat request.
let lastFailure = 0;
const RETRY_AFTER_MS = 60_000;

async function loadOrBuild(): Promise<KnowledgeBase> {
  if (existsSync(STORE_FILE)) {
    const kb = JSON.parse(await readFile(STORE_FILE, "utf8")) as KnowledgeBase;
    if (kb.model === MODEL && kb.chunks?.length) return kb;
  }
  // First run after upgrading: keep whatever was indexed before (including a
  // PDF uploaded through /api/ingest) by re-embedding the old chunk texts.
  const migrated = await legacyTexts();
  if (migrated) return buildAndSave(migrated);
  return buildAndSave(await pdfChunks(SEED_PDF));
}

function knowledgeBase(): Promise<KnowledgeBase> {
  if (!kbPromise && Date.now() - lastFailure < RETRY_AFTER_MS) {
    return Promise.reject(new Error("Knowledge base unavailable; retrying shortly."));
  }
  kbPromise ??= loadOrBuild().catch((err) => {
    kbPromise = null; // allow a retry once the cool-down has passed
    lastFailure = Date.now();
    throw err;
  });
  return kbPromise;
}

// ---- Public API --------------------------------------------------------------

/** Make sure the knowledge base is ready (throws if it can't be loaded/built). */
export async function ensureKnowledgeBase(): Promise<void> {
  await knowledgeBase();
}

/**
 * The `k` chunks most similar to `query` (cosine similarity), best first.
 */
export async function searchKnowledge(query: string, k = 6): Promise<string[]> {
  const [kb, [q]] = await Promise.all([knowledgeBase(), embed([query])]);
  return kb.chunks
    .map((c) => {
      let score = 0;
      for (let i = 0; i < q.length; i++) score += q[i] * c.embedding[i];
      return { text: c.text, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((c) => c.text);
}

/**
 * Rebuild the knowledge base from a freshly uploaded PDF, persist it, and
 * refresh the in-memory cache. Returns the number of chunks indexed.
 */
export async function ingestPdf(source: Blob | string): Promise<number> {
  const kb = await buildAndSave(await pdfChunks(source));
  kbPromise = Promise.resolve(kb);
  return kb.chunks.length;
}
