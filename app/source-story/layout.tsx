import type { Metadata } from "next";
import { OG_IMAGE } from "../layout";

export const metadata: Metadata = {
  title: {
    absolute: "From Shahi Litchi Blossoms to Honey | Dabur Litchi Honey",
  },
  description:
    "Discover the journey of Dabur Litchi Honey from GI-tagged Shahi Litchi blossoms in Muzaffarpur to every spoonful of monofloral honey.",
  keywords: [
    "Shahi Litchi",
    "Muzaffarpur litchi",
    "GI tagged litchi",
    "litchi honey source story",
  ],
  alternates: { canonical: "/source-story" },
  openGraph: {
    type: "website",
    siteName: "Dabur Litchi Honey",
    title: "From Shahi Litchi Blossoms to Honey | Dabur Litchi Honey",
    description:
      "The journey of Dabur Litchi Honey from GI-tagged Shahi Litchi blossoms in Muzaffarpur.",
    url: "/source-story",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "From Shahi Litchi Blossoms to Honey | Dabur Litchi Honey",
    description:
      "The journey of Dabur Litchi Honey from GI-tagged Shahi Litchi blossoms in Muzaffarpur.",
    images: [OG_IMAGE.url],
  },
};

export default function SourceStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
