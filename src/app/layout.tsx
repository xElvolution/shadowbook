import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "SHADOWBOOK | Bitget AI Hackathon S2",
  description:
    "Bitget AI Hackathon S2: tokenized US stocks (rTokens). Agents rehearse on a live-priced Bitget shadow twin. You promote sized fills to live at cash open.",
  authors: [{ name: "XElvolution" }],
  keywords: [
    "Bitget",
    "Bitget AI Hackathon S2",
    "rToken",
    "tokenized US stocks",
    "SHADOWBOOK",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
