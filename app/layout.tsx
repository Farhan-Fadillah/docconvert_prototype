import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Menggunakan font Inter agar terlihat modern dan rapi
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocConvert Pro | Kemenkumham Prototype",
  description: "Prototipe Aplikasi Konversi PDF ↔ Word Skala Enterprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}