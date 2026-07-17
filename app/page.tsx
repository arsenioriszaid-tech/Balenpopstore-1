"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { motion } from "motion/react";
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

export default function HomePage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successProductId, setSuccessProductId] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState("/uploads/hero_main.jpg");

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
      <section className="relative bg-gradient-to-b from-surface/50 to-white pt-12 pb-20 md:py-28 overflow-hidden border-b border-border-custom">
        {/* Subtle Decorative Background Blob */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accent/5 blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text Info */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-mono font-bold rounded-full uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                Handcrafted Premium Stainless Steel
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight">
                Klakat Kukusan Stainless <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Kualitas Juara</span> Untuk UMKM Kuliner
              </h1>
              <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Tebal, awet, dan anti karat. Didesain khusus dengan tutup piramida presisi sehingga uap air kondensasi tidak menetes merusak cita rasa kue, dimsum, atau bakpao Anda.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
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
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-square bg-surface border border-border-custom rounded-2xl p-4 shadow-lg overflow-hidden group">
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
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Brand Highlights (Why Choose Us) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-text-secondary uppercase">
              KUALITAS BAHAN & DESAIN UNGGUL
            </span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-primary">
              Mengapa Pengusaha Kuliner Memilih BalenpopStore?
            </h2>
            <div className="h-1.5 w-16 bg-accent mx-auto rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Highlight 1 */}
            <div className="p-8 border border-border-custom rounded-2xl hover:border-border-strong hover:shadow-md transition-all space-y-4 bg-surface/30">
              <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-extrabold text-primary">Stainless Steel SUS 304 Tebal</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Kami menggunakan material baja stainless premium anti karat dengan ketebalan tebal. Aman untuk makanan (food grade), tahan korosi uap, dan sangat mudah dibersihkan.
              </p>
            </div>

            {/* Highlight 2 */}
            <div className="p-8 border border-border-custom rounded-2xl hover:border-border-strong hover:shadow-md transition-all space-y-4 bg-surface/30">
              <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-extrabold text-primary">Tutup Kerucut Piramida Presisi</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Keunggulan utama produk kami adalah tutup piramida lancip. Uap air langsung mengalir meluncur ke sisi dinding panci, sehingga kue Anda matang mengembang sempurna tanpa basah terciprat air.
              </p>
            </div>

            {/* Highlight 3 */}
            <div className="p-8 border border-border-custom rounded-2xl hover:border-border-strong hover:shadow-md transition-all space-y-4 bg-surface/30">
              <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-extrabold text-primary">Kustomisasi Ukuran Spesifik</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Butuh klakat dengan ukuran khusus untuk oven raksasa, kompor industri, atau restoran katering? Kami memproduksi pesanan custom dengan hitungan ukuran yang presisi dan harga bersaing.
              </p>
            </div>
          </div>
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
              <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-primary">
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
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-text-secondary uppercase">
              PENGELOMPOKAN PRODUK
            </span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-primary">
              Kategori Alat Dapur & Kukusan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                href={`/catalog?category=${cat.id}`}
                className="group relative p-8 border border-border-custom rounded-2xl overflow-hidden hover:border-border-strong hover:shadow-md transition-all flex flex-col justify-between h-48 bg-surface/20"
              >
                <div className="absolute top-0 right-0 p-8 text-neutral-300 group-hover:text-accent transition-colors">
                  <span className="font-mono text-5xl font-black">0{idx + 1}</span>
                </div>
                <div className="relative z-10 space-y-2 max-w-[200px]">
                  <h3 className="font-sans text-lg font-extrabold text-primary group-hover:text-accent transition-colors">
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
            ))}
          </div>
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
              <h2 className="font-sans text-2xl md:text-3.5xl font-extrabold leading-tight tracking-tight text-white">
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
