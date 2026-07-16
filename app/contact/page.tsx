"use client";

import React, { useState } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle,
  Sparkles
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate contact form dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-xs font-mono font-bold rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Hubungi BalenpopStore
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-primary">Saran, Pertanyaan, & Pemesanan Custom</h1>
          <p className="text-text-secondary text-sm">
            Apakah Anda memiliki pertanyaan spesifikasi produk dapur, penawaran harga kemitraan katering, atau ingin mengajukan saran perbaikan kualitas layanan kami? Kami siap mendengar dari Anda.
          </p>
        </div>

        {/* Contact Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Contact Coordinates Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-sans text-lg font-bold text-primary">Informasi Kontak Kami</h2>
            
            <div className="space-y-4">
              {/* Address */}
              <div className="p-5 border border-border-custom bg-white rounded-xl flex gap-4 items-start shadow-xs">
                <span className="p-3 bg-primary/5 text-primary rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Pusat Produksi & Gudang</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Jalan Raya Tajur, Citeurep, Bogor
                  </p>
                </div>
              </div>

              {/* WhatsApp Call */}
              <div className="p-5 border border-border-custom bg-white rounded-xl flex gap-4 items-start shadow-xs">
                <span className="p-3 bg-primary/5 text-primary rounded-lg flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Layanan WhatsApp (Direct)</h4>
                  <p className="text-text-secondary text-xs leading-relaxed font-mono">
                    +62 895-3655-17451
                  </p>
                  <p className="text-[10px] text-accent font-semibold">Tersedia chat 24 Jam (Hari Minggu slow response)</p>
                </div>
              </div>

              {/* Email Support */}
              <div className="p-5 border border-border-custom bg-white rounded-xl flex gap-4 items-start shadow-xs">
                <span className="p-3 bg-primary/5 text-primary rounded-lg flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Surel Elektronik (Email)</h4>
                  <p className="text-text-secondary text-xs leading-relaxed font-mono">
                    support@balenpopstore.com
                  </p>
                </div>
              </div>

              {/* Working hours */}
              <div className="p-5 border border-border-custom bg-white rounded-xl flex gap-4 items-start shadow-xs">
                <span className="p-3 bg-primary/5 text-primary rounded-lg flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Jam Kerja Bengkel Logam</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Senin - Sabtu: 08:00 WIB - 18:00 WIB
                  </p>
                  <p className="text-[11px] text-text-muted">Proses pengemasan dan pick-up ekspedisi kargo dilakukan sore hari pukul 16:00 WIB.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Interactive Form */}
          <div className="lg:col-span-7 bg-white border border-border-custom p-8 rounded-2xl shadow-sm space-y-6">
            <h2 className="font-sans text-lg font-bold text-primary">Kirimkan Pesan Langsung</h2>
            
            {isSent && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-xs leading-relaxed">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <strong className="font-bold">Pesan Anda Berhasil Terkirim!</strong> Tim operasional BalenpopStore akan segera menindaklanjuti atau menghubungi Anda via email/telepon. Terima kasih.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Nama Lengkap Anda *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ibu Aminah"
                    className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Alamat Email Aktif *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aminah@nusantara.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Subjek Pertanyaan *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Tanya Ukuran Klakat Custom 40cm"
                  className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Isi Pesan Detail *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Silakan rincikan kebutuhan alat dapur atau pesanan klakat yang ingin Anda konsultasikan..."
                  className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/60 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-4 focus:ring-primary/20 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Kirim Form Pesan
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
