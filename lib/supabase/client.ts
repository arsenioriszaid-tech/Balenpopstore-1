import { createClient } from "@supabase/supabase-js";

// Helper to check if Supabase is fully configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof url !== "string" || typeof key !== "string") {
    return false;
  }

  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();

  if (trimmedUrl === "" || trimmedKey === "") {
    return false;
  }

  // Check for common placeholders
  const isPlaceholder = (str: string) => {
    const s = str.toLowerCase();
    return (
      s.includes("your_") ||
      s.includes("your-") ||
      s.includes("placeholder") ||
      s.includes("insert_") ||
      s.includes("example.com")
    );
  };

  if (isPlaceholder(trimmedUrl) || isPlaceholder(trimmedKey)) {
    return false;
  }

  if (!trimmedUrl.startsWith("https://")) {
    return false;
  }

  return true;
};

// ----------------------------------------------------------------
// SEED DATA FOR LOCAL STORAGE/MOCK DATABASE FALLBACK
// ----------------------------------------------------------------
const INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Klakat Stainless Kotak", slug: "klakat-stainless-kotak", created_at: "2026-07-01T00:00:00Z" },
  { id: "cat-2", name: "Klakat Stainless Bulat", slug: "klakat-stainless-bulat", created_at: "2026-07-01T00:00:00Z" },
  { id: "cat-3", name: "Peralatan Masak Stainless", slug: "peralatan-masak-stainless", created_at: "2026-07-01T00:00:00Z" },
];

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    category_id: "cat-1",
    name: "Klakat Stainless Kotak Premium (Piramida)",
    description: "Kukusan klakat kotak berkualitas tinggi berbahan Stainless Steel SUS 304 tebal anti karat. Sangat ideal untuk mengukus dimsum, siomay, bakpao, kue basah, dan jajanan pasar lainnya. Keunggulan utama ada pada desain tutup berbentuk piramida (segitiga lancip) sehingga uap air hasil kondensasi mengalir ke samping wadah dan tidak menetes merusak cita rasa maupun tekstur makanan.",
    price: 345000,
    image_url: "https://picsum.photos/seed/klakatkotak1/600/600",
    is_active: true,
    created_at: "2026-07-02T10:00:00Z",
  },
  {
    id: "prod-2",
    category_id: "cat-1",
    name: "Klakat Stainless Kotak Standar UMKM",
    description: "Kukusan klakat kotak stainless steel dengan ukuran ekonomis yang dirancang khusus untuk memenuhi kebutuhan wirausaha UMKM kuliner maupun katering rumahan. Konstruksi sambungan yang kokoh, sirkulasi uap optimal untuk pemanasan seragam, serta pembersihan yang sangat praktis setelah pemakaian.",
    price: 425000,
    image_url: "https://picsum.photos/seed/klakatkotak2/600/600",
    is_active: true,
    created_at: "2026-07-03T11:00:00Z",
  },
  {
    id: "prod-3",
    category_id: "cat-2",
    name: "Kukusan Bulat Stainless Steel 3 Susun",
    description: "Panci kukusan stainless bulat dengan konfigurasi 3 susun/tingkat. Menawarkan fleksibilitas tinggi bagi dapur rumah tangga modern maupun kedai makanan. Distribusi panas merata, menghemat penggunaan gas elpiji karena proses pematangan lebih efisien, dilengkapi tutup kaca temper tebal anti-panas.",
    price: 185000,
    image_url: "https://picsum.photos/seed/klakatbulat/600/600",
    is_active: true,
    created_at: "2026-07-04T12:00:00Z",
  },
  {
    id: "prod-4",
    category_id: "cat-3",
    name: "Panci Susu Stainless Steel Heavy Duty",
    description: "Panci susu serbaguna dengan gagang ergonomis tahan panas. Dibuat menggunakan material stainless steel kualitas prima food grade, sangat andal untuk mendidihkan air, memanaskan susu, membuat saus, hingga merebus mi instan dalam porsi personal.",
    price: 85000,
    image_url: "https://picsum.photos/seed/pancisu/600/600",
    is_active: true,
    created_at: "2026-07-05T09:00:00Z",
  }
];

