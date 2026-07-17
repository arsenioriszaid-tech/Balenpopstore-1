"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, CheckCircle, Sparkles, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/admin/dashboard");
      }
    }
    checkUser();
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (data?.user) {
        if (typeof window !== "undefined") {
          // SameSite=None; Secure is required for cookies to work inside cross-site iframes
          document.cookie = "balenpop_admin_logged_in=true; path=/; max-age=86400; SameSite=None; Secure";
          localStorage.setItem("balenpop_admin_logged_in", "true");
        }
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan atau server.");
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
            <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@balenpopstore.com"
              className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              className="w-full px-3.5 py-2.5 bg-white border border-border-strong rounded-md text-sm text-primary placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
          <span className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/65 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer uppercase tracking-wider mt-2"
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>


      {/* Footer link to storefront */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-xs text-text-secondary hover:text-primary transition-colors underline">
          ← Kembali ke Toko Storefront
        </Link>
      </div>

    </div>
  );
}
