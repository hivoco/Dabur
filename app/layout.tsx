import type { Metadata } from "next";
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
