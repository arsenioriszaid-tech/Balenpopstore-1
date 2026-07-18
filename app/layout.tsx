import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
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

// Editorial Premium: warm serif display face for headings — gives the brand a
// crafted/artisan feel (matches the family-workshop heritage story) instead of
// the generic SaaS look of an all-sans-serif type system. Exposed as
// --font-display-family, which app/globals.css references via --font-display.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-family",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}
    >
      <body className="bg-bg-canvas text-text-primary antialiased min-h-screen selection:bg-accent selection:text-white" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 3500,
            className: "font-sans",
            style: {
              fontFamily: "var(--font-sans)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-custom)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-premium)",
            },
          }}
        />
      </body>
    </html>
  );
}
