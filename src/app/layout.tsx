import type { Metadata, Viewport } from "next";
import { Anton, Inter, Mr_Dafoe } from "next/font/google";
import { siteUrl } from "@/lib/data";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const mrDafoe = Mr_Dafoe({ variable: "--font-mrdafoe", weight: "400", subsets: ["latin"], display: "swap" });

const title = "Bunked for GTA 6";
const description = "Live counter of everyone skipping college or work for GTA 6. Add your excuse.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    type: "website",
    images: [{ url: "/api/card", width: 1200, height: 630, alt: "Live count of people bunking for GTA 6" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/api/card"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0620",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${mrDafoe.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
