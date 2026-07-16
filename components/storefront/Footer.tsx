"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, ShieldCheck, HelpCircle, Mail, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white border-t border-white/10 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand details */}
          <div className="md:col-span-1.5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-white text-primary px-2.5 py-1.5 rounded font-mono font-bold tracking-wider text-sm shadow-sm">
                BP
              </span>
              <span className="font-sans text-xl font-bold tracking-tight text-white leading-none">
                Balenpop<span className="text-accent">Store</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-xs">
              Produsen dan distributor tangan pertama produk dapur stainless premium. Spesialis klakat kukusan kotak dan bulat food-grade SUS 304 dengan ketebalan prima.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                <span>Jalan Raya Tajur, Citeurep, Bogor</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <span>+62 895-3655-17451</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-300 mb-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Beranda Utama</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">Katalog Klakat</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Tentang Balenpop</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">Tanya & Jawab (FAQ)</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Hubungi Penjual</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Reassurance Highlights */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-300 mb-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Keunggulan Kami
            </h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0" />
                <span>Bahan Stainless SUS 304 Tebal, Food Grade & Anti Karat</span>
              </li>
              <li className="flex gap-2.5">
                <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                <span>Tutup Piramida Eksklusif (Kue anti-basah kondensasi)</span>
              </li>
              <li className="flex gap-2.5">
                <HelpCircle className="h-4 w-4 text-accent flex-shrink-0" />
                <span>Bisa pesan ukuran custom sesuai kebutuhan UMKM Anda</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Quick Support info */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-300 mb-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Jam Operasional
            </h4>
            <div className="text-xs text-neutral-400 space-y-2">
              <p>Senin - Sabtu: <span className="text-white">08:00 - 18:00 WIB</span></p>
              <p>Minggu / Hari Libur: <span className="text-white">Chat Tetap Dilayani (Slow Response)</span></p>
              <div className="pt-4 border-t border-white/5 mt-4">
                <p className="text-[11px] text-neutral-500">Menerima pemesanan satuan, partai besar, kustomisasi ukuran industri kuliner.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Legalities */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            BalenpopStore © {currentYear}. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-6">
            <Link href="/admin/login" className="hover:text-white transition-colors font-mono text-[10px]">Portal Admin</Link>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-500">Klakat Premium Indonesia</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
