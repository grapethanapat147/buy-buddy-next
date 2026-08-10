import type { Metadata } from "next";
import { Mitr, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/** Display face for headings + the wordmark — warm geometric, Thai + Latin. */
const display = Mitr({
  variable: "--font-mitr",
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
});

/** Body face — clean, highly readable Thai + Latin, bundled so it renders the
 *  same on every device (no more falling back to an uncontrolled system font). */
const body = IBM_Plex_Sans_Thai({
  variable: "--font-plex",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BuyBuddy",
  description: "จัดของเข้าห้องง่าย ๆ ตามงบ — เพื่อนช่วยช้อปของคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
