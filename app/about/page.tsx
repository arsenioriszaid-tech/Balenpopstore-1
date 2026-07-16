"use client";

import React from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { ShieldCheck, Sparkles, Award, MapPin, Check } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
        
        {/* Story Intro Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-mono font-bold rounded-full uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Cerita Di Balik BalenpopStore
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight">
              Dedikasi Pengrajin Logam Untuk Dapur UMKM Indonesia
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
              Berawal dari sebuah bengkel fabrikasi logam keluarga kecil di Citeureup, Bogor, BalenpopStore lahir untuk memberikan solusi alat kukusan (klakat) bermutu tinggi bagi para pengusaha dimsum, bakpao, kue basah, dan katering.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              Kami menyadari bahwa banyak pengusaha kuliner pemula sering mengeluhkan adonan kue mereka yang bantet atau rasa masakan rusak akibat tetesan kondensasi air panci biasa. Melalui uji coba presisi, kami merancang klakat bersudut piramida khusus yang mendistribusikan panas merata tanpa meneteskan air kondensasi.
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative aspect-video w-full max-w-md rounded-2xl overflow-hidden border border-border-custom shadow-lg">
              <img
                src="https://picsum.photos/seed/workshop/600/400"
                alt="BalenpopStore workshop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Manufacturing specs / Core pillars */}
        <section className="bg-surface/30 border border-border-custom rounded-2xl p-8 sm:p-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-sans text-xl sm:text-2xl font-extrabold text-primary">Standardisasi Produksi Kami</h2>
            <p className="text-text-secondary text-xs">Kami percaya bahwa alat yang andal menghasilkan hidangan yang sempurna.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 bg-white p-6 rounded-xl border border-border-custom">
              <span className="font-mono text-3xl font-black text-accent">01</span>
              <h3 className="font-sans text-sm font-bold text-primary">Fabrikasi SUS 304 Murni</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Bukan plat lapis timah murahan. Kami hanya memotong dan menekuk lembaran baja Stainless Steel SUS 304 food-grade tebal yang kokoh, anti penyok, dan food-safe.
              </p>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-xl border border-border-custom">
              <span className="font-mono text-3xl font-black text-accent">02</span>
              <h3 className="font-sans text-sm font-bold text-primary">Sambungan Las Rapi & Kedap</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Tiap sudut klakat disatukan dengan las argon berketerampilan tinggi. Sambungan dihaluskan maksimal, kedap uap air, dan aman tanpa pinggiran tajam yang berbahaya bagi jari Anda.
              </p>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-xl border border-border-custom">
              <span className="font-mono text-3xl font-black text-accent">03</span>
              <h3 className="font-sans text-sm font-bold text-primary">Kontrol Mutu Ganda</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Sebelum dikemas dan dikirim ke alamat customer, tiap tingkat klakat dirakit dan diuji coba aliran uapnya secara teliti demi menjamin kepuasan saat pertama kali digunakan.
              </p>
            </div>
          </div>
        </section>

        {/* Location & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-sans text-2xl font-extrabold text-primary">Bengkel & Pengiriman Langsung</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Seluruh pesanan Anda dipacking kayu kokoh secara rahasia dan aman agar sampai di lokasi tanpa penyok sedikit pun. Kami mengirim langsung dari pusat produksi kami di Citeureup, Bogor ke seluruh pelosok Nusantara menggunakan cargo tepercaya dengan ongkir ekonomis.
            </p>
            <div className="space-y-3 pt-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                <span>Jalan Raya Tajur, Citeureup, Bogor</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                <span>Garansi Sambungan Las 1 Tahun</span>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-8 border border-border-custom">
            <h3 className="font-sans text-base font-bold text-primary mb-4">Ingin berkolaborasi atau memesan dalam jumlah besar?</h3>
            <p className="text-text-secondary text-xs leading-relaxed mb-6">
              Kami melayani tender alat masak dapur hotel, katering sekolah, restoran waralaba dimsum, hingga pengrajin bakpao dalam skala ribuan unit sebulan.
            </p>
            <a
              href="https://wa.me/62895365517451?text=Halo%20Admin%20BalenpopStore%2C%20saya%20tertarik%20tanya%20mengenai%20produk%20kerjasama%20klakat%20stainless%20custom."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors w-full cursor-pointer"
            >
              Hubungi Tim Kemitraan Kami
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
