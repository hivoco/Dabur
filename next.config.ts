import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests when the site is opened from another
  // device on the LAN (e.g. your phone) via this machine's IP address.
  // Add each host/IP you use to reach the dev server.
  allowedDevOrigins: ["192.168.1.137"],

  // Keep native / heavy RAG deps out of the bundler (run them in Node directly).
  serverExternalPackages: [
    "faiss-node",
    "@huggingface/transformers",
    "pdf-parse",
  ],
};

export default nextConfig;
