// Serialize structured data for a <script type="application/ld+json"> tag.
// Escaping "<" means no value (e.g. a stray "</script>") can ever close the tag
// early and inject markup.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