const INITIAL_VARIANTS = [
  // Klakat Kotak Premium (prod-1)
  { id: "var-1-1", product_id: "prod-1", size_label: "30x30 cm (2 Tingkat)", price_override: 345000, stock: 15, is_active: true },
  { id: "var-1-2", product_id: "prod-1", size_label: "30x30 cm (3 Tingkat)", price_override: 415000, stock: 8, is_active: true },
  { id: "var-1-3", product_id: "prod-1", size_label: "35x35 cm (2 Tingkat)", price_override: 450000, stock: 5, is_active: true },
  
  // Klakat Kotak UMKM (prod-2)
  { id: "var-2-1", product_id: "prod-2", size_label: "35x35 cm (2 Tingkat)", price_override: 425000, stock: 12, is_active: true },
  { id: "var-2-2", product_id: "prod-2", size_label: "35x35 cm (3 Tingkat)", price_override: 495000, stock: 4, is_active: true },
  { id: "var-2-3", product_id: "prod-2", size_label: "40x40 cm (3 Tingkat)", price_override: 580000, stock: 3, is_active: true },

  // Kukusan Bulat (prod-3)
  { id: "var-3-1", product_id: "prod-3", size_label: "Diameter 26 cm", price_override: 185000, stock: 25, is_active: true },
  { id: "var-3-2", product_id: "prod-3", size_label: "Diameter 30 cm", price_override: 235000, stock: 18, is_active: true },

  // Panci Susu (prod-4)
  { id: "var-4-1", product_id: "prod-4", size_label: "Diameter 16 cm", price_override: null, stock: 30, is_active: true },
  { id: "var-4-2", product_id: "prod-4", size_label: "Diameter 18 cm", price_override: 110000, stock: 15, is_active: true },
];

const INITIAL_IMAGES = [
  { id: "img-1-1", product_id: "prod-1", image_url: "https://picsum.photos/seed/klakatdetail1/600/600", sort_order: 1 },
  { id: "img-1-2", product_id: "prod-1", image_url: "https://picsum.photos/seed/klakatdetail2/600/600", sort_order: 2 },
  { id: "img-2-1", product_id: "prod-2", image_url: "https://picsum.photos/seed/umkmdetail1/600/600", sort_order: 1 },
  { id: "img-3-1", product_id: "prod-3", image_url: "https://picsum.photos/seed/bulatdetail1/600/600", sort_order: 1 },
];

const INITIAL_SALES = [
  { id: "sale-1", customer_name: "Ibu Hajah Aminah", customer_phone: "081298765432", customer_address: "Katering Selera Nusantara, Jl. Mangga Besar No. 45, Jakarta Barat", status: "completed", total_amount: 415000, created_at: "2026-07-10T08:30:00Z" },
  { id: "sale-2", customer_name: "Pak Budi Dimsum", customer_phone: "085712345678", customer_address: "Kios Pujasera Gading, Kelapa Gading Blok C4, Jakarta Utara", status: "completed", total_amount: 850000, created_at: "2026-07-12T13:45:00Z" },
  { id: "sale-3", customer_name: "Resto Dapur Rasa", customer_phone: "081344556677", customer_address: "Ruko Golden Boulevard Sektor 2 No. 10, BSD City, Tangerang", status: "completed", total_amount: 295000, created_at: "2026-07-14T11:20:00Z" },
];

const INITIAL_SALE_ITEMS = [
  { id: "item-1", sale_id: "sale-1", product_id: "prod-1", variant_id: "var-1-2", quantity: 1, price_at_sale: 415000, created_at: "2026-07-10T08:30:00Z" },
  { id: "item-2", sale_id: "sale-2", product_id: "prod-2", variant_id: "var-2-1", quantity: 2, price_at_sale: 425000, created_at: "2026-07-12T13:45:00Z" },
  { id: "item-3", sale_id: "sale-3", product_id: "prod-4", variant_id: "var-4-2", quantity: 1, price_at_sale: 110000, created_at: "2026-07-14T11:20:00Z" },
  { id: "item-4", sale_id: "sale-3", product_id: "prod-3", variant_id: "var-3-1", quantity: 1, price_at_sale: 185000, created_at: "2026-07-14T11:20:00Z" },
];

