"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  ShieldCheck,
  HelpCircle,
  Mail,
  Sparkles,
  Leaf,
  Ruler,
} from "lucide-react";

const trustBadges = [
  {
    icon: ShieldCheck,
    title: "Garansi Stainless",
    desc: "Bergaransi anti karat & anti penyok selama pemakaian normal",
  },
  {
    icon: Leaf,
    title: "Food Grade",
    desc: "SUS 304 asli, aman kontak langsung dengan makanan",
  },
  {
    icon: Ruler,
    title: "Custom Size",
    desc: "Ukuran menyesuaikan kebutuhan dapur & bisnis kuliner Anda",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white border-t border-white/10 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Trust Badges Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-14 mb-14 border-b border-white/10">
          {trustBadges.map((badge, i) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-start sm:text-left sm:gap-4"
            >
              <div
                className="animate-float-slow flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5"
                style={{ animationDelay: `${i * 0.7}s` }}
              >
                <badge.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <div>
                <h5 className="text-sm font-semibold tracking-wide text-white">
                  {badge.title}
                </h5>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14 pb-14 border-b border-white/10">

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
            <p className="text-white/70 text-xs leading-relaxed max-w-xs">
              Produsen dan distributor tangan pertama produk dapur stainless premium. Spesialis klakat kukusan kotak dan bulat food-grade SUS 304 dengan ketebalan prima.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-white/70">
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
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-white/70 mb-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/" className="inline-block py-1 hover:text-white transition-colors">Beranda Utama</Link>
              </li>
              <li>
                <Link href="/catalog" className="inline-block py-1 hover:text-white transition-colors">Katalog Klakat</Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-1 hover:text-white transition-colors">Tentang Balenpop</Link>
              </li>
              <li>
                <Link href="/faq" className="inline-block py-1 hover:text-white transition-colors">Tanya & Jawab (FAQ)</Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block py-1 hover:text-white transition-colors">Hubungi Penjual</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Reassurance Highlights */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-white/70 mb-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Keunggulan Kami
            </h4>
            <ul className="space-y-3 text-xs text-white/70">
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
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-white/70 mb-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Jam Operasional
            </h4>
            <div className="text-xs text-white/70 space-y-2">
              <p>Senin - Sabtu: <span className="text-white">08:00 - 18:00 WIB</span></p>
              <p>Minggu / Hari Libur: <span className="text-white">Chat Tetap Dilayani (Slow Response)</span></p>
              <div className="pt-4 border-t border-white/5 mt-4">
                <p className="text-[11px] text-white/60">Menerima pemesanan satuan, partai besar, kustomisasi ukuran industri kuliner.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Legalities */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            BalenpopStore © {currentYear}. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="inline-block py-1.5 hover:text-white transition-colors font-mono text-[10px]">Portal Admin</Link>
            <span className="text-white/20">|</span>
            <span className="text-white/60">Klakat Premium Indonesia</span>
          </div>
        </div>

      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes float-slow {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
          .animate-float-slow {
            animation: float-slow 4.5s ease-in-out infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow {
            animation: none;
          }
        }
      `}</style>
    </footer>
  );
}
