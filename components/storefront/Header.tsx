"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Phone, 
  MapPin, 
  User, 
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { toast } from "sonner";

// Varian animasi stagger untuk daftar menu navigasi mobile
const mobileNavContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const mobileNavItemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
  },
};

// Easing "organic" bersama — konsisten dengan token --ease-organic yang dipakai
// di seluruh sistem desain, untuk transisi panel & polish tombol CTA.
const organicEase = [0.4, 0, 0.2, 1] as const;

// Varian cross-fade/slide untuk swap konten di dalam panel drawer yang sama
// (cart view <-> checkout view), menggantikan modal terpisah.
const panelViewVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: organicEase } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2, ease: organicEase } },
};

/**
 * Icon ShoppingBag dengan efek "magnetic": saat kursor mendekat ke tombol,
 * icon sedikit tertarik mengikuti arah kursor, lalu kembali ke posisi semula
 * dengan pegas (spring) yang lembut saat kursor menjauh.
 */
function MagneticShoppingBagIcon({ className }: { className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 12, mass: 0.15 });
  const springY = useSpring(y, { stiffness: 150, damping: 12, mass: 0.15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    // Kekuatan tarikan magnetic dibatasi agar tetap terasa "sedikit", bukan berlebihan
    x.set(relX * 0.35);
    y.set(relY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <span
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-flex"
    >
      <motion.span style={{ x: springX, y: springY }} className="inline-flex">
        <ShoppingBag className={className} />
      </motion.span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { items, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const shouldReduceMotion = useReducedMotion();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Melacak penambahan item baru ke keranjang untuk memicu animasi pulse pada badge
  const previousCartCountRef = useRef(cartCount);
  const [badgeBumpKey, setBadgeBumpKey] = useState(0);

  // Refs untuk manajemen fokus sederhana pada panel drawer (cart & checkout)
  const cartCloseButtonRef = useRef<HTMLButtonElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cartCount > previousCartCountRef.current) {
      setBadgeBumpKey((prev) => prev + 1);
    }
    previousCartCountRef.current = cartCount;
  }, [cartCount]);

  // Pindahkan fokus ke elemen yang relevan setiap kali tampilan panel berganti,
  // agar pengguna keyboard/screen reader tetap terorientasi tanpa dependency baru.
  useEffect(() => {
    if (!isCartOpen) return;
    const focusTimeout = window.setTimeout(() => {
      if (isCheckoutOpen) {
        customerNameInputRef.current?.focus();
      } else {
        cartCloseButtonRef.current?.focus();
      }
    }, 50);
    return () => window.clearTimeout(focusTimeout);
  }, [isCartOpen, isCheckoutOpen]);

  // Tutup drawer/menu aktif dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isCartOpen) {
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
      } else if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, isMobileMenuOpen]);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Katalog", href: "/catalog" },
    { name: "Tentang Kami", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Hubungi Kami", href: "/contact" },
  ];

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      toast.error("Harap lengkapi semua formulir!", {
        description: "Nama, No. WhatsApp, dan Alamat wajib diisi sebelum melanjutkan.",
      });
      return;
    }

    setIsSubmitting(true);

    // Format WA message
    let message = `*PESANAN BARU - BALENPOPSTORE*\n`;
    message += `----------------------------------------\n`;
    message += `*Nama Pembeli:* ${customerName}\n`;
    message += `*No. WhatsApp:* ${customerPhone}\n`;
    message += `*Alamat Kirim:* ${customerAddress}\n\n`;
    message += `*Rincian Produk:*\n`;

    items.forEach((item, index) => {
      const price = item.variant?.price_override !== null && item.variant?.price_override !== undefined
        ? Number(item.variant.price_override)
        : Number(item.product.price);
      
      const variantText = item.variant ? ` (${item.variant.size_label})` : "";
      message += `${index + 1}. ${item.product.name}${variantText}\n`;
      message += `   Qty: ${item.quantity} x ${formatIDR(price)} = ${formatIDR(price * item.quantity)}\n`;
    });

    message += `----------------------------------------\n`;
    message += `*TOTAL PEMBAYARAN:* ${formatIDR(cartTotal)}\n`;
    message += `----------------------------------------\n`;
    message += `Mohon segera dikonfirmasi ya Admin BalenpopStore. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "62895365517451"; // Owner WhatsApp per PRD spec
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Simulate sending transaction recording request to mock/live API
    // Let's call /api/sales route in the background to log the sale!
    fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerPhone,
        customerAddress,
        totalAmount: cartTotal,
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id || null,
          quantity: item.quantity,
          priceAtSale: item.variant?.price_override !== null && item.variant?.price_override !== undefined
            ? Number(item.variant.price_override)
            : Number(item.product.price),
        })),
      }),
    })
      .then(() => {
        // Clear cart and redirect
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setIsSubmitting(false);
        toast.success("Pesanan berhasil dibuat!", {
          description: "Kamu akan diarahkan ke WhatsApp Admin untuk konfirmasi lebih lanjut.",
        });
        window.open(waUrl, "_blank");
      })
      .catch((err) => {
        console.error("Failed to log sale:", err);
        // Fallback to direct redirect anyway so transaction is never blocked
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setIsSubmitting(false);
        toast.success("Pesanan diteruskan ke WhatsApp Admin", {
          description: "Pencatatan otomatis sempat gagal, tapi pesananmu tetap terkirim.",
        });
        window.open(waUrl, "_blank");
      });
  };

  const closeCartEntirely = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  };

  // Variants tombol CTA WhatsApp: scale + shadow lift halus saat hover/tap,
  // dinonaktifkan otomatis kalau pengguna memilih "reduced motion".
  const ctaButtonVariants = {
    rest: { scale: 1, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)" },
    hover: shouldReduceMotion
      ? { scale: 1, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)" }
      : {
          scale: 1.015,
          boxShadow: "0 14px 28px -10px rgba(15, 23, 42, 0.35)",
          transition: { duration: 0.35, ease: organicEase },
        },
  };

  // Sapuan "shine" tipis yang lewat di atas tombol saat hover — murni polish visual,
  // one-shot per hover (bukan loop ambient), jadi tidak butuh gate reduced-motion tambahan
  // selain menonaktifkannya total saat reduced motion aktif.
  const ctaShineVariants = {
    rest: { x: "-120%" },
    hover: shouldReduceMotion
      ? { x: "-120%" }
      : { x: "120%", transition: { duration: 0.65, ease: organicEase } },
  };

  return (
    <>
      {/* Sticky Header Container */}
      <header className="sticky top-0 z-40 w-full border-b border-border-custom bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="bg-primary text-white p-2 rounded-md font-mono font-bold tracking-wider text-sm transition-transform group-hover:scale-105 shadow-sm">
              BP
            </span>
            <div className="flex flex-col">
              <span className="font-sans text-lg font-bold tracking-tight text-primary leading-none">
                Balenpop<span className="text-accent">Store</span>
              </span>
              <span className="font-mono text-[9px] text-text-secondary uppercase tracking-widest mt-0.5">
                Kitchenware
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary font-semibold border-b-2 border-primary pb-1 pt-1.5" : "text-text-secondary pb-1"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-text-secondary hover:text-primary hover:bg-surface rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label="Keranjang Belanja"
            >
              <MagneticShoppingBagIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <motion.span
                  key={badgeBumpKey}
                  initial={{ scale: 1.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-mono font-bold text-white shadow-sm ring-2 ring-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Admin Dashboard Entry Link (subtle outline badge) */}
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold border border-border-strong text-text-secondary rounded-full hover:bg-surface hover:text-primary transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Dashboard Admin
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-primary hover:bg-surface rounded-full transition-colors md:hidden focus:outline-none"
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (AnimatePresence) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-35 w-full max-w-xs bg-white p-6 shadow-xl md:hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-border-custom">
                  <span className="font-sans text-lg font-bold">Menu Navigasi</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-surface">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <motion.div
                  variants={mobileNavContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-5 mt-8"
                >
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div key={link.href} variants={mobileNavItemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "text-base font-semibold py-1 transition-colors block",
                            isActive ? "text-primary border-l-4 border-primary pl-3" : "text-text-secondary pl-4"
                          )}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Bottom Admin & Contact links inside Mobile Drawer */}
              <div className="border-t border-border-custom pt-6 flex flex-col gap-4">
                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-border-strong rounded-md text-sm font-medium hover:bg-surface text-text-primary"
                >
                  Masuk Dashboard Admin
                </Link>
                <div className="text-center text-xs text-text-muted">
                  BalenpopStore © 2026. All Rights Reserved.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/*
        Panel Cart & Checkout (Disatukan)
        ---------------------------------
        Satu drawer yang sama menampilkan dua "tampilan": daftar keranjang
        (cart view) dan formulir data pengiriman (checkout view). Peralihan
        antar tampilan dilakukan lewat AnimatePresence mode="wait" di dalam
        panel yang tetap sama, bukan modal terpisah di atasnya. `isCartOpen`
        mengontrol buka/tutup panel; `isCheckoutOpen` mengontrol tampilan mana
        yang aktif di dalamnya.
      */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={closeCartEntirely}
              className="fixed inset-0 z-50 bg-black/55"
            />
            
            {/* Panel (Sliding Drawer) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
            >
              <AnimatePresence mode="wait" initial={false}>
                {!isCheckoutOpen ? (
                  /* ============ CART VIEW ============ */
                  <motion.div
                    key="cart-view"
                    variants={panelViewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col h-full"
                  >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-border-custom flex items-center justify-between bg-surface/50">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <span className="font-sans text-base font-bold text-primary">Keranjang Belanja</span>
                        <span className="bg-primary text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                          {cartCount}
                        </span>
                      </div>
                      <button
                        ref={cartCloseButtonRef}
                        onClick={closeCartEntirely}
                        className="p-1 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors"
                        aria-label="Tutup Keranjang"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                          <div className="h-16 w-16 bg-surface rounded-full flex items-center justify-center text-text-muted">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-sans text-base font-bold text-primary">Keranjang Kosong</h3>
                            <p className="text-text-secondary text-xs mt-1.5 max-w-[240px]">
                              Belum ada klakat atau alat dapur premium yang ditambahkan ke keranjang belanja Anda.
                            </p>
                          </div>
                          <Link
                            href="/catalog"
                            onClick={closeCartEntirely}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors"
                          >
                            Jelajahi Produk
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ) : (
                        items.map((item) => {
                          const price = item.variant?.price_override !== null && item.variant?.price_override !== undefined
                            ? item.variant.price_override
                            : item.product.price;
                          
                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 p-3 border border-border-custom rounded-lg hover:border-border-strong transition-all relative group"
                            >
                              {/* Image Placeholder with Grey Layer */}
                              <div className="relative h-16 w-16 overflow-hidden rounded-md bg-surface border border-border-custom flex-shrink-0">
                                {item.product.image_url ? (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-neutral-200" />
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0 pr-6">
                                <h4 className="font-sans text-xs font-bold text-primary line-clamp-1">
                                  {item.product.name}
                                </h4>
                                {item.variant && (
                                  <span className="inline-block mt-1 text-[10px] font-medium text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border-custom">
                                    Ukuran: {item.variant.size_label}
                                  </span>
                                )}
                                <div className="mt-2 flex items-center justify-between">
                                  {/* Quantity Editor */}
                                  <div className="flex items-center border border-border-strong rounded bg-surface">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="px-1.5 py-1 text-text-secondary hover:text-primary transition-colors"
                                      aria-label="Kurangi jumlah"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="px-2 text-xs font-mono font-semibold text-primary">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="px-1.5 py-1 text-text-secondary hover:text-primary transition-colors"
                                      aria-label="Tambah jumlah"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  {/* Price */}
                                  <span className="font-mono text-xs font-bold text-primary font-tabular">
                                    {formatIDR(price * item.quantity)}
                                  </span>
                                </div>
                              </div>

                              {/* Remove item button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="absolute top-3 right-3 text-text-muted hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                aria-label="Hapus Item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer and checkout summary */}
                    {items.length > 0 && (
                      <div className="p-6 border-t border-border-custom bg-surface/40 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary font-medium">Subtotal Belanja:</span>
                          <span className="font-mono text-base font-extrabold text-primary font-tabular">
                            {formatIDR(cartTotal)}
                          </span>
                        </div>
                        <p className="text-text-secondary text-[11px] leading-relaxed">
                          *Pemesanan diproses manual via WhatsApp. Total di atas belum termasuk ongkos kirim. Ongkos kirim disepakati dengan admin saat konfirmasi.
                        </p>
                        
                        {/* Checkout CTA WhatsApp (WhatsApp Green - NEVER change this color) */}
                        <motion.button
                          onClick={() => setIsCheckoutOpen(true)}
                          variants={ctaButtonVariants}
                          initial="rest"
                          animate="rest"
                          whileHover="hover"
                          whileTap={{ scale: 0.97 }}
                          className="relative w-full overflow-hidden py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 focus:ring-4 focus:ring-accent/30 cursor-pointer"
                        >
                          <motion.span
                            variants={ctaShineVariants}
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                          />
                          <span className="relative z-10 flex items-center gap-2">
                            Lanjut Isi Data Pengiriman
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ============ CHECKOUT VIEW ============ */
                  <motion.div
                    key="checkout-view"
                    variants={panelViewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col h-full"
                  >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-border-custom flex items-center gap-3 bg-surface/50">
                      <button
                        onClick={() => setIsCheckoutOpen(false)}
                        className="p-1.5 -ml-1.5 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors"
                        aria-label="Kembali ke Keranjang"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-accent">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Konfirmasi Pemesanan</span>
                        </div>
                        <span className="font-sans text-sm font-bold text-primary">Data Pengiriman</span>
                      </div>
                      <button
                        onClick={closeCartEntirely}
                        className="p-1 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors"
                        aria-label="Tutup Keranjang"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Form (scrollable body, same single panel) */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <p className="text-text-secondary text-xs mb-5 leading-relaxed">
                        Data berikut diperlukan oleh admin BalenpopStore untuk mengonfirmasi rincian ongkos kirim dan pengemasan pesanan Anda.
                      </p>

                      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            Nama Lengkap Anda *
                          </label>
                          <input
                            ref={customerNameInputRef}
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Ibu Aminah / Pak Budi"
                            className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            No. WhatsApp Aktif *
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="e.g. 0812XXXXXXXX"
                            className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Alamat Pengiriman Lengkap *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="e.g. Perumahan Indah Permai Blok B2 No. 5, RT 03 RW 05, Kec. Citeureup, Bogor"
                            className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all resize-none"
                          />
                        </div>

                        {/* Summary amount */}
                        <div className="bg-surface/60 rounded-lg p-4 border border-border-custom flex justify-between items-center text-sm">
                          <span className="text-text-secondary font-medium">Total Pesanan:</span>
                          <span className="font-mono text-base font-extrabold text-primary font-tabular">
                            {formatIDR(cartTotal)}
                          </span>
                        </div>

                        {/* Submit checkout to WA */}
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          variants={ctaButtonVariants}
                          initial="rest"
                          animate="rest"
                          whileHover={isSubmitting ? undefined : "hover"}
                          whileTap={isSubmitting ? undefined : { scale: 0.97 }}
                          className="relative w-full overflow-hidden py-3.5 bg-accent hover:bg-accent-hover disabled:bg-accent/60 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 focus:ring-4 focus:ring-accent/30 cursor-pointer"
                        >
                          <motion.span
                            variants={ctaShineVariants}
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                          />
                          <span className="relative z-10 flex items-center gap-2">
                            {isSubmitting ? (
                              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                Kirim Pesanan ke WhatsApp Penjual
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </span>
                        </motion.button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
