import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Women Behind the Harvest | Jeevika Didi & Dabur Litchi Honey",
  },
  description:
    "Meet the women harvesters behind Dabur Litchi Honey. Crafted in partnership with JEEVIKA, empowering rural women livelihoods in Bihar.",
  keywords: [
    "jeevika didi",
    "women beekeepers",
    "Bihar women livelihoods",
    "women behind the harvest",
  ],
  alternates: { canonical: "/women-harvesters" },
  openGraph: {
    type: "website",
    title: "Women Behind the Harvest | Dabur Litchi Honey",
    description:
      "Meet the women harvesters behind Dabur Litchi Honey, crafted in partnership with JEEVIKA in Bihar.",
    url: "/women-harvesters",
  },
};

export default function WomenHarvestersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
