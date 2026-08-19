import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";

import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fffaf0",
};

export const metadata: Metadata = {
  title: "Penguin English",
  description: "Nền tảng học tiếng Anh tương tác cho trẻ 5-9 tuổi với Learning Map, gamification và lesson engine.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
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
