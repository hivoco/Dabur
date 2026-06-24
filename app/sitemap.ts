import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/discover`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITE_URL}/women-harvesters`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/source-story`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
