import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BackgroundProvider from "./components/Background";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Public origin used for canonical URLs, Open Graph (share image) and JSON-LD.
// Link previews only work if this origin really serves the app, so it must be
// the CURRENT live URL. NEXT_PUBLIC_SITE_URL (read at build time) overrides it.
// TODO at launch: change to "https://www.daburlitchihoney.com" once that domain
// points at this app (it is a parked page today).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://test.hivoco.com"
).replace(/\/+$/, "");

// Share image (Open Graph / Twitter): the brand logo on a 1200x630 cream canvas.
export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Dabur Honey logo",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dabur Litchi Honey | Monofloral Litchi Honey from Muzaffarpur",
    template: "%s | Dabur Litchi Honey",
  },
  description:
    "Discover Dabur Litchi Honey, a monofloral honey sourced from Shahi Litchi blossoms of Muzaffarpur. Experience its delicate taste, aroma and unique seasonal harvest.",
  applicationName: "Dabur Litchi Honey",
  authors: [{ name: "Dabur India Ltd." }],
  creator: "Dabur India Ltd.",
  publisher: "Dabur India Ltd.",
  keywords: [
    // Primary
    "litchi honey",
    "lychee honey",
    "monofloral honey",
    "honey litchi",
    "honey lychee",
    "litchi flower honey",
    "benefits of litchi honey",
    // Secondary
    "litchi honey benefits",
    "what is litchi honey",
    "buy litchi honey online",
    "litchi honey taste",
    "litchi honey price",
    "lychee honey benefits",
    "raw monofloral honey",
    // Brand / story
    "Jeevika Didi",
    "women beekeepers",
    "Bihar honey",
    "Muzaffarpur litchi",
    "Shahi Litchi",
    "GI tagged litchi",
  ],
  // Canonical for the homepage. Nested route layouts set their own.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Dabur Litchi Honey",
    title: "Dabur Litchi Honey",
    description:
      "Monofloral Litchi Honey sourced from Shahi Litchi blossoms of Muzaffarpur.",
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dabur Litchi Honey",
    description: "Discover monofloral litchi honey from Muzaffarpur.",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Favicons come from the file conventions: app/favicon.ico, app/icon.png
  // and app/apple-icon.png (all generated from the logo).
};

// Prevent zoom/scaling (pinch-zoom and input-focus auto-zoom on mobile).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Structured data (JSON-LD), rendered server-side so crawlers see it in the
// initial HTML. Product/FAQ describe the single product this whole site is
// about, so they live site-wide.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
  {
    "@type": "Organization",
    name: "Dabur India Ltd.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-1.webp`,
  },
  {
    "@type": "WebSite",
    name: "Dabur Litchi Honey",
    url: SITE_URL,
  },
  {
    "@type": "Product",
    name: "Dabur Litchi Honey",
    brand: { "@type": "Brand", name: "Dabur" },
    description:
      "Monofloral litchi honey sourced from Shahi Litchi blossoms of Muzaffarpur, Bihar.",
    category: "Honey",
    image: `${SITE_URL}/mono1.webp`,
    url: SITE_URL,
    keywords: [
      "litchi honey",
      "lychee honey",
      "monofloral honey",
      "litchi flower honey",
    ],
  },
  {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is litchi honey?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Litchi honey is monofloral honey produced primarily from Shahi Litchi blossoms.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Dabur Litchi Honey unique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It is sourced from Shahi Litchi blossoms of Muzaffarpur and harvested during the seasonal flowering period.",
        },
      },
      {
        "@type": "Question",
        name: "What are the benefits of litchi honey?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Litchi honey can be enjoyed as part of a balanced lifestyle and offers a unique floral taste and aroma.",
        },
      },
      {
        "@type": "Question",
        name: "What is monofloral honey?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Monofloral honey comes primarily from the nectar of a single floral source.",
        },
      },
    ],
  },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Background first: it's a CSS image (found only after the stylesheet)
            and the biggest thing on screen, so fetch the right size at the
            highest priority straight from the HTML. Media queries match
            .app-bg in globals.css. */}
        <link
          rel="preload"
          as="image"
          href="/bg-mobile.webp"
          media="(max-width: 767px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/bg.webp"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-svh ">
        <BackgroundProvider>
          {/* Page container: centred, max 1440px. transform-gpu makes it the
              containing block for position:fixed descendants, so the fixed
              page overlays, close buttons and chat button stay inside it.
              Full-screen dim/blur layers opt out with `full-bleed`. */}
          <div className="relative mx-auto min-h-svh w-full max-w-360 transform-gpu">
            {children}
          </div>
        </BackgroundProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  );
}
