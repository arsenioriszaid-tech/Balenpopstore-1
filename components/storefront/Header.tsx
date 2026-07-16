"use client";

import React, { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

export default function Header() {
  const pathname = usePathname();
  const { items, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      alert("Harap lengkapi semua formulir!");
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
        window.open(waUrl, "_blank");
      })
      .catch((err) => {
        console.error("Failed to log sale:", err);
        // Fallback to direct redirect anyway so transaction is never blocked
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setIsSubmitting(false);
        window.open(waUrl, "_blank");
      });
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
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-mono font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
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
                <div className="flex flex-col gap-5 mt-8">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "text-base font-semibold py-1 transition-colors",
                          isActive ? "text-primary border-l-4 border-primary pl-3" : "text-text-secondary pl-4"
                        )}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
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

      {/* Cart Drawer Panel (AnimatePresence) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black/55"
            />
            
            {/* Cart Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col justify-between"
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
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors"
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
                      onClick={() => setIsCartOpen(false)}
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
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-mono font-semibold text-primary">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-1.5 py-1 text-text-secondary hover:text-primary transition-colors"
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
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-4 focus:ring-accent/30 cursor-pointer"
                  >
                    Lanjut Isi Data Pengiriman
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Data Form Modal (AnimatePresence) */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-55 overflow-y-auto">
            {/* Backdrop */}
            <div 
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            />

            {/* Modal Body Container */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white p-6 shadow-2xl border border-border-custom"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-full text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-accent mb-1.5">
                    <span className="bg-accent/10 p-1.5 rounded-full">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-mono font-bold tracking-wider uppercase">Konfirmasi Pemesanan</span>
                  </div>
                  <h3 className="font-sans text-xl font-bold text-primary">Data Pengiriman Customer</h3>
                  <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                    Data berikut diperlukan oleh admin BalenpopStore untuk mengonfirmasi rincian ongkos kirim dan pengemasan pesanan Anda.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Nama Lengkap Anda *
                    </label>
                    <input
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
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-accent hover:bg-accent-hover disabled:bg-accent/60 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-4 focus:ring-accent/30 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Kirim Pesanan ke WhatsApp Penjual
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
