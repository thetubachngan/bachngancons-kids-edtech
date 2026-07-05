import type { Metadata } from "next";
import { Fredoka } from "next/font/google";

import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Bee & Cat English Adventure",
  description: "Ứng dụng học tiếng Anh lớp 2 với flashcards, hội thoại và mini quiz sinh động cho trẻ em.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${fredoka.variable} font-fredoka antialiased`}>{children}</body>
    </html>
  );
}
