"use client";

import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Info,
  Calendar,
  Tag,
  X,
  ZoomIn
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);
  const { addToCart } = useCart();
  const shouldReduceMotion = useReducedMotion();

  const [product, setProduct] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [extraImages, setExtraImages] = useState<any[]>([]);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  // Image zoom-on-hover state (desktop)
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const imageWrapRef = useRef<HTMLDivElement>(null);

  // Fullscreen lightbox state (mobile-friendly image inspection)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement>(null);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  useEffect(() => {
    async function loadProductDetails() {
      try {
        setIsLoading(true);

        // Fetch product
        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("is_active", true);

        if (!prodData || prodData.length === 0) {
          setProduct(null);
          setIsLoading(false);
          return;
        }

        const currentProd = prodData[0];
        setProduct(currentProd);
        setSelectedImage(currentProd.image_url || "");

        // Fetch category
        if (currentProd.category_id) {
          const { data: catData } = await supabase
            .from("categories")
            .select("*")
            .eq("id", currentProd.category_id);
          if (catData && catData.length > 0) {
            setCategory(catData[0]);
          }
        }

        // Fetch variants
        const { data: varData } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", id)
          .eq("is_active", true);
        
        const sortedVars = varData || [];
        setVariants(sortedVars);
        
        // Auto-select first variant if exists
        if (sortedVars.length > 0) {
          setSelectedVariant(sortedVars[0]);
        }

        // Fetch extra images
        const { data: imgData } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", id);
        
        setExtraImages(imgData || []);

      } catch (e) {
        console.error("Failed to load product details:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductDetails();
  }, [id]);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Live computed price
  const displayedPrice = selectedVariant?.price_override !== null && selectedVariant?.price_override !== undefined
    ? Number(selectedVariant.price_override)
    : Number(product?.price || 0);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleDirectWhatsApp = () => {
    if (!product) return;
    // Build quick direct WA link
    const variantText = selectedVariant ? ` (Varian: ${selectedVariant.size_label})` : "";
    const totalAmount = displayedPrice * quantity;
    
    let message = `*TANYA PRODUK - BALENPOPSTORE*\n`;
    message += `----------------------------------------\n`;
    message += `Saya tertarik membeli produk ini:\n`;
    message += `*Nama:* ${product.name}${variantText}\n`;
    message += `*Jumlah:* ${quantity} pcs\n`;
    message += `*Harga Satuan:* ${formatIDR(displayedPrice)}\n`;
    message += `*Total Estimasi:* ${formatIDR(totalAmount)}\n`;
    message += `----------------------------------------\n`;
    message += `Mohon info kesediaan stok dan ongkir ke alamat saya ya Admin. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/62895365517451?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  // All image gallery options (Main image + Extra images).
  // Computed before the early returns (guarded against a null product) so it can be
  // reused both by the JSX gallery and by the lightbox keyboard navigation effect below.
  const allImages = product
    ? [product.image_url, ...extraImages.map((img) => img.image_url)].filter(Boolean)
    : [];

  // Keyboard support for the fullscreen lightbox: Escape closes it, Left/Right arrows
  // step through allImages using the existing selectedImage state.
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }
      if (allImages.length < 2) return;
      const currentIndex = allImages.indexOf(selectedImage);
      if (currentIndex === -1) return;
      if (e.key === "ArrowRight") {
        setSelectedImage(allImages[(currentIndex + 1) % allImages.length]);
      } else if (e.key === "ArrowLeft") {
        setSelectedImage(allImages[(currentIndex - 1 + allImages.length) % allImages.length]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, allImages, selectedImage]);

  // Focus the close button whenever the lightbox opens, for basic focus management.
  useEffect(() => {
    if (!isLightboxOpen) return;
    const focusTimeout = window.setTimeout(() => {
      lightboxCloseButtonRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(focusTimeout);
  }, [isLightboxOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-canvas justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-canvas justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Info className="h-12 w-12 text-text-muted" />
          <h2 className="font-sans text-lg font-bold text-primary">Produk Tidak Ditemukan</h2>
          <p className="text-text-secondary text-xs max-w-xs">
            Maaf, produk yang Anda cari tidak tersedia atau telah dinonaktifkan oleh administrator.
          </p>
          <Link href="/catalog" className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-md">
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentImageNumber = allImages.indexOf(selectedImage) + 1;

  // Entrance animation untuk CTA WhatsApp: satu kali "glow" saat tombol pertama kali
  // masuk viewport (bukan loop ambient tanpa henti). Dinonaktifkan bila reduced motion aktif.
  const waEntranceVariants = {
    hidden: { boxShadow: "0 0 0px 0px rgba(217,119,87,0)" },
    visible: shouldReduceMotion
      ? { boxShadow: "0 0 0px 0px rgba(217,119,87,0)" }
      : {
          boxShadow: [
            "0 0 0px 0px rgba(217,119,87,0)",
            "0 0 22px 6px rgba(217,119,87,0.45)",
            "0 0 0px 0px rgba(217,119,87,0)",
          ],
          transition: { duration: 1.4, ease: "easeInOut" as const },
        },
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog Produk
        </Link>

        {/* Detail Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Multi-image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Showcase Image Area */}
            <div
              ref={imageWrapRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleImageMouseMove}
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-border-custom shadow-xs cursor-zoom-in"
            >
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
                className={`h-full w-full object-cover transition-transform duration-200 ease-out ${
                  isZooming ? "scale-[2.2]" : "scale-100"
                }`}
              />

              {/* Explicit zoom affordance — always available, most useful on touch devices
                  where the hover-driven zoom above never triggers. */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                aria-label="Perbesar Gambar Produk"
                className="absolute bottom-3 right-3 flex items-center justify-center h-9 w-9 rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:opacity-80 sm:hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <ZoomIn className="h-4.5 w-4.5" />
              </button>
            </div>
            
            {/* Clickable Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-16 w-16 overflow-hidden rounded-lg border flex-shrink-0 transition-all ${
                      selectedImage === img
                        ? "border-primary ring-2 ring-primary/20 scale-95"
                        : "border-border-custom hover:border-border-strong"
                    }`}
                  >
                    <img src={img} alt="Detail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Content & Configurations */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              {/* Category tag */}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border-custom rounded-full text-[11px] font-semibold text-text-secondary">
                  <Tag className="h-3 w-3" />
                  {category.name}
                </span>
              )}
              <h1 className="font-sans text-2xl sm:text-3.5xl font-extrabold tracking-tight text-primary leading-tight">
                {product.name}
              </h1>
              
              {/* Computed Price - tabular nums */}
              <div className="pt-2 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayedPrice}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block font-mono text-xl sm:text-2xl font-black text-primary font-tabular"
                  >
                    {formatIDR(displayedPrice)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* VARIAN SIZE (Capsule Badges Selection per Design System Spec) */}
            {variants.length > 0 && (
              <div className="space-y-3.5 border-t border-b border-border-custom py-5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary">
                    Pilih Varian Ukuran:
                  </label>
                  {selectedVariant && (
                    <span className="text-xs text-text-muted font-mono font-medium">
                      Stok: <span className="font-bold text-primary">{selectedVariant.stock} pcs</span>
                    </span>
                  )}
                </div>
                {/* Capsule Badges Radio Group */}
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isOutOfStock = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-white shadow-sm scale-102"
                            : isOutOfStock
                            ? "border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50"
                            : "bg-white border-border-strong text-text-secondary hover:bg-surface hover:text-primary"
                        }`}
                      >
                        {v.size_label}
                        {v.price_override !== null && v.price_override !== undefined && (
                          <span className="ml-1.5 text-[10px] font-mono opacity-80">
                            (+{formatIDR(Number(v.price_override) - Number(product.price))})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Jumlah Beli:</span>
              <div className="flex items-center border border-border-strong rounded-lg bg-surface shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  className="px-3.5 py-2 text-text-secondary hover:text-primary transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-5 text-sm font-mono font-bold text-primary">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2 text-text-secondary hover:text-primary transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Purchase Action Buttons — WhatsApp diperlakukan sebagai aksi utama
                (sesuai model bisnis pesanan manual via WA), Keranjang sebagai aksi sekunder. */}
            <div className="flex flex-col gap-3 pt-4">
              {/* PRIMARY: Instant Checkout WA button (WA green is strictly protected!) */}
              <motion.button
                onClick={handleDirectWhatsApp}
                variants={waEntranceVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.6 }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                className="group relative w-full overflow-hidden py-4 sm:py-4.5 bg-accent hover:bg-accent-hover text-white text-base font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors focus:ring-4 focus:ring-accent/30 cursor-pointer"
              >
                {!shouldReduceMotion && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-[130%] transition-transform duration-700 ease-out group-hover:translate-x-[330%]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5" />
                  Pesan Instan via WhatsApp
                </span>
              </motion.button>

              {/* SECONDARY: Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border ${
                  isAdded
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-white border-border-custom hover:bg-surface hover:border-border-strong text-text-secondary"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    Berhasil Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Tambahkan ke Keranjang
                  </>
                )}
              </button>
            </div>

            {/* Material & Construction Assurance lists */}
            <div className="border-t border-border-custom pt-6 space-y-4 text-xs text-text-secondary leading-relaxed">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                <p>
                  <strong className="text-primary font-bold">100% Stainless Steel SUS 304:</strong> Material bersertifikat food-grade, sangat aman kontak panas makanan, anti karat selamanya.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                <p>
                  <strong className="text-primary font-bold">Tutup Piramida Pelindung Kondensasi:</strong> Air menguap miring ke dinding, menghindarkan tetesan merusak adonan basah maupun kue kukus.
                </p>
              </div>
            </div>

            {/* Detailed Description Panel - minimum 14px font-size rule! */}
            <div className="space-y-3.5 border-t border-border-custom pt-6">
              <h3 className="font-sans text-sm font-extrabold text-primary uppercase tracking-wider">Deskripsi & Spesifikasi Produk</h3>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line text-[14px]">
                {product.description || "Belum ada keterangan deskripsi lengkap untuk produk ini."}
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Fullscreen Lightbox — tap-to-open image inspection, primarily for touch devices
          where the hover-driven zoom above has no equivalent. Reuses selectedImage/allImages. */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col"
          >
            {/* Top bar: image counter + close button */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0"
            >
              {allImages.length > 1 ? (
                <span className="text-white/70 text-xs font-mono">
                  {currentImageNumber} / {allImages.length}
                </span>
              ) : (
                <span />
              )}
              <button
                ref={lightboxCloseButtonRef}
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Tutup Tampilan Gambar"
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Large image */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 flex items-center justify-center px-4 pb-4"
            >
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Swipeable / tappable thumbnails, reusing the same selectedImage state */}
            {allImages.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="px-4 sm:px-6 pb-6 pt-2 flex-shrink-0"
              >
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      aria-label={`Lihat gambar produk ${index + 1} dari ${allImages.length}`}
                      className={`relative h-16 w-16 flex-shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === img
                          ? "border-white"
                          : "border-white/20 hover:border-white/50"
                      }`}
                    >
                      <img src={img} alt="Detail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
