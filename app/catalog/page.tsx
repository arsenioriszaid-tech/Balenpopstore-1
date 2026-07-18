"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { 
  Search, 
  ShoppingBag, 
  Check, 
  UtensilsCrossed, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import Link from "next/link";

// Shimmer sweep block used to build skeleton placeholders
function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Skeleton that mirrors the real product card's shape (image, title lines, price, button)
function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-border-custom rounded-xl p-3 sm:p-4 flex flex-col justify-between">
      <div className="space-y-2.5 sm:space-y-3 flex-1">
        <ShimmerBlock className="aspect-square w-full rounded-lg" />
        <div className="space-y-1.5">
          <ShimmerBlock className="h-3.5 rounded w-4/5" />
          <ShimmerBlock className="h-3.5 rounded w-1/2" />
          <ShimmerBlock className="h-4 rounded w-2/5 mt-1" />
        </div>
      </div>
      <div className="mt-3 sm:mt-4 pt-3 border-t border-border-custom">
        <ShimmerBlock className="h-8 rounded-md w-full" />
      </div>
    </div>
  );
}

// Product card with a subtle 3D tilt-on-hover effect, plus layoutId for smooth
// re-ordering when the category/search filter changes.
//
// Touch devices never fire onMouseMove, so the tilt naturally stays inert there —
// that's fine, but it means touch users need their own tactile response instead of
// silence: onTapStart/onTap/onTapCancel drive the same `tiltScale` spring used by the
// desktop hover effect for a quick press-in/press-out "squish", and `whileHover` adds
// an animated shadow lift for any pointer that actually supports hovering.
function ProductCard({
  product,
  formatIDR,
  handleQuickAdd,
  successProductId,
  index,
}: {
  product: any;
  formatIDR: (price: number) => string;
  handleQuickAdd: (product: any) => void;
  successProductId: string | null;
  index: number;
}) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [9, -9]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-9, 9]), {
    stiffness: 300,
    damping: 25,
  });
  const tiltScale = useSpring(1, { stiffness: 300, damping: 25 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseEnter() {
    tiltScale.set(1.03);
  }
  function handleMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
    tiltScale.set(1);
  }

  // Press feedback (works for both touch taps and mouse clicks) — reuses the same
  // tiltScale spring that already drives the desktop hover "lift", so there's a single
  // source of truth for the card's scale instead of two competing animation systems.
  function handleTapStart() {
    tiltScale.set(0.97);
  }
  function handleTapEnd() {
    tiltScale.set(1);
  }

  return (
    <motion.div
      layout
      layoutId={product.id}
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.035, 0.28) },
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeOut" } }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTapStart={handleTapStart}
      onTap={handleTapEnd}
      onTapCancel={handleTapEnd}
      whileHover={{
        boxShadow: "0 20px 45px -14px rgba(15, 23, 42, 0.28)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      style={{
        rotateX,
        rotateY,
        scale: tiltScale,
        transformPerspective: 700,
      }}
      className="bg-white border border-border-custom hover:border-border-strong rounded-xl p-3 sm:p-4 transition-colors flex flex-col justify-between group will-change-transform"
    >
      <Link href={`/catalog/${product.id}`} className="space-y-2.5 sm:space-y-3 block flex-1">
        {/* Image ratio 1:1 or 4:3 with gray placeholder before loading */}
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

        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="font-sans text-xs sm:text-sm font-bold text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="font-mono text-sm font-extrabold text-primary font-tabular">
            {formatIDR(product.price)}
          </p>
        </div>
      </Link>

      <div className="mt-3 sm:mt-4 pt-3 border-t border-border-custom">
        <button
          onClick={() => handleQuickAdd(product)}
          disabled={successProductId === product.id}
          className={`w-full py-1.5 sm:py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            successProductId === product.id
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-surface text-text-primary border border-border-strong hover:bg-primary hover:text-white hover:border-primary"
          }`}
        >
          {successProductId === product.id ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Masuk!
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              Beli Cepat
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = searchParams.get("category") || "all";
  const [successProductId, setSuccessProductId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Refs to each mobile category pill button, keyed by category id ("all" included),
  // so the active pill can be scrolled into view after selection.
  const mobilePillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true);
        // Load categories
        const { data: catData } = await supabase.from("categories").select("*");
        setCategories(catData || []);

        // Load active products
        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true);
        setProducts(prodData || []);
      } catch (e) {
        console.error("Failed to load catalog data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter products based on query and selected category
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset page on filter change
  }, [products, selectedCategory, searchQuery]);

  // Keep the active mobile category pill visible: whenever the selected category
  // changes (or categories finish loading, covering direct-link edge cases), scroll
  // its pill button into view within the horizontally-scrolling row.
  useEffect(() => {
    const activePill = mobilePillRefs.current[selectedCategory];
    activePill?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedCategory, categories]);

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (product: any) => {
    addToCart(product, null, 1);
    setSuccessProductId(product.id);
    setTimeout(() => setSuccessProductId(null), 2000);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <Header />

      {/* Main Catalog Section */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Title and Header */}
        <div className="border-b border-border-custom pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold tracking-widest text-text-secondary uppercase">
              BELANJA ALAT DAPUR
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-primary">
              Katalog Produk BalenpopStore
            </h1>
          </div>
          <div className="text-xs text-text-secondary font-mono">
            Menampilkan <span className="font-bold text-primary">{filteredProducts.length}</span> produk aktif
          </div>
        </div>

        {/* Filter bar and Search bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Category Filters (Desktop only, responsive box) */}
          <aside className="lg:col-span-3 space-y-6 hidden lg:block border border-border-custom bg-surface/10 rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 border-b border-border-custom pb-3 mb-2">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary">Kategori Produk</h3>
            </div>
            
            <div className="flex flex-col gap-1.5 text-sm">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`text-left px-3 py-2 rounded-md font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-surface hover:text-primary"
                }`}
              >
                Semua Produk
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`text-left px-3 py-2 rounded-md font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-surface hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT: Main grid with Search, Pills, Grid & Pagination */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search Input Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-secondary">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari klakat kotak, bulat, atau produk dapur lainnya..."
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-border-strong rounded-xl text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            {/* Mobile Category Pill Slider */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
              <button
                ref={(el) => {
                  mobilePillRefs.current["all"] = el;
                }}
                onClick={() => handleCategoryChange("all")}
                className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedCategory === "all"
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-border-strong text-text-secondary hover:bg-surface"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  ref={(el) => {
                    mobilePillRefs.current[cat.id] = el;
                  }}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-border-strong text-text-secondary hover:bg-surface"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Responsive Grid (2-columns strictly on mobile, up to 4 on desktop!) */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-24 bg-white border border-border-custom rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
                <div className="h-14 w-14 bg-surface rounded-full flex items-center justify-center text-text-muted">
                  <UtensilsCrossed className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-primary">Produk Tidak Ditemukan</h3>
                  <p className="text-text-secondary text-xs mt-1 max-w-sm mx-auto">
                    Maaf, tidak ada produk aktif yang cocok dengan pencarian & kategori yang Anda pilih saat ini.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    handleCategoryChange("all");
                  }}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  <AnimatePresence mode="popLayout">
                    {currentItems.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        formatIDR={formatIDR}
                        handleQuickAdd={handleQuickAdd}
                        successProductId={successProductId}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8 border-t border-border-custom">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-border-strong rounded-lg disabled:opacity-45 hover:bg-surface text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-text-secondary">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-border-strong rounded-lg disabled:opacity-45 hover:bg-surface text-primary"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-bg-canvas justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
