import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/hooks/use-cart";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BalenpopStore - Klakat Stainless & Alat Dapur Premium",
  description: "Toko klakat kukusan stainless tebal anti karat, peralatan masak UMKM, dan perlengkapan katering berkualitas premium. Pemesanan mudah langsung via WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg-canvas text-text-primary antialiased min-h-screen selection:bg-accent selection:text-white" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
