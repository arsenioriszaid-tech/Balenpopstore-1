"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null); // TEMP: hapus setelah debugging selesai

  // Check if already logged in on mount
  useEffect(() => {
    async function checkUser() {
      try {
        const { data, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) {
          // TEMP: kalau getUser gagal, biasanya berarti session/token bermasalah
          console.warn("checkUser() getUserError:", getUserError.message);
        }
        if (data?.user) {
          router.push("/admin/dashboard");
        }
      } catch (err: unknown) {
        console.error("Error checking user:", err);
      }
    }
    checkUser();
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null); // TEMP
    setIsLoading(true);

    // TEMP: cek dulu apakah env var Supabase memang ke-load di client.
    // Kalau salah satu ini "MISSING", signInWithPassword bakal gagal diam-diam
    // atau ngelempar error yang membingungkan (fetch failed / invalid URL).
    const supabaseUrlPresent = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKeyPresent = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // TEMP: tampilkan mentahan respons di layar untuk debugging.
      // Ini bagian paling penting buat nangkep kasus "gagal tanpa tanda error":
      // kalau hasError dan hasUser dua-duanya false, berarti request-nya
      // kemungkinan besar gak pernah nyampe/kebalik dari Supabase dengan benar
      // (network/env/CORS issue), bukan salah password.
      setDebugInfo(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            supabaseUrlPresent,
            supabaseAnonKeyPresent,
            hasError: !!authError,
            errorName: authError?.name,
            errorStatus: (authError as { status?: number })?.status,
            errorMessage: authError?.message,
            hasUser: !!data?.user,
            hasSession: !!data?.session,
            userId: data?.user?.id,
            userEmailConfirmedAt: data?.user?.email_confirmed_at ?? null,
          },
          null,
          2
        )
      );

      if (authError) {
        setError(authError.message);
      } else if (data?.user) {
        // Set flag cookie agar middleware bisa mendeteksi status login
        if (typeof window !== "undefined") {
          document.cookie = "balenpop_admin_logged_in=true; path=/; max-age=86400; SameSite=Lax";
        }
        try {
          router.push("/admin/dashboard");
        } catch (navErr: unknown) {
          console.error("Navigation error:", navErr);
          setError("Gagal menavigasi ke dashboard");
        }
      } else {
        // TEMP: kondisi ganjil - tidak ada error, tapi tidak ada user juga.
        // Ini biasanya nandain: env var Supabase salah/kosong, project URL
        // salah, atau response ke-block sebelum sampai ke Supabase (mis. CORS,
        // ad-blocker, atau proxy). Cek debugInfo di bawah untuk detailnya.
        setError(
          "Login tidak mengembalikan user maupun error. Kemungkinan konfigurasi Supabase (URL/anon key) bermasalah — cek debug info di bawah."
        );
      }
    } catch (err: unknown) {
      // TEMP: log detail exception, bukan cuma pesan generik, biar kelihatan
      // apakah ini TypeError (network/fetch gagal total) atau error lain.
      const message = err instanceof Error ? err.message : String(err);
      setDebugInfo(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            supabaseUrlPresent,
            supabaseAnonKeyPresent,
            caughtException: true,
            exceptionMessage: message,
          },
          null,
          2
        )
      );
      setError("Terjadi kesalahan jaringan atau server.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">

      {/* Decorative Brand Header */}
      <div className="mb-6 text-center space-y-1.5">
        <span className="bg-primary text-white p-2.5 rounded font-mono font-bold tracking-wider text-sm shadow-md inline-block">
          BP
        </span>
        <h2 className="font-sans text-xl font-black text-primary leading-none">
          Balenpop<span className="text-accent">Store</span>
        </h2>
        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">
          Portal Administrasi Toko
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-border-custom rounded-xl p-6 sm:p-8 shadow-md">
        <div className="mb-6 space-y-1.5">
          <h1 className="font-sans text-lg font-bold text-primary">Login Administrator</h1>
          <p className="text-text-secondary text-xs">
            Masukkan alamat email administrator untuk mengelola katalog produk, kategori, dan laporan transaksi manual.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs mb-5">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TEMP: hapus blok ini setelah masalah login selesai di-debug */}
        {debugInfo && (
          <pre className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-[10px] mb-5 overflow-x-auto whitespace-pre-wrap">
            {debugInfo}
          </pre>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Alamat Email Admin
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@balenpopstore.com"
              className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Kata Sandi (Password)
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/65 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>
      </div>

      {/* Footer link to storefront */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-xs text-text-secondary hover:text-primary transition-colors underline">
          ← Kembali ke Toko Storefront
        </Link>
      </div>

    </div>
  );
}