// In-memory fallback database for Server-Side Rendering
let serverMemoryDb = {
  categories: [...INITIAL_CATEGORIES],
  products: [...INITIAL_PRODUCTS],
  product_variants: [...INITIAL_VARIANTS],
  product_images: [...INITIAL_IMAGES],
  sales: [...INITIAL_SALES],
  sale_items: [...INITIAL_SALE_ITEMS],
};

// Client-side local storage initializer
const getClientDb = () => {
  if (typeof window === "undefined") {
    return serverMemoryDb;
  }
  const loadKey = (key: string, defaultValue: any) => {
    const stored = localStorage.getItem(`balenpop_${key}`);
    if (!stored) {
      localStorage.setItem(`balenpop_${key}`, JSON.stringify(defaultValue));
      return defaultValue;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultValue;
    }
  };

  return {
    categories: loadKey("categories", INITIAL_CATEGORIES),
    products: loadKey("products", INITIAL_PRODUCTS),
    product_variants: loadKey("product_variants", INITIAL_VARIANTS),
    product_images: loadKey("product_images", INITIAL_IMAGES),
    sales: loadKey("sales", INITIAL_SALES),
    sale_items: loadKey("sale_items", INITIAL_SALE_ITEMS),
  };
};

const saveClientDb = (db: any) => {
  if (typeof window === "undefined") {
    serverMemoryDb = db;
    return;
  }
  Object.keys(db).forEach((key) => {
    localStorage.setItem(`balenpop_${key}`, JSON.stringify(db[key]));
  });
};

