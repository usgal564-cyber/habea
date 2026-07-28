import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ХАБЭА - Ажлын байраны аюулгүй байдал, эрүүл мэнд",
  description:
    "Ажлын байраны эрүүл мэнд, аюулгүй байдал, байгаль орчны талаар сургалт, зөвлөгөө, үйлчилгээ үзүүлдэг ХАБЭА Бага Дунд Аж Ахуйн Нэгж",
  keywords: [
    "ХАБЭА",
    "аюулгүй байдал",
    "эрүүл мэнд",
    "сургалт",
    "ISO стандарт",
    "Монгол",
    "OHS",
  ],
  authors: [{ name: "ХАБЭА Бага Дунд Аж Ахуйн Нэгж" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
