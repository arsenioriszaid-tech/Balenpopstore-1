"use client";

import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Info,
  Calendar,
  Tag
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

  const [product, setProduct] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [extraImages, setExtraImages] = useState<any[]>([]);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  // Image zoom-on-hover state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const imageWrapRef = useRef<HTMLDivElement>(null);

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

  // All image gallery options (Main image + Extra images)
  const allImages = [product.image_url, ...extraImages.map((img) => img.image_url)].filter(Boolean);

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

            {/* Purchase Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all border ${
                  isAdded
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-white border-border-strong hover:bg-surface text-primary"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    Berhasil Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4.5 w-4.5" />
                    Tambahkan ke Keranjang
                  </>
                )}
              </button>

              {/* Instant Checkout WA button (WA green is strictly protected!) */}
              <motion.button
                onClick={handleDirectWhatsApp}
                animate={{
                  boxShadow: [
                    "0 0 0px 0px rgba(217,119,87,0.0)",
                    "0 0 18px 4px rgba(217,119,87,0.45)",
                    "0 0 0px 0px rgba(217,119,87,0.0)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-full py-4 bg-accent hover:bg-accent-hover text-white text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors focus:ring-4 focus:ring-accent/30 cursor-pointer"
              >
                Pesan Instan via WhatsApp
              </motion.button>
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

      <Footer />
    </div>
  );
}
