"use client";

import React, { useState } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// Editorial Premium: staggered entrance for the FAQ list, following the same
// container/item variant pattern already used for the mobile nav in
// components/storefront/Header.tsx (mobileNavContainerVariants /
// mobileNavItemVariants), so the motion language stays consistent site-wide.
const faqContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const faqItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apa itu Klakat Kukusan Stainless?",
      a: "Klakat adalah panci kukusan berbentuk kotak atau bulat bertingkat yang lazim digunakan untuk memasak kue basah (seperti bolu kukus, brownies), dimsum, bakpao, hingga siomay. Keunggulan utamanya ada pada rancangan sirkulasi uap air yang seragam.",
    },
    {
      q: "Mengapa penutup klakat BalenpopStore berbentuk piramida segitiga?",
      a: "Desain penutup piramida/kerucut lancip berfungsi mengalirkan air hasil kondensasi uap masak ke arah pinggir luar panci. Dengan begitu, air tidak menetes jatuh ke permukaan adonan kue atau makanan Anda, mencegah makanan bantet, benyek, atau berair.",
    },
    {
      q: "Apakah produk klakat ini aman untuk kesehatan (Food Grade)?",
      a: "Ya! Kami secara eksklusif menggunakan baja Stainless Steel SUS 304 premium dengan sertifikasi food-grade yang tebal dan anti-karat. Material ini murni tanpa lapisan zat kimia timbal berbahaya sehingga sangat higienis untuk mengolah makanan bersuhu tinggi.",
    },
    {
      q: "Bagaimana cara memesan produk di BalenpopStore?",
      a: "Cukup cari produk pilihan Anda di Katalog, klik 'Tambahkan ke Keranjang'. Setelah selesai memilih, buka Keranjang Belanja Anda, klik 'Isi Data Pengiriman' lalu submit. Sistem kami akan otomatis memformat rincian pesanan Anda ke tautan teks WhatsApp yang langsung membuka chat dengan Admin kami untuk penentuan ongkir & pembayaran.",
    },
    {
      q: "Apakah didukung pembayaran online lewat Payment Gateway?",
      a: "Sesuai rincian operasional kami, BalenpopStore tidak memiliki payment gateway otomatis di website. Seluruh transaksi dicatat manual, dan pembayaran dilakukan secara offline (Transfer bank BCA/Mandiri atau COD terkoordinasi) setelah berdiskusi mengenai ongkos kirim cargo terbaik di WhatsApp.",
    },
    {
      q: "Apakah bisa memesan ukuran klakat custom untuk usaha katering saya?",
      a: "Tentu bisa! Kami adalah produsen tangan pertama dengan pabrik logam tersertifikasi. Hubungi admin kami langsung di WhatsApp untuk berdiskusi tentang tinggi tiap tingkat, ukuran tatakan lubang, maupun kelonggaran kompor industri Anda.",
    },
    {
      q: "Bagaimana packing barang agar klakat tidak penyok di perjalanan?",
      a: "Setiap paket klakat dan produk dapur lainnya kami lapisi bubble wrap tebal ganda, kardus keras, serta opsi packing rangka kayu kokoh luar secara gratis untuk pengiriman luar kota/luar pulau guna menjamin klakat sampai ke dapur Anda dalam kondisi mulus tanpa penyok sedikit pun.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <Header />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        
        {/* Page title and intro */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-xs font-mono font-bold rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Tanya & Jawab Umum
          </div>
          <h1 className="font-display text-3xl font-extrabold text-primary">Frequently Asked Questions</h1>
          <p className="text-text-secondary text-sm">
            Temukan jawaban cepat atas pertanyaan umum mengenai produk klakat stainless steel premium, proses kustomisasi ukuran, dan mekanisme pemesanan via WhatsApp.
          </p>
        </div>

        {/* FAQs List with Smooth Motion Accordion */}
        <motion.div
          variants={faqContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="border border-border-custom rounded-2xl bg-white overflow-hidden divide-y divide-border-custom mt-8 shadow-xs"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;
            return (
              <motion.div
                key={index}
                variants={faqItemVariants}
                className="transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface/10"
              >
                <button
                  id={buttonId}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-sans text-sm font-bold text-primary flex items-center gap-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-4 w-4 text-text-secondary" />
                  </motion.span>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden bg-surface/30"
                    >
                      <p className="px-6 pb-6 text-text-secondary text-xs leading-relaxed border-t border-dashed border-border-custom pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Call to action if they still have questions */}
        <div className="bg-surface/40 rounded-xl p-6 border border-border-custom text-center space-y-3 mt-10">
          <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Pertanyaan Anda Belum Terjawab?</h4>
          <p className="text-text-secondary text-xs max-w-sm mx-auto">
            Grup Customer Service kami siap melayani pertanyaan spesifikasi detail produk atau harga custom katering.
          </p>
          <a
            href="https://wa.me/6282114567285?text=Halo%20Admin%20BalenpopStore%2C%20ada%20hal%20yang%20ingin%20saya%20tanyakan..."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Hubungi Admin langsung di WA
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
