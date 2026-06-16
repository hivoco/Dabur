import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BackgroundProvider from "./components/Background";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dabur",
  description: "Dabur - Your website",
};

// Prevent zoom/scaling (pinch-zoom and input-focus auto-zoom on mobile).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className="min-h-svh ">
        <BackgroundProvider>{children}</BackgroundProvider>
      </body>
    </html>
  );
}
