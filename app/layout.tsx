import type { Metadata } from "next";
import { Fredoka } from "next/font/google";

import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Kids English Adventure",
  description: "Nền tảng học tiếng Anh tương tác cho trẻ 5-9 tuổi với Learning Map, gamification và lesson engine.",
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
