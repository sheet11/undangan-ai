import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Poppins } from "next/font/google";
import "./globals.css";

const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading" });
const body = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-body" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script" });

export const metadata: Metadata = {
  title: "Nadya & Aldo | Wedding Invitation",
  description: "Undangan pernikahan Nadya Putri dan Aldo Pratama.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
