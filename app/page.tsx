"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Layers, 
  HelpCircle, 
  ShoppingBag, 
  Check, 
  PhoneCall, 
  Sparkles,
  UtensilsCrossed
} from "lucide-react";

// Fixed steam/particle configuration (kept static so SSR/CSR markup matches)
// Each wisp is rendered as a soft, elongated, blurred streak rather than a hard
// dot so it reads clearly as rising steam at real size instead of visual noise.
const STEAM_PARTICLES = [
  { left: "8%", top: "72%", width: 5, height: 20, duration: 6, delay: 0 },
  { left: "18%", top: "86%", width: 4, height: 16, duration: 7.5, delay: 0.8 },
  { left: "82%", top: "80%", width: 5, height: 22, duration: 6.5, delay: 1.4 },
  { left: "90%", top: "62%", width: 4, height: 16, duration: 8, delay: 0.3 },
  { left: "50%", top: "94%", width: 6, height: 24, duration: 7, delay: 1.9 },
  { left: "30%", top: "14%", width: 4, height: 16, duration: 6.8, delay: 1.1 },
  { left: "70%", top: "17%", width: 5, height: 20, duration: 7.2, delay: 0.5 },
  { left: "95%", top: "37%", width: 4, height: 14, duration: 6.2, delay: 2.2 },
];

// Editorial Premium: variants for Brand Highlights — stagger + gentle scale-in,
// distinct from the plain vertical fade-up used elsewhere on the page.
const highlightsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const highlightsItemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// Editorial Premium: variants for Category Selection — a different stagger
// rhythm/easing than Brand Highlights so the two sections feel distinct
// rather than sharing one copy-pasted reveal.
const categoryContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const categoryItemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Small inline diagram illustrating the product's actual differentiator: the
 * pyramid-shaped lid guiding condensation to the wall of the pot instead of
 * letting it drip back onto the food. Purely decorative/illustrative — no
 * data dependency — so it can live directly in this file.
 */
