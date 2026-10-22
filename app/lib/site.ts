// Public origin used for canonical URLs, Open Graph (share image) and JSON-LD.
// Link previews only work if this origin really serves the app, so it must be
// the CURRENT live URL. NEXT_PUBLIC_SITE_URL (read at build time) overrides it.
// TODO at launch: change to "https://www.daburlitchihoney.com" once that domain
// points at this app (it is a parked page today).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://test.hivoco.com"
).replace(/\/+$/, "");
