-- ==========================================
-- BALENPOPSTORE ADDITIONAL SCHEMA & POLICIES
-- ==========================================
-- This script adds the missing tables required by the BalenpopStore PRD (v1.1)
-- to run alongside the existing `categories` and `products` tables.

-- 1. Product Variants (PRD §9.3/§11)
-- Handles size-based options, prices, and stock counts.
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  size_label text NOT NULL, -- e.g., "Diameter 30cm", "3 Tingkat - 26cm"
  price_override numeric, -- NULL if using base products.price, otherwise custom price
  stock integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- 2. Product Multiple Images (PRD §9.3)
-- Allows product listings to have multi-image carousels/galleries.
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- 3. Sales Tracker (PRD §10.5/§11)
-- Stores transactions logged manually by the administrator.
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text,
  customer_address text,
  status text NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'cancelled'
  total_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT sales_pkey PRIMARY KEY (id)
);

-- 4. Sale Items (PRD §11)
-- Relates specific products and variants to a manual sale transaction.
CREATE TABLE IF NOT EXISTS public.sale_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  product_id uuid NOT NULL,
  variant_id uuid, -- NULLable if the product has no variant selected
  quantity integer NOT NULL DEFAULT 1,
  price_at_sale numeric NOT NULL, -- captures actual historical price
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT sale_items_pkey PRIMARY KEY (id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE,
  CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT sale_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL
);

-- 5. Admin Profiles (PRD §11)
-- Connects Supabase Auth users to roles to authorize dashboard management.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'admin', -- 'admin', 'staff'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anonymous users (Storefront Customers) can READ categories, products, variants, and images
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_images" ON public.product_images FOR SELECT USING (true);

-- Authenticated Admin users have full CRUD access over catalog metadata
CREATE POLICY "Allow admin full access on categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access on products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access on product_variants" ON public.product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access on product_images" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sales & Sale Items are sensitive administrative data. ONLY authenticated admins can read/write them.
CREATE POLICY "Allow admin full access on sales" ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access on sale_items" ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Allow admin read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow admin manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
