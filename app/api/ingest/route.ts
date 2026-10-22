import { timingSafeEqual } from "crypto";
import { ingestPdf } from "@/app/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 300;

// Largest PDF we will accept (bytes).
const MAX_PDF_BYTES = 20 * 1024 * 1024;

// Constant-time compare so the key can't be guessed byte by byte from timing.
function keyMatches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/ingest — upload a PDF to (re)build the FAISS knowledge base.
 *
 * Protected: set INGEST_SECRET in the server environment and send it in the
 * `x-ingest-key` header. With no INGEST_SECRET configured the endpoint is
 * disabled, so nobody can replace the chatbot's knowledge.
 *
 * From Postman:
 *   - Headers → x-ingest-key: <INGEST_SECRET>
 *   - Body → form-data, key "file" (type File) → select your PDF, OR
 *   - Body → binary (raw) with header Content-Type: application/pdf
 */
export async function POST(req: Request) {
  const secret = process.env.INGEST_SECRET;
  if (!secret) {
    return Response.json({ error: "Ingest is disabled." }, { status: 403 });
  }
  if (!keyMatches(req.headers.get("x-ingest-key") ?? "", secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_PDF_BYTES + 64 * 1024) {
    return Response.json({ error: "PDF is too large (max 20 MB)." }, { status: 413 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let file: Blob | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const f = form.get("file") ?? form.get("pdf");
      if (f instanceof Blob) file = f;
    } else if (
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream")
    ) {
      const buf = await req.arrayBuffer();
      file = new Blob([buf], { type: "application/pdf" });
    }

    if (!file || file.size === 0) {
      return Response.json(
        {
          error:
            "No PDF received. Send it as form-data 'file', or as a raw binary body with Content-Type: application/pdf.",
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_PDF_BYTES) {
      return Response.json({ error: "PDF is too large (max 20 MB)." }, { status: 413 });
    }
    // Must actually be a PDF (magic bytes "%PDF-").
    const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...head) !== "%PDF-") {
      return Response.json({ error: "File is not a PDF." }, { status: 415 });
    }

    const chunks = await ingestPdf(file);

    return Response.json({
      ok: true,
      chunks,
      message: `FAISS index built from the uploaded PDF and saved to /faiss_store (${chunks} chunks).`,
    });
  } catch (err) {
    // Log the detail server-side only; never echo internals to the client.
    console.error("ingest error", err);
    return Response.json({ error: "Failed to ingest PDF." }, { status: 500 });
  }
}
