"use client";

import React, { useState } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { motion } from "motion/react";
import { ShieldCheck, Sparkles, Award, MapPin, Check, Hammer } from "lucide-react";

// Editorial Premium: hero text reveal — a touch slower/heavier than the
// homepage's hero fade-up so the story-intro feels more like a considered
// opening paragraph than a marketing headline.
const storyTextVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

// Editorial Premium: the three "Standardisasi Produksi" pillars are
// explicitly numbered/sequential (01 → 02 → 03), so — unlike the homepage's
// scale-in cards — they get a left-to-right horizontal stagger that
// reinforces the sense of a step-by-step process.
const pillarsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const pillarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const locationSplitVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function AboutPage() {
  // Real workshop photography has not been uploaded yet — this points at the
  // local /uploads/ path used across the app (see heroImage in app/page.tsx).
  // If it's missing, we fall back to a neutral, on-brand illustrative panel
  // instead of an external stock-photo placeholder.
  const [workshopImage, setWorkshopImage] = useState("/uploads/workshop-hero.jpg");
  const [workshopImageFailed, setWorkshopImageFailed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
        
        {/* Story Intro Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={storyTextVariants}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-mono font-bold rounded-full uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Cerita Di Balik BalenpopStore
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-tight">
              Dedikasi Pengrajin Logam Untuk Dapur UMKM Indonesia
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
              Berawal dari sebuah bengkel fabrikasi logam keluarga kecil di Citeureup, Bogor, BalenpopStore lahir untuk memberikan solusi alat kukusan (klakat) bermutu tinggi bagi para pengusaha dimsum, bakpao, kue basah, dan katering.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              Kami menyadari bahwa banyak pengusaha kuliner pemula sering mengeluhkan adonan kue mereka yang bantet atau rasa masakan rusak akibat tetesan kondensasi air panci biasa. Melalui uji coba presisi, kami merancang klakat bersudut piramida khusus yang mendistribusikan panas merata tanpa meneteskan air kondensasi.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative aspect-video w-full max-w-md rounded-2xl overflow-hidden border border-border-custom shadow-lg">
              {workshopImageFailed ? (
                // Neutral, on-brand fallback panel — used when the real
                // workshop photograph hasn't been uploaded to /uploads/ yet.
                <div className="w-full h-full bg-gradient-to-br from-surface to-primary/5 flex flex-col items-center justify-center gap-3 text-text-muted">
                  <Hammer className="h-10 w-10" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-center px-6">
                    Foto Bengkel BalenpopStore
                  </span>
                </div>
              ) : (
                <img
                  src={workshopImage}
                  onError={() => setWorkshopImageFailed(true)}
                  alt="Bengkel fabrikasi logam keluarga BalenpopStore di Citeureup, Bogor"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Manufacturing specs / Core pillars */}
        <section className="relative bg-surface/30 border border-border-custom rounded-2xl p-8 sm:p-12 space-y-10 overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-primary">Standardisasi Produksi Kami</h2>
            <p className="text-text-secondary text-xs">Kami percaya bahwa alat yang andal menghasilkan hidangan yang sempurna.</p>
          </div>

          <motion.div
            variants={pillarsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={pillarItemVariants} className="space-y-3 bg-white p-6 rounded-xl border border-border-custom">
              <span className="font-mono text-3xl font-black text-accent">01</span>
              <h3 className="font-display text-sm font-bold text-primary">Fabrikasi SUS 304 Murni</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Bukan plat lapis timah murahan. Kami hanya memotong dan menekuk lembaran baja Stainless Steel SUS 304 food-grade tebal yang kokoh, anti penyok, dan food-safe.
              </p>
            </motion.div>

            <motion.div variants={pillarItemVariants} className="space-y-3 bg-white p-6 rounded-xl border border-border-custom">
              <span className="font-mono text-3xl font-black text-accent">02</span>
              <h3 className="font-display text-sm font-bold text-primary">Sambungan Las Rapi & Kedap</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Tiap sudut klakat disatukan dengan las argon berketerampilan tinggi. Sambungan dihaluskan maksimal, kedap uap air, dan aman tanpa pinggiran tajam yang berbahaya bagi jari Anda.
              </p>
            </motion.div>

            <motion.div variants={pillarItemVariants} className="space-y-3 bg-white p-6 rounded-xl border border-border-custom">
              <span className="font-mono text-3xl font-black text-accent">03</span>
              <h3 className="font-display text-sm font-bold text-primary">Kontrol Mutu Ganda</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Sebelum dikemas dan dikirim ke alamat customer, tiap tingkat klakat dirakit dan diuji coba aliran uapnya secara teliti demi menjamin kepuasan saat pertama kali digunakan.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Location & Support */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={locationSplitVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-extrabold text-primary">Bengkel & Pengiriman Langsung</h2>
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
            <h3 className="font-display text-base font-bold text-primary mb-4">Ingin berkolaborasi atau memesan dalam jumlah besar?</h3>
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
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}