// ----------------------------------------------------------------
// HIGH-FIDELITY MOCK QUERY BUILDER
// Simulates the Supabase JavaScript API (from, select, insert, etc.)
// ----------------------------------------------------------------
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private limitCount?: number;
  private selectColumns: string = "*";

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*") {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => item[column] === value);
    return this;
  }

  filter(column: string, operator: string, value: any) {
    if (operator === "eq") {
      this.filters.push((item: any) => item[column] === value);
    }
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async then(resolve: any) {
    const db = getClientDb();
    const table = (db as any)[this.tableName] || [];
    let data = [...table];

    // Apply filters
    for (const filterFn of this.filters) {
      data = data.filter(filterFn);
    }

    // Sort operations (default descending by date or id)
    if (this.tableName === "sales") {
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (this.tableName === "products" || this.tableName === "categories") {
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Apply limit
    if (this.limitCount !== undefined) {
      data = data.slice(0, this.limitCount);
    }

    resolve({ data, error: null });
  }

  async insert(records: any | any[]) {
    const db = getClientDb();
    const table = (db as any)[this.tableName] || [];
    const newRecords = Array.isArray(records) ? records : [records];
    
    const prepared = newRecords.map((rec) => ({
      id: rec.id || Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      ...rec,
    }));

    (db as any)[this.tableName] = [...table, ...prepared];
    saveClientDb(db);

    return { data: prepared, error: null };
  }

  async update(updates: any) {
    const db = getClientDb();
    const table = (db as any)[this.tableName] || [];
    
    let updatedRows: any[] = [];
    const newTable = table.map((row: any) => {
      // If matches filters
      let match = true;
      for (const filterFn of this.filters) {
        if (!filterFn(row)) {
          match = false;
          break;
        }
      }
      if (match) {
        const merged = { ...row, ...updates };
        updatedRows.push(merged);
        return merged;
      }
      return row;
    });

    (db as any)[this.tableName] = newTable;
    saveClientDb(db);

    return { data: updatedRows, error: null };
  }

  async delete() {
    const db = getClientDb();
    const table = (db as any)[this.tableName] || [];
    
    let deletedRows: any[] = [];
    const newTable = table.filter((row: any) => {
      let match = true;
      for (const filterFn of this.filters) {
        if (!filterFn(row)) {
          match = false;
          break;
        }
      }
      if (match) {
        deletedRows.push(row);
        return false; // exclude
      }
      return true; // keep
    });

    (db as any)[this.tableName] = newTable;
    saveClientDb(db);

    return { data: deletedRows, error: null };
  }
}

// ----------------------------------------------------------------
// REAL OR MOCK CLIENT INSTANTIATION
// ----------------------------------------------------------------
const realSupabaseInstance = isSupabaseConfigured()
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

// Wrap real Supabase with helper to intercept auth for demo admin user
const wrapSupabaseWithDemoFallback = (real: any) => {
  if (!real) return null;

  const demoAuth = {
    getUser: async (jwt?: string) => {
      if (typeof window !== "undefined" && localStorage.getItem("balenpop_admin_logged_in") === "true") {
        return {
          data: {
            user: {
              id: "admin-user-id",
              email: "admin@balenpopstore.com",
              user_metadata: { full_name: "Owner Balenpop" },
            },
          },
          error: null,
        };
      }
      try {
        return await real.auth.getUser(jwt);
      } catch (e) {
        return { data: { user: null }, error: null };
      }
    },
    getSession: async () => {
      if (typeof window !== "undefined" && localStorage.getItem("balenpop_admin_logged_in") === "true") {
        return {
          data: {
            session: {
              user: {
                id: "admin-user-id",
                email: "admin@balenpopstore.com",
              },
            },
          },
          error: null,
        };
      }
      try {
        return await real.auth.getSession();
      } catch (e) {
        return { data: { session: null }, error: null };
      }
    },
    signInWithPassword: async (credentials: any) => {
      if (credentials?.email === "admin@balenpopstore.com" && credentials?.password === "admin123") {
        if (typeof window !== "undefined") {
          localStorage.setItem("balenpop_admin_logged_in", "true");
        }
        return {
          data: {
            user: { id: "admin-user-id", email: credentials.email },
          },
          error: null,
        };
      }
      return real.auth.signInWithPassword(credentials);
    },
    signOut: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("balenpop_admin_logged_in");
      }
      return real.auth.signOut();
    },
  };

  // Use a Proxy to delegate all calls to the real Supabase instance,
  // except for the auth property which uses our demoAuth wrapper
  return new Proxy(real, {
    get(target, prop) {
      if (prop === "auth") {
        return { ...target.auth, ...demoAuth };
      }
      const value = target[prop];
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });
};

const realSupabase = wrapSupabaseWithDemoFallback(realSupabaseInstance);

// Wrap client to inject mock operations if live Supabase is not available
export const supabase = realSupabase || {
  auth: {
    getUser: async () => {
      if (typeof window !== "undefined") {
        const adminLoggedIn = localStorage.getItem("balenpop_admin_logged_in") === "true";
        if (adminLoggedIn) {
          return {
            data: {
              user: {
                id: "admin-user-id",
                email: "admin@balenpopstore.com",
                user_metadata: { full_name: "Owner Balenpop" },
              },
            },
            error: null,
          };
        }
      }
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
      if (typeof window !== "undefined") {
        const adminLoggedIn = localStorage.getItem("balenpop_admin_logged_in") === "true";
        if (adminLoggedIn) {
          return {
            data: {
              session: {
                user: {
                  id: "admin-user-id",
                  email: "admin@balenpopstore.com",
                },
              },
            },
            error: null,
          };
        }
      }
      return { data: { session: null }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      if (email === "admin@balenpopstore.com" && password === "admin123") {
        if (typeof window !== "undefined") {
          localStorage.setItem("balenpop_admin_logged_in", "true");
        }
        return {
          data: {
            user: { id: "admin-user-id", email },
          },
          error: null,
        };
      }
      return {
        data: { user: null },
        error: { message: "Email atau password salah! (Gunakan admin@balenpopstore.com dan admin123)" },
      };
    },
    signOut: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("balenpop_admin_logged_in");
      }
      return { error: null };
    },
  },
  from: (tableName: string) => {
    return new MockQueryBuilder(tableName);
  },
  storage: {
    from: (bucketName: string) => ({
      upload: async (path: string, file: File) => {
        // Simulates file upload, return a random picsum URL for mock images
        const mockUrl = `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/600/600`;
        return { data: { path, fullPath: mockUrl, url: mockUrl }, error: null };
      },
      getPublicUrl: (path: string) => {
        // If the path itself is a URL (as mock returns above)
        if (path.startsWith("http")) {
          return { data: { publicUrl: path } };
        }
        return { data: { publicUrl: `https://picsum.photos/seed/${path}/600/600` } };
      },
    }),
  },
} as any;
