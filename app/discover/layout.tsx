import type { Metadata } from "next";
import { SITE_URL } from "../layout";
import recipeData from "../data/recipie.json";

// Per-page SEO for the discover / recipes page. A route-segment layout can set
// metadata even though the page itself is a Client Component.
export const metadata: Metadata = {
  title: {
    absolute: "Litchi Honey Recipes | Healthy Recipes with Dabur Litchi Honey",
  },
  description:
    "Explore refreshing recipes made with Dabur Litchi Honey including smoothies, yogurt bowls, salads, overnight oats and desserts.",
  keywords: [
    "litchi honey recipes",
    "honey recipes",
    "healthy honey recipes",
    "litchi honey benefits",
  ],
  alternates: { canonical: "/discover" },
  openGraph: {
    type: "website",
    title: "Litchi Honey Recipes | Dabur Litchi Honey",
    description:
      "Explore refreshing recipes made with Dabur Litchi Honey including smoothies, yogurt bowls, salads, overnight oats and desserts.",
    url: `${SITE_URL}/discover`,
  },
};

// Structured data for this page: breadcrumb + one Recipe per recipe card.
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recipes",
        item: `${SITE_URL}/discover`,
      },
    ],
  },
  ...recipeData.map((r, i) => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.title,
    author: { "@type": "Organization", name: "Dabur" },
    recipeCategory: "Healthy",
    recipeCuisine: "Healthy",
    keywords: "litchi honey recipe",
    image: `${SITE_URL}/discover/bottom-card/b${i + 1}.png`,
    recipeIngredient: r.ingredients.map((ing) => ing.name),
    recipeInstructions: r.method.map((step) => ({
      "@type": "HowToStep",
      text: step,
    })),
  })),
];

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    </>
  );
}
