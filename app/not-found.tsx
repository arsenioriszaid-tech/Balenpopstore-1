import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="font-sans text-4xl font-black text-primary">404</h1>
        <h2 className="font-sans text-lg font-bold text-primary">Halaman Tidak Ditemukan</h2>
        <p className="text-text-secondary text-xs">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan. Silakan kembali ke beranda.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
