import { ingestPdf } from "@/app/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/ingest — upload a PDF to (re)build the FAISS knowledge base.
 *
 * From Postman:
 *   - Body → form-data, key "file" (type File) → select your PDF, OR
 *   - Body → binary (raw) with header Content-Type: application/pdf
 */
export async function POST(req: Request) {
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

    const chunks = await ingestPdf(file);

    return Response.json({
      ok: true,
      chunks,
      message: `FAISS index built from the uploaded PDF and saved to /faiss_store (${chunks} chunks).`,
    });
  } catch (err) {
    console.error("ingest error", err);
    return Response.json(
      { error: "Failed to ingest PDF", detail: String(err) },
      { status: 500 }
    );
  }
}
