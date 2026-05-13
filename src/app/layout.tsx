import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AnimatedBg } from "@/components/animated-bg";
import { AIAssistantFab } from "@/components/ai-assistant-fab";
import { CommandPalette } from "@/components/command-palette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexCart — The Future of Intelligent Commerce",
  description:
    "AI-powered ecommerce built for the next generation of digital shopping. Discover smartphones, laptops, audio gear and more, hand-picked by NexCart Intelligence™.",
  metadataBase: new URL("https://nexcart.app"),
  openGraph: {
    title: "NexCart — The Future of Intelligent Commerce",
    description:
      "AI-powered ecommerce built for the next generation of digital shopping.",
    images: ["/brand/nexcart-logo.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexCart — The Future of Intelligent Commerce",
    description:
      "AI-powered ecommerce built for the next generation of digital shopping.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="relative overflow-x-hidden bg-bg text-text">
        <AnimatedBg />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <CartDrawer />
        <CommandPalette />
        <AIAssistantFab />
      </body>
    </html>
  );
}
