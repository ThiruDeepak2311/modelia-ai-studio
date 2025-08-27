import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Modelia AI Studio",
  description: "Transform fashion visuals with AI-powered generation",
  keywords: ["fashion", "AI", "image generation", "style"],
  authors: [{ name: "Deepak T" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}
        suppressHydrationWarning
      >
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}