function PyramidLidDiagram() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 220 160"
      className="w-full max-w-[220px] mx-auto"
      aria-hidden="true"
    >
      {/* Pot walls */}
      <path
        d="M30 150 L30 60 M190 150 L190 60"
        stroke="var(--color-border-strong)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pyramid lid */}
      <path
        d="M20 60 L110 15 L200 60 Z"
        fill="var(--color-primary-subtle)"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Base / steam chamber */}
      <path
        d="M30 150 L190 150"
        stroke="var(--color-border-strong)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Droplet sliding from the apex down the slope to the wall, instead
          of falling straight down onto the food below */}
      <motion.circle
        r="4.5"
        fill="var(--color-accent)"
        initial={{ offsetDistance: "0%", opacity: 0 }}
        animate={
          shouldReduceMotion
            ? { offsetDistance: "55%", opacity: 0.9 }
            : {
                offsetDistance: ["0%", "100%"],
                opacity: [0, 1, 1, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 2.4, repeat: Infinity, ease: "easeIn", repeatDelay: 0.6 }
        }
        style={{
          offsetPath: "path('M110 15 L195 60')",
          offsetRotate: "0deg",
        }}
      />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successProductId, setSuccessProductId] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState(
  "https://ixuicwskzakgelmhcfsh.supabase.co/storage/v1/object/public/product-images/hero/hero_main.jpg"
);
  // Parallax scroll tracking for the hero section
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(heroScrollProgress, [0, 1], [0, 90]);
  const heroBlobY = useTransform(heroScrollProgress, [0, 1], [0, -60]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Load categories
        const { data: catData } = await supabase.from("categories").select("*");
        setCategories(catData || []);

        // Load active featured products
        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .limit(4);
        setProducts(prodData || []);
      } catch (e) {
        console.error("Failed to load storefront data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (product: any) => {
    // Add base product with no variant initially, or fetch first variant
    addToCart(product, null, 1);
    setSuccessProductId(product.id);
    setTimeout(() => setSuccessProductId(null), 2000);

    // The homepage's product query doesn't fetch product_variants (that only
    // happens on the product detail page), so we can't reliably know here
    // whether this product actually has size variants. Rather than silently
    // locking the customer into a base/null-variant item that might be the
    // wrong size, surface it explicitly with a one-tap way to pick a variant
    // on the product page.
    toast("Ditambahkan ke keranjang (ukuran standar)", {
      description: `${product.name} masuk keranjang dengan harga dasar. Jika produk ini tersedia dalam beberapa ukuran, silakan sesuaikan di halaman produk.`,
      action: {
        label: "Pilih Ukuran",
        onClick: () => router.push(`/catalog/${product.id}`),
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col min-h-screen bg-bg-canvas selection:bg-accent selection:text-white"
    >
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-b from-surface/50 to-white pt-12 pb-20 md:py-28 overflow-hidden border-b border-border-custom"
      >
        {/* Ambient grain texture — gives the hero a tactile, material surface
            instead of a flat sterile gradient, evoking brushed steel rather
            than a generic SaaS backdrop. Sits behind everything else. */}
        <div className="absolute inset-0 z-0 bg-grain opacity-40 pointer-events-none" />

        {/* Animated Gradient Blob - moves very slowly, drifts with scroll */}
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[55%] h-[65%] rounded-full blur-3xl"
          style={{ y: heroBlobY }}
          animate={
            shouldReduceMotion
              ? {
                  background:
                    "radial-gradient(circle at 40% 40%, rgba(217,119,87,0.12), rgba(31,41,55,0.05) 60%)",
                }
              : {
                  background: [
                    "radial-gradient(circle at 30% 30%, rgba(217,119,87,0.10), rgba(31,41,55,0.05) 60%)",
                    "radial-gradient(circle at 70% 40%, rgba(217,119,87,0.14), rgba(31,41,55,0.06) 60%)",
                    "radial-gradient(circle at 40% 65%, rgba(217,119,87,0.10), rgba(31,41,55,0.05) 60%)",
                    "radial-gradient(circle at 30% 30%, rgba(217,119,87,0.10), rgba(31,41,55,0.05) 60%)",
                  ],
                  scale: [1, 1.08, 0.97, 1],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 26, repeat: Infinity, ease: "easeInOut" }
          }
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text Info */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-mono font-bold rounded-full uppercase tracking-wider"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                Handcrafted Premium Stainless Steel
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight"
              >
                Klakat Kukusan Stainless <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Kualitas Juara</span> Untuk UMKM Kuliner
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Tebal, awet, dan anti karat. Didesain khusus dengan tutup piramida presisi sehingga uap air kondensasi tidak menetes merusak cita rasa kue, dimsum, atau bakpao Anda.
              </motion.p>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  href="/catalog"
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Lihat Katalog Produk
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/62895365517451?text=Halo%20Admin%20BalenpopStore%2C%20saya%20tertarik%20tanya%20mengenai%20produk%20klakat%20stainless%20custom%20dan%20alat%20dapur."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border border-border-strong hover:bg-surface text-text-primary text-sm font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4 text-accent" />
                  Konsultasi WA (Gratis)
                </motion.a>
              </motion.div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Floating steam wisps around the product image — soft,
                  elongated, blurred streaks that read as rising steam
                  rather than tiny floating dots */}
              <div className="pointer-events-none absolute inset-0 z-20">
                {STEAM_PARTICLES.map((p, i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full bg-gradient-to-t from-white/0 via-white/70 to-white/0 blur-[2px]"
                    style={{
                      left: p.left,
                      top: p.top,
                      width: p.width,
                      height: p.height,
                    }}
                    initial={{ opacity: 0, y: 0, scaleY: 1 }}
                    animate={
                      shouldReduceMotion
                        ? { opacity: 0.35, scaleY: 1.2 }
                        : {
                            opacity: [0, 0.75, 0],
                            y: [-6, -58],
                            x: [0, i % 2 === 0 ? 10 : -10, 0],
                            scaleY: [1, 1.8, 1.4],
                            scaleX: [1, 0.6, 0.4],
                          }
                    }
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: p.duration,
                            delay: p.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                    }
                  />
                ))}
              </div>

              <motion.div
                style={{ y: heroImageY }}
                className="relative w-full max-w-sm aspect-square bg-surface border border-border-custom rounded-2xl p-4 shadow-lg overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent z-10" />
                <img
                  src={heroImage}
                  onError={() => {
                    if (heroImage !== "https://ixuicwskzakgelmhcfsh.supabase.co/storage/v1/object/public/product-images/hero/hero_main.jpg") {
                      setHeroImage("https://ixuicwskzakgelmhcfsh.supabase.co/storage/v1/object/public/product-images/hero/hero_main.jpg");
                    }
                  }}
                  alt="Klakat Kukusan Stainless BalenpopStore"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/40 shadow-md">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">Produk Terlaris</span>
                  <h3 className="font-sans text-sm font-extrabold text-primary mt-1">Klakat Kukusan Premium Ukuran 100X50</h3>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary/5">
                    <span className="font-mono text-xs font-black text-primary font-tabular">Rp 2.000.000</span>
                    <span className="text-[10px] text-accent font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> SUS 304 Food Grade
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Brand Highlights (Why Choose Us) */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-soft pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-text-secondary uppercase">
              KUALITAS BAHAN & DESAIN UNGGUL
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary">
              Mengapa Pengusaha Kuliner Memilih BalenpopStore?
            </h2>
            <div className="h-1.5 w-16 bg-accent mx-auto rounded-full mt-4" />
          </div>

          <motion.div
            variants={highlightsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-6"
          >
            {/* Headline feature: Pyramid Lid — the product's actual unique
                differentiator, elevated with its own full-width treatment
                and an illustrative diagram instead of sharing equal weight
                with the two supporting facts below. */}
            <motion.div
              variants={highlightsItemVariants}
              className="grid grid-cols-1 md:grid-cols-5 items-center gap-8 p-8 md:p-10 border border-border-custom rounded-2xl bg-gradient-to-br from-surface/60 to-white hover:border-border-strong hover:shadow-md transition-all"
            >
              <div className="md:col-span-3 space-y-4">
                <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-extrabold text-primary">Tutup Kerucut Piramida Presisi</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-md">
                  Keunggulan utama produk kami adalah tutup piramida lancip. Uap air langsung mengalir meluncur ke sisi dinding panci, sehingga kue Anda matang mengembang sempurna tanpa basah terciprat air.
                </p>
              </div>
              <div className="md:col-span-2 flex justify-center">
                <PyramidLidDiagram />
              </div>
            </motion.div>

            {/* Supporting facts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                variants={highlightsItemVariants}
                className="p-8 border border-border-custom rounded-2xl hover:border-border-strong hover:shadow-md transition-all space-y-4 bg-surface/30"
              >
                <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-extrabold text-primary">Stainless Steel SUS 304 Tebal</h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Kami menggunakan material baja stainless premium anti karat dengan ketebalan tebal. Aman untuk makanan (food grade), tahan korosi uap, dan sangat mudah dibersihkan.
                </p>
              </motion.div>

              <motion.div
                variants={highlightsItemVariants}
                className="p-8 border border-border-custom rounded-2xl hover:border-border-strong hover:shadow-md transition-all space-y-4 bg-surface/30"
              >
                <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-extrabold text-primary">Kustomisasi Ukuran Spesifik</h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Butuh klakat dengan ukuran khusus untuk oven raksasa, kompor industri, atau restoran katering? Kami memproduksi pesanan custom dengan hitungan ukuran yang presisi dan harga bersaing.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-surface/30 border-t border-b border-border-custom">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-text-secondary uppercase">
                PRODUK ANDALAN TERBAIK
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary">
                Koleksi Pilihan BalenpopStore
              </h2>
            </div>
            <Link
              href="/catalog"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              Lihat Semua Katalog
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-border-custom rounded-xl p-4 space-y-4 h-80">
                  <div className="aspect-square bg-neutral-200 rounded-lg w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-border-custom rounded-2xl p-8">
              <UtensilsCrossed className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Belum ada produk aktif yang ditampilkan.</p>
              <Link href="/admin/login" className="text-xs font-bold text-primary underline mt-2 block">
                Log in admin untuk input produk awal
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-border-custom hover:border-border-strong rounded-xl p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <Link href={`/catalog/${product.id}`} className="space-y-3 block flex-1">
                    {/* Image Aspect ratio 1:1 with gray placeholder */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 border border-border-custom flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-200 flex items-center justify-center text-text-muted text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-sans text-xs sm:text-sm font-bold text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="font-mono text-sm font-extrabold text-primary font-tabular">
                        {formatIDR(product.price)}
                      </p>
                    </div>
                  </Link>

                  <div className="mt-4 pt-3 border-t border-border-custom">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAdd(product)}
                      disabled={successProductId === product.id}
                      className={`w-full py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        successProductId === product.id
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-surface text-text-primary border border-border-strong hover:bg-primary hover:text-white hover:border-primary"
                      }`}
                    >
                      {successProductId === product.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Masuk Keranjang!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Beli Cepat
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Category Selection Grid */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-soft pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-text-secondary uppercase">
              PENGELOMPOKAN PRODUK
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary">
              Kategori Alat Dapur & Kukusan
            </h2>
          </div>

          <motion.div
            variants={categoryContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {categories.map((cat, idx) => (
              <motion.div key={cat.id || idx} variants={categoryItemVariants}>
                <Link
                  href={`/catalog?category=${cat.id}`}
                  className="group relative p-8 border border-border-custom rounded-2xl overflow-hidden hover:border-border-strong hover:shadow-md transition-all flex flex-col justify-between h-48 bg-surface/20"
                >
                  <motion.div
                    className="absolute top-0 right-0 p-8 text-neutral-300 origin-top-right"
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { scale: 1.12, x: -4, y: 4, color: "var(--color-accent)" }
                    }
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <span className="font-mono text-5xl font-black group-hover:text-accent transition-colors">0{idx + 1}</span>
                  </motion.div>
                  <div className="relative z-10 space-y-2 max-w-[200px]">
                    <h3 className="font-display text-lg font-extrabold text-primary group-hover:text-accent transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-text-secondary text-xs line-clamp-2">
                      Jelajahi produk stainless berkualitas tinggi dalam kategori {cat.name.toLowerCase()}.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1.5 mt-4 relative z-10">
                    Lihat Selengkapnya
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Conversion Banner WhatsApp (WhatsApp Green CTA is strict rule!) */}
      <section className="pb-24 pt-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-neutral-800 text-white rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Background Accent Gradient Overlay */}
            <div className="absolute -bottom-[30%] -left-[10%] w-[40%] h-[80%] rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            
            <div className="space-y-4 max-w-xl text-center md:text-left relative z-10">
              <span className="bg-accent text-primary text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Kustomisasi Ukuran & Katering
              </span>
              <h2 className="font-display text-2xl md:text-3.5xl font-extrabold leading-tight tracking-tight text-white">
                Ingin Pesan Ukuran Custom Sesuai Kebutuhan Dapur Anda?
              </h2>
              <p className="text-neutral-300 text-xs md:text-sm leading-relaxed">
                Konsultasikan langsung ukuran klakat impian Anda dengan pengrajin kami melalui WhatsApp. Kami siap memberikan penawaran harga terbaik dan rancangan presisi.
              </p>
            </div>

            <div className="flex-shrink-0 relative z-10 w-full md:w-auto">
              <motion.a
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/62895365517451?text=Halo%20Admin%20BalenpopStore%2C%20saya%20tertarik%20tanya%20mengenai%20produk%20klakat%20stainless%20custom%20dan%20alat%20dapur."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 focus:ring-4 focus:ring-accent/30 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
                Chat Spesifikasi Custom via WhatsApp
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}
