"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  BarChart3, 
  Layers, 
  ShoppingBag, 
  ShoppingCart, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Check, 
  Eye, 
  Download, 
  TrendingUp, 
  FileText, 
  Loader2, 
  Sparkles,
  Settings,
  Image as ImageIcon,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // Auth state
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "products" | "categories" | "sales" | "reports">("summary");
  const [isLoading, setIsLoading] = useState(true);

  // Database states
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);

  // Skeletons during operation
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form loading locks
  const [formLoading, setFormLoading] = useState(false);

  // Hero and image upload state
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroUploadMessage, setHeroUploadMessage] = useState("");
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [heroImage, setHeroImage] = useState("");

  // Modal / CRUD editing States
  const [activeProductModal, setActiveProductModal] = useState<"create" | "edit" | null>(null);
  const [activeCategoryModal, setActiveCategoryModal] = useState<"create" | "edit" | null>(null);
  const [activeVariantModal, setActiveVariantModal] = useState<"manage" | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<"manage" | null>(null);
  const [activeSaleModal, setActiveSaleModal] = useState<"create" | "view" | null>(null);

  // Form Inputs
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    category_id: "",
    description: "",
    price: "",
    image_url: "",
    is_active: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    slug: "",
  });

  // Variant manager states
  const [variantForm, setVariantForm] = useState({
    id: "",
    product_id: "",
    size_label: "",
    price_override: "",
    stock: "10",
    is_active: true,
  });

  // Extra images manager states
  const [extraImageForm, setExtraImageForm] = useState({
    id: "",
    product_id: "",
    image_url: "",
    sort_order: "0",
  });

  // Manual sales input form
  const [salesForm, setSalesForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    status: "completed",
    items: [] as Array<{
      product_id: string;
      variant_id: string; // "base" or variantId
      quantity: number;
      price_at_sale: number;
    }>
  });
  
  // For picking lines inside manual sale input
  const [tempLineItem, setTempLineItem] = useState({
    product_id: "",
    variant_id: "base",
    quantity: 1,
  });

  const [selectedSaleDetail, setSelectedSaleDetail] = useState<any>(null);

  // Authentication & Initial Data Fetching
  useEffect(() => {
    async function initDashboard() {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/admin/login");
        return;
      }
      setAdminUser(data.user);
      await loadAllData();
      setIsLoading(false);
    }
    initDashboard();
  }, [router]);

  async function loadAllData() {
    setIsRefreshing(true);
    try {
      const { data: catData } = await supabase.from("categories").select("*");
      setCategories(catData || []);

      const { data: prodData } = await supabase.from("products").select("*");
      setProducts(prodData || []);

      const { data: varData } = await supabase.from("product_variants").select("*");
      setVariants(varData || []);

      const { data: imgData } = await supabase.from("product_images").select("*");
      setProductImages(imgData || []);

      const { data: saleData } = await supabase.from("sales").select("*");
      setSales(saleData || []);

      const { data: itemData } = await supabase.from("sale_items").select("*");
      setSaleItems(itemData || []);
    } catch (e) {
      console.error("Dashboard failed to sync data:", e);
    } finally {
      setIsRefreshing(false);
    }
  }

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      document.cookie = "balenpop_admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
      localStorage.removeItem("balenpop_admin_logged_in");
    }
    router.push("/admin/login");
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    setHeroUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isHero", "true");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setHeroImage(data.url);
        setHeroUploadMessage("Berhasil! Foto utama halaman depan telah diperbarui secara instan.");
      } else {
        setHeroUploadMessage("Gagal mengunggah gambar: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      setHeroUploadMessage("Gagal mengunggah gambar: " + err.message);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isExtra: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProduct(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (isExtra) {
          setExtraImageForm((prev) => ({
            ...prev,
            image_url: data.url,
          }));
        } else {
          setProductForm((prev) => ({
            ...prev,
            image_url: data.url,
          }));
        }
      } else {
        alert("Gagal mengunggah gambar: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Gagal mengunggah gambar: " + err.message);
    } finally {
      setUploadingProduct(false);
    }
  };

  // ----------------------------------------------------------------
  // PRODUCT CRUD PROCEDURES
  // ----------------------------------------------------------------
  const triggerAddProduct = () => {
    setProductForm({
      id: "",
      name: "",
      category_id: categories[0]?.id || "",
      description: "",
      price: "",
      image_url: "",
      is_active: true,
    });
    setActiveProductModal("create");
  };

  const triggerEditProduct = (p: any) => {
    setProductForm({
      id: p.id,
      name: p.name,
      category_id: p.category_id || "",
      description: p.description || "",
      price: String(p.price),
      image_url: p.image_url || "",
      is_active: p.is_active,
    });
    setActiveProductModal("edit");
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        name: productForm.name,
        category_id: productForm.category_id || null,
        description: productForm.description,
        price: Number(productForm.price),
        image_url: productForm.image_url,
        is_active: productForm.is_active,
      };

      if (activeProductModal === "create") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", productForm.id);
        if (error) throw error;
      }

      await loadAllData();
      setActiveProductModal(null);
    } catch (err: any) {
      console.error("Failed to commit product:", err);
      alert("Gagal menyimpan produk: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini beserta seluruh varian dan gambarnya secara permanen?")) return;
    setIsRefreshing(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", prodId);
      if (error) throw error;
      await loadAllData();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert("Gagal menghapus produk: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsRefreshing(false);
    }
  };

  // ----------------------------------------------------------------
  // CATEGORY CRUD PROCEDURES
  // ----------------------------------------------------------------
  const triggerAddCategory = () => {
    setCategoryForm({ id: "", name: "", slug: "" });
    setActiveCategoryModal("create");
  };

  const triggerEditCategory = (c: any) => {
    setCategoryForm({ id: c.id, name: c.name, slug: c.slug });
    setActiveCategoryModal("edit");
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const slugValue = categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const payload = { name: categoryForm.name, slug: slugValue };

      if (activeCategoryModal === "create") {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").update(payload).eq("id", categoryForm.id);
        if (error) throw error;
      }

      await loadAllData();
      setActiveCategoryModal(null);
    } catch (err: any) {
      console.error("Failed to commit category:", err);
      alert("Gagal menyimpan kategori: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini secara permanen?")) return;
    setIsRefreshing(true);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", catId);
      if (error) throw error;
      await loadAllData();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert("Gagal menghapus kategori: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsRefreshing(false);
    }
  };

  // ----------------------------------------------------------------
  // VARIANT CRUD PROCEDURES
  // ----------------------------------------------------------------
  const triggerManageVariants = (p: any) => {
    setVariantForm({
      id: "",
      product_id: p.id,
      size_label: "",
      price_override: "",
      stock: "10",
      is_active: true,
    });
    setActiveVariantModal("manage");
  };

  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const override = variantForm.price_override.trim() !== "" ? Number(variantForm.price_override) : null;
      const payload = {
        product_id: variantForm.product_id,
        size_label: variantForm.size_label,
        price_override: override,
        stock: Number(variantForm.stock),
        is_active: variantForm.is_active,
      };

      const { error } = await supabase.from("product_variants").insert(payload);
      if (error) throw error;
      await loadAllData();
      // Reset form fields
      setVariantForm((prev) => ({
        ...prev,
        id: "",
        size_label: "",
        price_override: "",
        stock: "10",
      }));
    } catch (err: any) {
      console.error("Failed to add variant:", err);
      alert("Gagal menambah varian: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVariant = async (varId: string) => {
    if (!confirm("Hapus varian ukuran ini?")) return;
    setFormLoading(true);
    try {
      const { error } = await supabase.from("product_variants").delete().eq("id", varId);
      if (error) throw error;
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menghapus varian: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // MULTI IMAGE CRUD PROCEDURES
  // ----------------------------------------------------------------
  const triggerManageImages = (p: any) => {
    setExtraImageForm({
      id: "",
      product_id: p.id,
      image_url: "",
      sort_order: "0",
    });
    setActiveImageModal("manage");
  };

  const handleAddImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        product_id: extraImageForm.product_id,
        image_url: extraImageForm.image_url,
        sort_order: Number(extraImageForm.sort_order),
      };

      const { error } = await supabase.from("product_images").insert(payload);
      if (error) throw error;
      await loadAllData();
      setExtraImageForm((prev) => ({
        ...prev,
        id: "",
        image_url: "",
        sort_order: "0",
      }));
    } catch (err: any) {
      console.error(err);
      alert("Gagal menambah gambar: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!confirm("Hapus gambar tambahan ini?")) return;
    setFormLoading(true);
    try {
      const { error } = await supabase.from("product_images").delete().eq("id", imgId);
      if (error) throw error;
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menghapus gambar: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // MANUAL SALES INPUT & SEEDING PROCEDURES
  // ----------------------------------------------------------------
  const triggerAddSales = () => {
    // Default pick
    const firstProd = products[0];
    const relatedVars = variants.filter((v) => v.product_id === firstProd?.id);

    setSalesForm({
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      status: "completed",
      items: [],
    });

    setTempLineItem({
      product_id: firstProd?.id || "",
      variant_id: relatedVars[0]?.id || "base",
      quantity: 1,
    });

    setActiveSaleModal("create");
  };

  // Calculate current price of temp pick
  const getTempLinePrice = () => {
    const p = products.find((prod) => prod.id === tempLineItem.product_id);
    if (!p) return 0;
    if (tempLineItem.variant_id !== "base") {
      const v = variants.find((varRow) => varRow.id === tempLineItem.variant_id);
      if (v && v.price_override !== null) {
        return Number(v.price_override);
      }
    }
    return Number(p.price);
  };

  const handleAddLineItem = () => {
    if (!tempLineItem.product_id) return;
    
    const price = getTempLinePrice();
    setSalesForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: tempLineItem.product_id,
          variant_id: tempLineItem.variant_id === "base" ? "" : tempLineItem.variant_id,
          quantity: tempLineItem.quantity,
          price_at_sale: price,
        }
      ]
    }));
  };

  const handleRemoveLineItem = (idx: number) => {
    setSalesForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salesForm.items.length === 0) {
      alert("Harap tambahkan minimal 1 baris item produk!");
      return;
    }
    setFormLoading(true);

    try {
      const totalAmount = salesForm.items.reduce((sum, item) => sum + item.price_at_sale * item.quantity, 0);

      // 1. Insert Sales — .select().single() is required, otherwise Supabase
      // does not return the inserted row and we have no real sale id to link items to.
      const { data: newSale, error: salesErr } = await supabase
        .from("sales")
        .insert({
          customer_name: salesForm.customer_name,
          customer_phone: salesForm.customer_phone || null,
          customer_address: salesForm.customer_address || null,
          status: salesForm.status,
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (salesErr) throw salesErr;
      if (!newSale) throw new Error("Gagal membuat transaksi: baris sale tidak ditemukan setelah insert.");

      // 2. Insert Sale Items
      const preparedLines = salesForm.items.map((item) => ({
        sale_id: newSale.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
      }));

      const { error: itemsErr } = await supabase.from("sale_items").insert(preparedLines);
      if (itemsErr) throw itemsErr;

      await loadAllData();
      setActiveSaleModal(null);
    } catch (err: any) {
      console.error("Failed to commit sale manually:", err);
      alert("Gagal mencatat transaksi manual: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewSale = (saleRow: any) => {
    // Collect related items
    const lines = saleItems.filter((si) => si.sale_id === saleRow.id);
    setSelectedSaleDetail({
      ...saleRow,
      lines: lines.map((l) => {
        const prod = products.find((p) => p.id === l.product_id);
        const vari = variants.find((v) => v.id === l.variant_id);
        return {
          ...l,
          product_name: prod ? prod.name : "Produk Dihapus",
          variant_label: vari ? vari.size_label : "",
        };
      }),
    });
    setActiveSaleModal("view");
  };

  // ----------------------------------------------------------------
  // REPORTS COMPUTATIONS & EXPORTS
  // ----------------------------------------------------------------
  const totalSalesVolume = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalCompletedOrders = sales.filter((s) => s.status === "completed").length;

  // Group sales for daily, monthly summaries
  const getReportsData = () => {
    const dailyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();

    sales.forEach((s) => {
      const dateStr = new Date(s.created_at).toISOString().split("T")[0]; // YYYY-MM-DD
      const monthStr = dateStr.substring(0, 7); // YYYY-MM

      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + Number(s.total_amount));
      monthlyMap.set(monthStr, (monthlyMap.get(monthStr) || 0) + Number(s.total_amount));
    });

    const daily = Array.from(dailyMap.entries()).map(([date, val]) => ({ key: date, val }));
    const monthly = Array.from(monthlyMap.entries()).map(([month, val]) => ({ key: month, val }));

    daily.sort((a, b) => b.key.localeCompare(a.key));
    monthly.sort((a, b) => b.key.localeCompare(a.key));

    return { daily, monthly };
  };

  const { daily: dailyReports, monthly: monthlyReports } = getReportsData();

  // Excel/CSV Exporter (PRD §10.6/§14)
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Transaksi,Tanggal,Nama Pembeli,No WhatsApp,Alamat Kirim,Total Transaksi,Status\n";

    sales.forEach((s) => {
      const cleanDate = new Date(s.created_at).toLocaleString("id-ID");
      const cleanAddress = (s.customer_address || "").replace(/,/g, " ");
      const row = `"${s.id}","${cleanDate}","${s.customer_name}","${s.customer_phone || "-"}","${cleanAddress}",${s.total_amount},"${s.status}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_Balenpop_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-text-secondary text-xs font-medium font-mono">Menyelaraskan Kredensial Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-primary text-white flex flex-col justify-between border-r border-white/5">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center gap-2.5">
            <span className="bg-white text-primary px-2.5 py-1.5 rounded font-mono font-bold tracking-wider text-xs shadow-md">
              BP
            </span>
            <div>
              <h2 className="font-sans text-base font-extrabold text-white leading-none">
                Balenpop<span className="text-accent">Store</span>
              </h2>
              <span className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase mt-1 block">Administrator</span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("summary")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "summary" ? "bg-white text-primary shadow-sm" : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              Overview Ringkasan
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "products" ? "bg-white text-primary shadow-sm" : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              Katalog Produk
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "categories" ? "bg-white text-primary shadow-sm" : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Layers className="h-4.5 w-4.5" />
              Kelola Kategori
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "sales" ? "bg-white text-primary shadow-sm" : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              Pencatatan Sales
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "reports" ? "bg-white text-primary shadow-sm" : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              Laporan & Export
            </button>
          </nav>
        </div>

        {/* User context & log out */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-accent text-xs border border-white/15">
              OB
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-white truncate">Owner Balenpop</p>
              <p className="text-[9px] text-neutral-400 font-mono truncate">admin@balenpopstore.com</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-white/15 hover:bg-red-500 hover:border-red-500 text-[11px] rounded-md transition-all text-neutral-300 font-semibold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Keluar Dashboard
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-x-hidden">
        
        {/* Top bar info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-strong pb-4">
          <div>
            <h1 className="font-sans text-xl font-extrabold text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              Portal Control BalenpopStore
            </h1>
            <p className="text-xs text-text-secondary">Kelola seluruh barang dagangan dapur murni secara terpadu.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold border border-border-strong rounded-lg bg-white text-primary hover:bg-surface transition-all flex items-center gap-1.5"
            >
              <Eye className="h-4 w-4" />
              Lihat Toko Publik
            </Link>
            <button
              onClick={loadAllData}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-mono font-semibold bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isRefreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Segarkan Data"
              )}
            </button>
          </div>
        </div>

        {/* Render Tab Context */}

        {/* TAB 1: SUMMARY OVERVIEW */}
        {activeTab === "summary" && (
          <div className="space-y-8">
            {/* Quick Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-mono font-extrabold text-text-secondary tracking-widest">Total Produk</span>
                <p className="font-mono text-2xl font-black text-primary font-tabular mt-1">{products.length} pcs</p>
                <p className="text-[10px] text-text-muted mt-2">Termasuk aktif & non-aktif</p>
              </div>

              <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-mono font-extrabold text-text-secondary tracking-widest">Total Kategori</span>
                <p className="font-mono text-2xl font-black text-primary font-tabular mt-1">{categories.length}</p>
                <p className="text-[10px] text-text-muted mt-2">Ragam klasifikasi</p>
              </div>

              <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-mono font-extrabold text-text-secondary tracking-widest">Total Transaksi</span>
                <p className="font-mono text-2xl font-black text-primary font-tabular mt-1">{totalCompletedOrders} order</p>
                <p className="text-[10px] text-text-muted mt-2">Tercatat secara manual</p>
              </div>

              <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-mono font-extrabold text-text-secondary tracking-widest">Total Nilai Penjualan</span>
                <p className="font-mono text-2xl font-black text-primary font-tabular mt-1">{formatIDR(totalSalesVolume)}</p>
                <p className="text-[10px] text-accent font-semibold flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3.5 w-3.5" /> 100% Pembukuan Riil
                </p>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-5 border-b border-border-custom flex items-center justify-between bg-surface/50">
                <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary">Transaksi Terakhir</h3>
                <button onClick={() => setActiveTab("sales")} className="text-xs text-primary font-bold hover:underline">
                  Kelola Semua Sales →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface border-b border-border-custom text-text-secondary font-mono">
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4 text-right">Total Transaksi</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {sales.slice(0, 5).map((s) => (
                      <tr key={s.id} className="hover:bg-surface-hover transition-colors font-sans">
                        <td className="p-4 text-text-secondary font-mono">{new Date(s.created_at).toLocaleDateString("id-ID")}</td>
                        <td className="p-4 font-bold text-primary">{s.customer_name}</td>
                        <td className="p-4 text-right font-mono font-bold font-tabular text-primary">{formatIDR(s.total_amount)}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleViewSale(s)}
                            className="p-1.5 hover:bg-surface rounded border border-border-strong hover:text-primary transition-colors text-text-secondary"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Storefront Appearance Settings (Mobile Friendly) */}
            <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs p-6 space-y-6">
              <div className="border-b border-border-custom pb-4">
                <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-accent" />
                  Pengaturan Gambar Utama Toko (Halaman Depan)
                </h3>
                <p className="text-[11px] text-text-secondary mt-1">
                  Ubah foto klakat utama yang tampil di beranda depan. Sangat mudah digunakan dari HP: klik tombol di bawah untuk memilih foto dari galeri HP atau langsung foto dengan kamera.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-primary">Upload Foto Utama Baru</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroUpload}
                        className="hidden"
                        id="hero-file-upload"
                        disabled={uploadingHero}
                      />
                      <label
                        htmlFor="hero-file-upload"
                        className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          uploadingHero 
                            ? "bg-surface text-text-muted border-border-custom animate-pulse" 
                            : "border-primary text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        {uploadingHero ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mengunggah...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            Pilih Foto / Ambil Gambar dari HP
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {heroUploadMessage && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${
                      heroUploadMessage.startsWith("Berhasil") 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {heroUploadMessage}
                    </div>
                  )}
                </div>

                <div className="border border-border-custom p-4 rounded-xl bg-surface/50 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[10px] uppercase font-mono font-extrabold text-text-secondary tracking-widest">Pratinjau Foto Depan Aktif</span>
                  <div className="relative h-40 w-40 rounded-lg overflow-hidden border border-border-strong bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage || "/uploads/hero_main.jpg"}
                      alt="Pratinjau Hero"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://picsum.photos/seed/klakatpremium/600/600";
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Sistem otomatis menggunakan foto klakat stainless Anda setelah berhasil diunggah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG CRUD */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary">Daftar Katalog Produk</h3>
              <button
                onClick={triggerAddProduct}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                Tambah Produk Baru
              </button>
            </div>

            {/* Products Admin Table (table-admin with proper border-bottom and pagination) */}
            <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface border-b border-border-custom text-text-secondary font-mono uppercase">
                      <th className="p-4">Gambar</th>
                      <th className="p-4">Nama Produk</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4 text-right">Harga Base</th>
                      <th className="p-4 text-center">Varian</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {products.map((p) => {
                      const catName = categories.find((c) => c.id === p.category_id)?.name || "-";
                      const prodVars = variants.filter((v) => v.product_id === p.id);
                      return (
                        <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                          <td className="p-4">
                            <div className="h-10 w-10 bg-surface rounded-md overflow-hidden border border-border-custom flex-shrink-0">
                              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-primary">{p.name}</td>
                          <td className="p-4 text-text-secondary">{catName}</td>
                          <td className="p-4 text-right font-mono font-bold font-tabular text-primary">{formatIDR(p.price)}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => triggerManageVariants(p)}
                              className="px-2.5 py-1 bg-surface hover:bg-border-strong text-text-primary border border-border-custom rounded font-mono font-bold text-[10px]"
                            >
                              Varian ({prodVars.length})
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              p.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-neutral-50 text-neutral-400 border border-neutral-200"
                            }`}>
                              {p.is_active ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              {/* Extra images link */}
                              <button
                                onClick={() => triggerManageImages(p)}
                                className="p-1.5 hover:bg-surface border border-border-strong rounded text-text-secondary hover:text-primary"
                                title="Kelola Gambar Multi"
                              >
                                <ImageIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => triggerEditProduct(p)}
                                className="p-1.5 hover:bg-surface border border-border-strong rounded text-text-secondary hover:text-blue-600"
                                title="Edit Produk"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 hover:bg-red-50 border border-border-strong rounded text-text-secondary hover:text-red-600"
                                title="Hapus Produk"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES CRUD */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary">Kelola Kategori</h3>
              <button
                onClick={triggerAddCategory}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                Tambah Kategori Baru
              </button>
            </div>

            <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border-custom text-text-secondary font-mono uppercase">
                    <th className="p-4">Nama Kategori</th>
                    <th className="p-4">Slug URL</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-hover transition-colors">
                      <td className="p-4 font-bold text-primary">{c.name}</td>
                      <td className="p-4 font-mono text-text-secondary">{c.slug}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => triggerEditCategory(c)}
                            className="p-1.5 hover:bg-surface border border-border-strong rounded text-text-secondary hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 hover:bg-red-50 border border-border-strong rounded text-text-secondary hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL SALES RECORDER */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary">Catatan Penjualan</h3>
              <button
                onClick={triggerAddSales}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                Catat Transaksi Manual (Luring)
              </button>
            </div>

            <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border-custom text-text-secondary font-mono uppercase">
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Nama Pembeli</th>
                    <th className="p-4">No HP</th>
                    <th className="p-4 text-right">Nilai Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                      <td className="p-4 font-mono text-text-secondary">{new Date(s.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="p-4 font-bold text-primary">{s.customer_name}</td>
                      <td className="p-4 font-mono text-text-secondary">{s.customer_phone || "-"}</td>
                      <td className="p-4 text-right font-mono font-bold font-tabular text-primary">{formatIDR(s.total_amount)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewSale(s)}
                          className="px-2.5 py-1 hover:bg-surface border border-border-strong rounded text-text-primary text-[10px] font-semibold"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS & EXPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest text-primary">Metrik Laporan Penjualan</h3>
                <p className="text-text-secondary text-[11px] mt-0.5">Pantau ringkasan akumulatif omzet Anda secara harian dan bulanan.</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="h-4.5 w-4.5" />
                Ekspor ke Excel (CSV)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Report */}
              <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-border-custom bg-surface/50 font-bold text-xs uppercase font-mono text-primary">
                  Omzet Harian
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface/30 border-b border-border-custom text-text-secondary font-mono">
                      <th className="p-3">Tanggal</th>
                      <th className="p-3 text-right">Nilai Omzet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {dailyReports.map((d) => (
                      <tr key={d.key} className="hover:bg-surface-hover transition-colors font-mono">
                        <td className="p-3 font-semibold text-text-secondary">{d.key}</td>
                        <td className="p-3 text-right font-extrabold font-tabular text-primary">{formatIDR(d.val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Monthly Report */}
              <div className="bg-white border border-border-custom rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-border-custom bg-surface/50 font-bold text-xs uppercase font-mono text-primary">
                  Omzet Bulanan
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface/30 border-b border-border-custom text-text-secondary font-mono">
                      <th className="p-3">Bulan</th>
                      <th className="p-3 text-right">Nilai Omzet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {monthlyReports.map((m) => (
                      <tr key={m.key} className="hover:bg-surface-hover transition-colors font-mono">
                        <td className="p-3 font-semibold text-text-secondary">{m.key}</td>
                        <td className="p-3 text-right font-extrabold font-tabular text-primary">{formatIDR(m.val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================================================================ */}
      {/* 3. MODALS AND FORMS OVERLAYS */}
      {/* ================================================================ */}

      {/* A. PRODUCT CREATE/EDIT MODAL */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-border-custom rounded-xl p-6 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-sans text-base font-extrabold text-primary mb-4">
              {activeProductModal === "create" ? "Tambah Produk Baru" : "Edit Spesifikasi Produk"}
            </h3>
            
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Kategori *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Harga Dasar (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">URL / File Gambar Utama *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                      placeholder="https://... atau upload file"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e, false)}
                      className="hidden"
                      id="product-file-upload"
                      disabled={uploadingProduct}
                    />
                    <label
                      htmlFor="product-file-upload"
                      className={`px-3 py-2 border rounded-md text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        uploadingProduct
                          ? "bg-surface text-text-muted border-border-custom animate-pulse"
                          : "border-primary text-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      {uploadingProduct ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Upload"
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Deskripsi Lengkap *</label>
                <textarea
                  required
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Klakat kukusan stainless steel kualitas premium dengan ketebalan..."
                  className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod_active"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="prod_active" className="text-xs font-semibold text-text-secondary">Produk ini aktif di etalase toko</label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setActiveProductModal(null)}
                  className="px-4 py-2 border border-border-strong rounded-md text-xs font-semibold hover:bg-surface"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                >
                  {formLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. CATEGORY CREATE/EDIT MODAL */}
      {activeCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-border-custom rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-sans text-base font-extrabold text-primary mb-4">
              {activeCategoryModal === "create" ? "Tambah Kategori Baru" : "Edit Nama Kategori"}
            </h3>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Klakat Bulat"
                  className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Slug URL (Opsional)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. klakat-bulat"
                  className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setActiveCategoryModal(null)}
                  className="px-4 py-2 border border-border-strong rounded-md text-xs font-semibold hover:bg-surface"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                >
                  {formLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. VARIANT MANAGER MODAL */}
      {activeVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-border-custom rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans text-base font-extrabold text-primary">Kelola Varian Ukuran</h3>
              <button onClick={() => setActiveVariantModal(null)} className="p-1 rounded-full hover:bg-surface">
                ✕
              </button>
            </div>

            {/* List Current Variants */}
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto border border-border-custom rounded-lg p-3 bg-surface/30">
              <span className="text-[10px] uppercase font-mono font-bold text-text-secondary tracking-wider block">Varian Terdaftar:</span>
              {variants.filter((v) => v.product_id === variantForm.product_id).length === 0 ? (
                <p className="text-text-muted text-[11px] py-2">Belum ada varian ukuran yang diinput.</p>
              ) : (
                variants.filter((v) => v.product_id === variantForm.product_id).map((v) => (
                  <div key={v.id} className="flex justify-between items-center bg-white border border-border-custom rounded p-2 text-xs">
                    <div>
                      <span className="font-bold text-primary">{v.size_label}</span>
                      <span className="text-text-secondary ml-3">Stok: {v.stock}</span>
                      {v.price_override != null && (
                        <span className="text-accent font-mono ml-3 font-bold">Override: {formatIDR(v.price_override)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteVariant(v.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Variant Form */}
            <form onSubmit={handleAddVariantSubmit} className="space-y-4 border-t border-border-custom pt-4">
              <span className="text-[10px] uppercase font-mono font-black text-text-secondary tracking-widest block">Input Varian Baru:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Label Ukuran *</label>
                  <input
                    type="text"
                    required
                    value={variantForm.size_label}
                    onChange={(e) => setVariantForm({ ...variantForm, size_label: e.target.value })}
                    placeholder="e.g. Diameter 30cm (3 Susun)"
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Harga Override (Kosongkan jika sama)</label>
                  <input
                    type="number"
                    value={variantForm.price_override}
                    onChange={(e) => setVariantForm({ ...variantForm, price_override: e.target.value })}
                    placeholder="e.g. 415000"
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    required
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="var_act"
                    checked={variantForm.is_active}
                    onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="var_act" className="text-xs font-bold text-text-secondary">Varian Aktif</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                + Tambah Varian Ke Produk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* D. MULTIPLE IMAGES MANAGER MODAL */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-border-custom rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans text-base font-extrabold text-primary">Kelola Gambar Tambahan</h3>
              <button onClick={() => setActiveImageModal(null)} className="p-1 rounded-full hover:bg-surface">
                ✕
              </button>
            </div>

            {/* Existing pictures */}
            <div className="grid grid-cols-4 gap-3 mb-6 border border-border-custom rounded-lg p-3 bg-surface/30 max-h-44 overflow-y-auto">
              {productImages.filter((img) => img.product_id === extraImageForm.product_id).length === 0 ? (
                <p className="text-text-muted text-[11px] col-span-4 text-center py-4">Belum ada gambar sekunder.</p>
              ) : (
                productImages.filter((img) => img.product_id === extraImageForm.product_id).map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border-custom group bg-white">
                    <img src={img.image_url} alt="Extra" className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Input picture url */}
            <form onSubmit={handleAddImageSubmit} className="space-y-4 border-t border-border-custom pt-4">
              <span className="text-[10px] uppercase font-mono font-black text-text-secondary tracking-widest block font-bold">Input Gambar Sekunder Baru:</span>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">URL / File Gambar *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={extraImageForm.image_url}
                    onChange={(e) => setExtraImageForm({ ...extraImageForm, image_url: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                    placeholder="https://... atau upload file"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProductImageUpload(e, true)}
                    className="hidden"
                    id="extra-product-file-upload"
                    disabled={uploadingProduct}
                  />
                  <label
                    htmlFor="extra-product-file-upload"
                    className={`px-3 py-2 border rounded-md text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      uploadingProduct
                        ? "bg-surface text-text-muted border-border-custom animate-pulse"
                        : "border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {uploadingProduct ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Upload"
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Sort Order *</label>
                <input
                  type="number"
                  required
                  value={extraImageForm.sort_order}
                  onChange={(e) => setExtraImageForm({ ...extraImageForm, sort_order: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer animate-pulse"
              >
                + Tambah Gambar Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* E1. MANUAL SALES CREATE MODAL */}
      {activeSaleModal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-border-custom rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-sans text-base font-extrabold text-primary mb-4">Catat Transaksi Manual (Offline)</h3>

            <form onSubmit={handleSalesSubmit} className="space-y-4">
              
              {/* Customer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-border-custom pb-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Customer *</label>
                  <input
                    type="text"
                    required
                    value={salesForm.customer_name}
                    onChange={(e) => setSalesForm({ ...salesForm, customer_name: e.target.value })}
                    placeholder="e.g. Katering Bu Aminah"
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">No. HP / WhatsApp</label>
                  <input
                    type="tel"
                    value={salesForm.customer_phone}
                    onChange={(e) => setSalesForm({ ...salesForm, customer_phone: e.target.value })}
                    placeholder="e.g. 08129876543"
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Alamat Lengkap Kirim</label>
                  <textarea
                    rows={2}
                    value={salesForm.customer_address}
                    onChange={(e) => setSalesForm({ ...salesForm, customer_address: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-border-strong rounded-md text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* Line items section */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono font-bold text-text-secondary tracking-widest block">Baris Item Belanja:</span>
                
                {/* Lines picker bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-surface p-3 rounded-lg border border-border-custom">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Produk</label>
                    <select
                      value={tempLineItem.product_id}
                      onChange={(e) => {
                        const relVars = variants.filter((v) => v.product_id === e.target.value);
                        setTempLineItem({
                          product_id: e.target.value,
                          variant_id: relVars[0]?.id || "base",
                          quantity: 1,
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-border-strong rounded text-xs outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Varian Ukuran</label>
                    <select
                      value={tempLineItem.variant_id}
                      onChange={(e) => setTempLineItem({ ...tempLineItem, variant_id: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-border-strong rounded text-xs outline-none"
                    >
                      <option value="base">Ukuran Standar</option>
                      {variants.filter((v) => v.product_id === tempLineItem.product_id).map((v) => (
                        <option key={v.id} value={v.id}>{v.size_label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Qty</label>
                    <input
                      type="number"
                      value={tempLineItem.quantity}
                      onChange={(e) => setTempLineItem({ ...tempLineItem, quantity: Math.max(1, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-border-strong rounded text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="p-1.5 bg-primary text-white rounded text-xs w-full flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* List chosen lines */}
                <div className="space-y-1.5 bg-surface/20 rounded-lg p-3 border border-dashed border-border-custom max-h-36 overflow-y-auto">
                  {salesForm.items.length === 0 ? (
                    <p className="text-[11px] text-text-muted text-center py-4">Belum ada baris item produk ditambahkan.</p>
                  ) : (
                    salesForm.items.map((line, idx) => {
                      const prodName = products.find((p) => p.id === line.product_id)?.name || "";
                      const variLabel = line.variant_id ? variants.find((v) => v.id === line.variant_id)?.size_label : "Standar";
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 border border-border-custom rounded font-sans">
                          <div>
                            <span className="font-bold text-primary">{prodName}</span>
                            <span className="text-text-secondary ml-2 font-semibold">({variLabel})</span>
                            <span className="text-neutral-400 ml-3">Qty: {line.quantity}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold font-tabular text-primary">{formatIDR(line.price_at_sale * line.quantity)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-red-500 hover:text-red-600 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action and Total Summary */}
              <div className="flex gap-3 justify-end pt-5 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setActiveSaleModal(null)}
                  className="px-4 py-2 border border-border-strong rounded-md text-xs font-semibold hover:bg-surface"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                >
                  {formLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Simpan Transaksi Manual
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* E2. MANUAL SALES VIEW DETAILS MODAL */}
      {activeSaleModal === "view" && selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-border-custom rounded-xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-center border-b border-border-custom pb-3 mb-4">
              <h3 className="font-sans text-base font-extrabold text-primary">Detail Rincian Transaksi</h3>
              <button onClick={() => setActiveSaleModal(null)} className="p-1 rounded-full hover:bg-surface text-text-secondary">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-dashed border-border-custom pb-3">
                <div>
                  <span className="text-text-muted font-mono uppercase block text-[9px]">ID Transaksi:</span>
                  <span className="font-mono font-bold text-primary">{selectedSaleDetail.id}</span>
                </div>
                <div>
                  <span className="text-text-muted font-mono uppercase block text-[9px]">Tanggal Transaksi:</span>
                  <span className="font-mono font-bold text-primary">{new Date(selectedSaleDetail.created_at).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-text-muted font-mono uppercase block text-[9px]">Biodata Customer:</span>
                <p className="font-bold text-primary text-sm">{selectedSaleDetail.customer_name}</p>
                <p className="text-text-secondary font-mono">{selectedSaleDetail.customer_phone || "No HP: -"}</p>
                <p className="text-text-secondary leading-relaxed bg-surface p-2.5 rounded border border-border-custom">{selectedSaleDetail.customer_address || "Alamat Kirim: -"}</p>
              </div>

              <div className="space-y-2 border-t border-dashed border-border-custom pt-3">
                <span className="text-text-muted font-mono uppercase block text-[9px]">Produk Dibeli:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedSaleDetail.lines.map((line: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-surface/50 p-2.5 border border-border-custom rounded">
                      <div>
                        <p className="font-bold text-primary">{line.product_name}</p>
                        {line.variant_label && (
                          <span className="text-[10px] font-semibold text-text-secondary">Ukuran: {line.variant_label}</span>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-bold text-primary">{line.quantity} x {formatIDR(line.price_at_sale)}</p>
                        <p className="text-[10px] text-text-secondary font-bold font-tabular">{formatIDR(line.price_at_sale * line.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border-custom pt-4 mt-2">
                <span className="text-text-secondary font-bold">Total Pembayaran:</span>
                <span className="font-mono text-base font-extrabold text-primary font-tabular">
                  {formatIDR(selectedSaleDetail.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
