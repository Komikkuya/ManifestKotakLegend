import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://manifest.kotaklegend.my.id"),
  title: "ManifestKotakLegend | Steam Manifest & Lua Downloader",
  description: "The ultimate Steam manifestor and lua downloader. Securely fetch game manifests, depot keys, and lua scripts instantly with ManifestKotakLegend.",
  keywords: ["steam manifest downloader", "lua downloader", "steam manifestor", "steam depot downloader", "steam manifest keys", "steam lua script downloader", "kotaklegend"],
  openGraph: {
    title: "ManifestKotakLegend | Steam Manifest Downloader",
    description: "Securely download Steam manifests and LUA files instantly.",
    url: "https://manifest.kotaklegend.my.id",
    siteName: "ManifestKotakLegend",
    images: [
      {
        url: "/og_image_manifest_kotaklegend.png",
        width: 1200,
        height: 630,
        alt: "ManifestKotakLegend Preview",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/30 selection:text-primary">
        <Navbar />
        <main className="relative flex min-h-[calc(100vh-64px)] flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
