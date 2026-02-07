import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Assuming these exist, otherwise use Inter
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "魁！E子、エロい子、ドエロい子",
  description: "最高のVR体験をあなたに。厳選されたVR動画を紹介するアフィリエイトサイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-200 min-h-screen`}
      >
        <Navigation />
        <main className="min-h-screen pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
