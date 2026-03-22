"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  ADMIN_STATUS_LABELS: () => ADMIN_STATUS_LABELS,
  BRANCHES: () => BRANCHES,
  CATEGORIES: () => CATEGORIES,
  CLIENT_STATUS_LABELS: () => CLIENT_STATUS_LABELS,
  ORDER_STATUS_MAP: () => ORDER_STATUS_MAP,
  PAYMENT_METHOD_LABELS: () => PAYMENT_METHOD_LABELS,
  insertOrderSchema: () => insertOrderSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  ordersTable: () => ordersTable,
  productsTable: () => productsTable,
  reviewsTable: () => reviewsTable,
  settingsTable: () => settingsTable,
  syncLogsTable: () => syncLogsTable,
  usersTable: () => usersTable,
  wishlistTable: () => wishlistTable
});
var import_zod, import_pg_core, usersTable, productsTable, ordersTable, wishlistTable, reviewsTable, settingsTable, syncLogsTable, insertUserSchema, loginSchema, insertOrderSchema, insertReviewSchema, BRANCHES, ORDER_STATUS_MAP, CLIENT_STATUS_LABELS, ADMIN_STATUS_LABELS, PAYMENT_METHOD_LABELS, CATEGORIES;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_zod = require("zod");
    import_pg_core = require("drizzle-orm/pg-core");
    usersTable = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.text)("id").primaryKey(),
      name: (0, import_pg_core.text)("name").notNull(),
      email: (0, import_pg_core.text)("email").notNull().unique(),
      password: (0, import_pg_core.text)("password").notNull(),
      phone: (0, import_pg_core.text)("phone").notNull(),
      whatsapp: (0, import_pg_core.text)("whatsapp").default(""),
      city: (0, import_pg_core.text)("city").notNull(),
      address: (0, import_pg_core.text)("address").default(""),
      branch: (0, import_pg_core.text)("branch").notNull(),
      role: (0, import_pg_core.text)("role").notNull().default("customer"),
      createdAt: (0, import_pg_core.text)("created_at").notNull()
    });
    productsTable = (0, import_pg_core.pgTable)("products", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.text)("name").notNull(),
      slug: (0, import_pg_core.text)("slug").notNull().unique(),
      category: (0, import_pg_core.text)("category").notNull(),
      description: (0, import_pg_core.text)("description").notNull().default(""),
      basePrice: (0, import_pg_core.real)("base_price").notNull(),
      weight: (0, import_pg_core.real)("weight").notNull(),
      totalPriceUsd: (0, import_pg_core.real)("total_price_usd").notNull(),
      image: (0, import_pg_core.text)("image").notNull(),
      images: (0, import_pg_core.jsonb)("images").$type().default([]),
      rating: (0, import_pg_core.real)("rating").default(0),
      reviews: (0, import_pg_core.integer)("reviews").default(0),
      badge: (0, import_pg_core.text)("badge").default(""),
      specs: (0, import_pg_core.jsonb)("specs").$type().default({}),
      isActive: (0, import_pg_core.boolean)("is_active").default(true),
      isManual: (0, import_pg_core.boolean)("is_manual").default(false),
      amazonAsin: (0, import_pg_core.text)("amazon_asin").default(""),
      oldPrice: (0, import_pg_core.real)("old_price"),
      descriptionEs: (0, import_pg_core.text)("description_es").default(""),
      featuresEs: (0, import_pg_core.jsonb)("features_es").$type().default([]),
      createdAt: (0, import_pg_core.text)("created_at").notNull()
    });
    ordersTable = (0, import_pg_core.pgTable)("orders", {
      id: (0, import_pg_core.text)("id").primaryKey(),
      userId: (0, import_pg_core.text)("user_id").notNull(),
      orderNumber: (0, import_pg_core.text)("order_number").notNull().unique(),
      items: (0, import_pg_core.jsonb)("items").$type().notNull(),
      subtotalUsd: (0, import_pg_core.real)("subtotal_usd").notNull(),
      shippingUsd: (0, import_pg_core.real)("shipping_usd").notNull(),
      totalUsd: (0, import_pg_core.real)("total_usd").notNull(),
      totalBs: (0, import_pg_core.real)("total_bs").notNull(),
      paymentMethod: (0, import_pg_core.text)("payment_method").notNull(),
      paymentProof: (0, import_pg_core.text)("payment_proof").default(""),
      status: (0, import_pg_core.text)("status").notNull().default("pending_payment"),
      branch: (0, import_pg_core.text)("branch").notNull(),
      deliveryType: (0, import_pg_core.text)("delivery_type").notNull(),
      deliveryAddress: (0, import_pg_core.text)("delivery_address").default(""),
      estimatedDelivery: (0, import_pg_core.text)("estimated_delivery").notNull(),
      amazonCartUrl: (0, import_pg_core.text)("amazon_cart_url").default(""),
      amazonOrderIds: (0, import_pg_core.jsonb)("amazon_order_ids").$type().default([]),
      amazonPurchaseStatus: (0, import_pg_core.text)("amazon_purchase_status").default(""),
      // '' | 'cart_ready' | 'purchased' | 'partially_purchased' | 'issue'
      amazonPurchaseNotes: (0, import_pg_core.text)("amazon_purchase_notes").default(""),
      amazonCostUsd: (0, import_pg_core.real)("amazon_cost_usd").default(0),
      profitUsd: (0, import_pg_core.real)("profit_usd").default(0),
      notes: (0, import_pg_core.text)("notes").default(""),
      createdAt: (0, import_pg_core.text)("created_at").notNull()
    });
    wishlistTable = (0, import_pg_core.pgTable)("wishlist", {
      id: (0, import_pg_core.text)("id").primaryKey(),
      userId: (0, import_pg_core.text)("user_id").notNull(),
      productId: (0, import_pg_core.integer)("product_id").notNull()
    });
    reviewsTable = (0, import_pg_core.pgTable)("reviews", {
      id: (0, import_pg_core.text)("id").primaryKey(),
      userId: (0, import_pg_core.text)("user_id").notNull(),
      userName: (0, import_pg_core.text)("user_name").notNull(),
      productId: (0, import_pg_core.integer)("product_id").notNull(),
      orderId: (0, import_pg_core.text)("order_id").default(""),
      rating: (0, import_pg_core.integer)("rating").notNull(),
      comment: (0, import_pg_core.text)("comment").notNull(),
      createdAt: (0, import_pg_core.text)("created_at").notNull()
    });
    settingsTable = (0, import_pg_core.pgTable)("settings", {
      key: (0, import_pg_core.text)("key").primaryKey(),
      value: (0, import_pg_core.text)("value").notNull()
    });
    syncLogsTable = (0, import_pg_core.pgTable)("sync_logs", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      type: (0, import_pg_core.text)("type").notNull(),
      // 'price_sync' | 'translation' | 'availability'
      startedAt: (0, import_pg_core.text)("started_at").notNull(),
      completedAt: (0, import_pg_core.text)("completed_at"),
      totalProducts: (0, import_pg_core.integer)("total_products").default(0),
      updated: (0, import_pg_core.integer)("updated").default(0),
      deactivated: (0, import_pg_core.integer)("deactivated").default(0),
      reactivated: (0, import_pg_core.integer)("reactivated").default(0),
      priceAlerts: (0, import_pg_core.integer)("price_alerts").default(0),
      errors: (0, import_pg_core.integer)("errors").default(0),
      status: (0, import_pg_core.text)("status").notNull().default("running"),
      // 'running' | 'completed' | 'failed'
      details: (0, import_pg_core.jsonb)("details").$type().default({})
    });
    insertUserSchema = import_zod.z.object({
      name: import_zod.z.string().min(2, "Nombre requerido"),
      email: import_zod.z.string().email("Email inv\xE1lido"),
      password: import_zod.z.string().min(6, "M\xEDnimo 6 caracteres"),
      phone: import_zod.z.string().min(7, "Tel\xE9fono requerido"),
      whatsapp: import_zod.z.string().optional().default(""),
      city: import_zod.z.string().min(2, "Ciudad requerida"),
      address: import_zod.z.string().optional().default(""),
      branch: import_zod.z.string().min(1, "Sucursal requerida")
    });
    loginSchema = import_zod.z.object({
      email: import_zod.z.string().email("Email inv\xE1lido"),
      password: import_zod.z.string().min(1, "Contrase\xF1a requerida")
    });
    insertOrderSchema = import_zod.z.object({
      items: import_zod.z.array(import_zod.z.object({
        productId: import_zod.z.number(),
        name: import_zod.z.string(),
        image: import_zod.z.string(),
        quantity: import_zod.z.number().min(1).max(5),
        priceUsd: import_zod.z.number(),
        weight: import_zod.z.number(),
        amazonAsin: import_zod.z.string()
      })),
      paymentMethod: import_zod.z.enum(["zelle", "binance", "bank_vzla"]),
      branch: import_zod.z.string(),
      deliveryType: import_zod.z.enum(["pickup", "delivery"]),
      deliveryAddress: import_zod.z.string().optional().default(""),
      notes: import_zod.z.string().optional().default("")
    });
    insertReviewSchema = import_zod.z.object({
      productId: import_zod.z.number(),
      orderId: import_zod.z.string().optional().default(""),
      rating: import_zod.z.number().min(1).max(5),
      comment: import_zod.z.string().min(3, "Escribe un comentario")
    });
    BRANCHES = ["Caracas", "Barquisimeto", "Valencia", "Maracay"];
    ORDER_STATUS_MAP = {
      pending_payment: "pending_payment",
      payment_verified: "payment_confirmed",
      buying_amazon: "in_preparation",
      en_route_miami: "in_preparation",
      in_warehouse: "in_preparation",
      in_air: "in_transit",
      in_venezuela: "in_transit",
      at_branch: "ready_pickup",
      delivered: "delivered"
    };
    CLIENT_STATUS_LABELS = {
      pending_payment: "Pago pendiente",
      payment_confirmed: "Pago confirmado",
      in_preparation: "En preparaci\xF3n",
      in_transit: "En camino",
      ready_pickup: "Listo para retiro",
      delivered: "Entregado"
    };
    ADMIN_STATUS_LABELS = {
      pending_payment: "Pendiente de pago",
      payment_verified: "Pago verificado",
      buying_amazon: "Comprando en USA",
      en_route_miami: "En camino a bodega",
      in_warehouse: "En warehouse (2BC)",
      in_air: "En a\xE9reo",
      in_venezuela: "En Venezuela",
      at_branch: "En sucursal",
      delivered: "Entregado"
    };
    PAYMENT_METHOD_LABELS = {
      zelle: "Zelle",
      binance: "Binance (USDT)",
      bank_vzla: "Transferencia/Pago M\xF3vil"
    };
    CATEGORIES = [
      { id: "tech", name: "Tecnolog\xEDa", icon: "\u{1F4BB}" },
      { id: "phones", name: "Tel\xE9fonos", icon: "\u{1F4F1}" },
      { id: "gaming", name: "Gaming", icon: "\u{1F3AE}" },
      { id: "beauty", name: "Belleza y Cuidado Personal", icon: "\u{1F484}" },
      { id: "shoes", name: "Calzado", icon: "\u{1F45F}" },
      { id: "clothing", name: "Ropa y Moda", icon: "\u{1F455}" },
      { id: "home", name: "Hogar y Cocina", icon: "\u{1F3E0}" },
      { id: "health", name: "Salud y Bienestar", icon: "\u{1F48A}" },
      { id: "baby", name: "Beb\xE9s y Ni\xF1os", icon: "\u{1F476}" },
      { id: "sports", name: "Deportes y Fitness", icon: "\u{1F3CB}\uFE0F" },
      { id: "pets", name: "Mascotas", icon: "\u{1F415}" },
      { id: "food", name: "Comestibles y Snacks", icon: "\u{1F34E}" },
      { id: "auto", name: "Autos y Herramientas", icon: "\u{1F527}" },
      { id: "toys", name: "Juguetes", icon: "\u{1F9F8}" },
      { id: "office", name: "Oficina y Escolar", icon: "\u{1F4DA}" }
    ];
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  getDb: () => getDb,
  getPool: () => getPool
});
function getDb() {
  if (!db && process.env.DATABASE_URL) {
    pool = new import_pg.Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
  return db;
}
function getPool() {
  return pool;
}
var import_pg, import_node_postgres, db, pool;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_pg = require("pg");
    import_node_postgres = require("drizzle-orm/node-postgres");
    init_schema();
    db = null;
    pool = null;
  }
});

// vite.config.ts
function missingAssetPlugin() {
  const virtualPrefix = "\0missing-asset:";
  return {
    name: "missing-asset-fallback",
    enforce: "pre",
    resolveId(source, importer) {
      if (/\.(png|jpg|jpeg|gif|webp)/.test(source) && importer) {
        const dir = import_path2.default.dirname(importer);
        let resolved = source;
        if (source.startsWith("@assets")) {
          resolved = source.replace("@assets", import_path2.default.resolve(import_meta.dirname, "attached_assets"));
        } else if (!import_path2.default.isAbsolute(source)) {
          resolved = import_path2.default.resolve(dir, source);
        }
        if (!import_fs2.default.existsSync(resolved)) {
          return virtualPrefix + source;
        }
      }
      return null;
    },
    load(id) {
      if (id.startsWith(virtualPrefix)) {
        return `export default "${PLACEHOLDER_SVG}";`;
      }
      return null;
    }
  };
}
var import_vite, import_plugin_react, import_path2, import_fs2, import_meta, PLACEHOLDER_SVG, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    import_vite = require("vite");
    import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
    import_path2 = __toESM(require("path"), 1);
    import_fs2 = __toESM(require("fs"), 1);
    import_meta = {};
    PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='60'%3E%3Crect width='200' height='60' fill='%231a1a2e' rx='8'/%3E%3Ctext x='100' y='38' font-family='Arial' font-size='24' font-weight='bold' fill='%23e94560' text-anchor='middle'%3ECopikonUSA%3C/text%3E%3C/svg%3E";
    vite_config_default = (0, import_vite.defineConfig)({
      plugins: [missingAssetPlugin(), (0, import_plugin_react.default)()],
      resolve: {
        alias: {
          "@": import_path2.default.resolve(import_meta.dirname, "client", "src"),
          "@shared": import_path2.default.resolve(import_meta.dirname, "shared"),
          "@assets": import_path2.default.resolve(import_meta.dirname, "attached_assets")
        }
      },
      root: import_path2.default.resolve(import_meta.dirname, "client"),
      base: "./",
      build: {
        outDir: import_path2.default.resolve(import_meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: false,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
async function setupVite(server, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await (0, import_vite2.createServer)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path3.default.resolve(
        import_meta2.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await import_fs3.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${(0, import_nanoid.nanoid)()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var import_vite2, import_fs3, import_path3, import_nanoid, import_meta2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    import_vite2 = require("vite");
    init_vite_config();
    import_fs3 = __toESM(require("fs"), 1);
    import_path3 = __toESM(require("path"), 1);
    import_nanoid = require("nanoid");
    import_meta2 = {};
    viteLogger = (0, import_vite2.createLogger)();
  }
});

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);
var import_express2 = __toESM(require("express"), 1);

// server/storage.ts
var import_crypto2 = require("crypto");

// server/products-data.json
var products_data_default = [
  {
    id: 1,
    name: "Apple MacBook Air M3 15\u2033",
    slug: "apple-macbook-air-m3-15",
    category: "tech",
    description: "Laptop ultraliviana con chip M3, pantalla Liquid Retina de 15 pulgadas y hasta 18 horas de bater\xEDa.",
    basePrice: 1099,
    weight: 3.5,
    totalPriceUsd: 1283.1,
    image: "https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 3241,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 2,
    name: "Apple AirPods Pro 2da Gen USB-C",
    slug: "apple-airpods-pro-2da-gen-usb-c",
    category: "tech",
    description: "Aud\xEDfonos con cancelaci\xF3n activa de ruido, audio adaptivo y estuche con carga USB-C.",
    basePrice: 189.99,
    weight: 0.5,
    totalPriceUsd: 221.24,
    image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 45821,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 291.33,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 3,
    name: "Samsung Galaxy Tab S9 FE 10.9\u2033",
    slug: "samsung-galaxy-tab-s9-fe-10-9",
    category: "tech",
    description: "Tablet Android con pantalla AMOLED, S Pen incluido y resistencia al agua IP68.",
    basePrice: 349.99,
    weight: 1.2,
    totalPriceUsd: 409.09,
    image: "https://m.media-amazon.com/images/I/81qykiHbp-L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81qykiHbp-L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 2100,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 545.49,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 4,
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5-wireless-headphones",
    category: "tech",
    description: "Los mejores aud\xEDfonos over-ear con cancelaci\xF3n de ruido l\xEDder en la industria.",
    basePrice: 278,
    weight: 0.6,
    totalPriceUsd: 323,
    image: "https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 8760,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 386.7,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 5,
    name: "Apple Watch Series 10 GPS 42mm",
    slug: "apple-watch-series-10-gps-42mm",
    category: "tech",
    description: "Reloj inteligente con la pantalla m\xE1s grande jam\xE1s vista en un Apple Watch.",
    basePrice: 349,
    weight: 0.3,
    totalPriceUsd: 403,
    image: "https://m.media-amazon.com/images/I/61-LnxFcmEL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61-LnxFcmEL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 1520,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 425.2,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 6,
    name: "Logitech MX Master 3S Mouse",
    slug: "logitech-mx-master-3s-mouse",
    category: "tech",
    description: "Mouse inal\xE1mbrico premium con scroll electromagn\xE9tico y seguimiento en cualquier superficie.",
    basePrice: 89.99,
    weight: 0.4,
    totalPriceUsd: 105.69,
    image: "https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 12300,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 115.76,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 8,
    name: "JBL Charge 5 Bocina Bluetooth",
    slug: "jbl-charge-5-bocina-bluetooth",
    category: "tech",
    description: "Bocina port\xE1til con sonido potente, IP67 resistente al agua y 20 horas de bater\xEDa.",
    basePrice: 139.95,
    weight: 1.7,
    totalPriceUsd: 170.29,
    image: "https://m.media-amazon.com/images/I/71BWsiGRpRL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71BWsiGRpRL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 28700,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 196.59,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 45,
    name: "Kindle Paperwhite 16GB 2024",
    slug: "kindle-paperwhite-16gb-2024",
    category: "tech",
    description: "E-reader con pantalla de 7\u2033",
    basePrice: 149.99,
    weight: 0.5,
    totalPriceUsd: 175.24,
    image: "https://m.media-amazon.com/images/I/61Iz2MQN6pL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61Iz2MQN6pL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 34200,
    badge: "Popular",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 46,
    name: "Apple AirTag 4 Pack",
    slug: "apple-airtag-4-pack",
    category: "tech",
    description: "Localizador de precisi\xF3n. Encuentra tus llaves, cartera o equipaje con la red Find My.",
    basePrice: 79.99,
    weight: 0.2,
    totalPriceUsd: 93.09,
    image: "https://m.media-amazon.com/images/I/51IhKEPjfyL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/51IhKEPjfyL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 89200,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 47,
    name: "Bose SoundLink Flex Bluetooth",
    slug: "bose-soundlink-flex-bluetooth",
    category: "tech",
    description: "Bocina port\xE1til ultraresistente con sonido profundo y claro, IP67.",
    basePrice: 119,
    weight: 1.3,
    totalPriceUsd: 144,
    image: "https://m.media-amazon.com/images/I/71RdoeXJBzL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71RdoeXJBzL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 18400,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 48,
    name: "Samsung Galaxy Buds3 Pro",
    slug: "samsung-galaxy-buds3-pro",
    category: "tech",
    description: "Aud\xEDfonos con ANC inteligente, audio 360 y dise\xF1o ergon\xF3mico premium.",
    basePrice: 179.99,
    weight: 0.3,
    totalPriceUsd: 208.64,
    image: "https://m.media-amazon.com/images/I/71ZUGT0Y+ML._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71ZUGT0Y+ML._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 5600,
    badge: "Nuevo",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 49,
    name: "DJI Mini 4 Pro Drone",
    slug: "dji-mini-4-pro-drone",
    category: "tech",
    description: "Drone ultracompacto con c\xE1mara 4K HDR, detecci\xF3n omnidireccional de obst\xE1culos.",
    basePrice: 759,
    weight: 0.8,
    totalPriceUsd: 877.25,
    image: "https://m.media-amazon.com/images/I/61GSgjFzQML._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61GSgjFzQML._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 3200,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 1163.26,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 50,
    name: "GoPro HERO13 Black",
    slug: "gopro-hero13-black",
    category: "tech",
    description: "C\xE1mara de acci\xF3n con video 5.3K, estabilizaci\xF3n HyperSmooth 7 y GPS integrado.",
    basePrice: 349.99,
    weight: 0.6,
    totalPriceUsd: 405.79,
    image: "https://m.media-amazon.com/images/I/71wZLH6cvBL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71wZLH6cvBL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 7800,
    badge: "Nuevo",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 51,
    name: "Anker PowerCore 20000mAh",
    slug: "anker-powercore-20000mah",
    category: "tech",
    description: "Bater\xEDa port\xE1til de alta capacidad con carga r\xE1pida USB-C y doble puerto.",
    basePrice: 39.99,
    weight: 0.9,
    totalPriceUsd: 50.94,
    image: "https://m.media-amazon.com/images/I/71mPfKB3CpL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71mPfKB3CpL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 142e3,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 52,
    name: "Marshall Stanmore II Bluetooth",
    slug: "marshall-stanmore-ii-bluetooth",
    category: "tech",
    description: "Bocina con el ic\xF3nico dise\xF1o Marshall, sonido envolvente y conectividad m\xFAltiple.",
    basePrice: 279.99,
    weight: 4.9,
    totalPriceUsd: 348.94,
    image: "https://m.media-amazon.com/images/I/61Fko1vjNjL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61Fko1vjNjL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 8900,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Env\u00EDo: "A\xE9reo a Venezuela",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 406.34,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 9,
    name: "Apple iPhone 16 128GB",
    slug: "apple-iphone-16-128gb",
    category: "phones",
    description: "El iPhone m\xE1s avanzado con chip A18, c\xE1mara de 48MP y Dynamic Island.",
    basePrice: 799,
    weight: 0.4,
    totalPriceUsd: 921.05,
    image: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 5200,
    badge: "Nuevo",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 10,
    name: "Samsung Galaxy S25 Ultra 256GB",
    slug: "samsung-galaxy-s25-ultra-256gb",
    category: "phones",
    description: "Smartphone premium con S Pen, c\xE1mara de 200MP y pantalla AMOLED de 6.8\u2033",
    basePrice: 1199.99,
    weight: 0.5,
    totalPriceUsd: 1382.74,
    image: "https://m.media-amazon.com/images/I/71O7BR9YqDL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71O7BR9YqDL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 3100,
    badge: "Nuevo",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 11,
    name: "Apple iPhone 16 Pro Max 256GB",
    slug: "apple-iphone-16-pro-max-256gb",
    category: "phones",
    description: "El iPhone m\xE1s potente con chip A18 Pro, titanio y c\xE1mara de 48MP con zoom 5x.",
    basePrice: 1199,
    weight: 0.5,
    totalPriceUsd: 1381.6,
    image: "https://m.media-amazon.com/images/I/61lBFPMVr7L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61lBFPMVr7L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 8400,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 1564.81,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 12,
    name: "Samsung Galaxy Z Flip 6 256GB",
    slug: "samsung-galaxy-z-flip-6-256gb",
    category: "phones",
    description: "Smartphone plegable con pantalla FlexWindow y c\xE1mara mejorada de 50MP.",
    basePrice: 899.99,
    weight: 0.4,
    totalPriceUsd: 1037.19,
    image: "https://m.media-amazon.com/images/I/61J6s1tkwpL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61J6s1tkwpL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 1800,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 1390.67,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 53,
    name: "Google Pixel 9 128GB",
    slug: "google-pixel-9-128gb",
    category: "phones",
    description: "Smartphone con la mejor c\xE1mara IA y 7 a\xF1os de actualizaciones garantizadas.",
    basePrice: 699,
    weight: 0.4,
    totalPriceUsd: 806.05,
    image: "https://m.media-amazon.com/images/I/71ZoB-YDEOL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71ZoB-YDEOL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 4200,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 847.22,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 54,
    name: "OnePlus 12 256GB",
    slug: "oneplus-12-256gb",
    category: "phones",
    description: "Flagship killer con pantalla 2K, carga de 100W y c\xE1mara Hasselblad.",
    basePrice: 699.99,
    weight: 0.5,
    totalPriceUsd: 807.74,
    image: "https://m.media-amazon.com/images/I/61r1JQ+GKUL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61r1JQ+GKUL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 2800,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 862.45,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 55,
    name: "Apple iPhone SE 4ta Gen 128GB",
    slug: "apple-iphone-se-4ta-gen-128gb",
    category: "phones",
    description: "iPhone accesible con chip A16 y dise\xF1o moderno tipo iPhone 14.",
    basePrice: 429,
    weight: 0.4,
    totalPriceUsd: 495.55,
    image: "https://m.media-amazon.com/images/I/61tyKQYYmEL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61tyKQYYmEL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 1200,
    badge: "Nuevo",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 56,
    name: "Samsung Galaxy A55 5G 128GB",
    slug: "samsung-galaxy-a55-5g-128gb",
    category: "phones",
    description: "Smartphone gama media con pantalla Super AMOLED y resistencia IP67.",
    basePrice: 329.99,
    weight: 0.4,
    totalPriceUsd: 381.69,
    image: "https://m.media-amazon.com/images/I/71eCV4MDQYL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71eCV4MDQYL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 6800,
    badge: "Popular",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 57,
    name: "Protector Pantalla iPhone 16 (3 Pack)",
    slug: "protector-pantalla-iphone-16-3-pack",
    category: "phones",
    description: "Vidrio templado 9H con instalaci\xF3n f\xE1cil, anti-huellas y cobertura completa.",
    basePrice: 12.99,
    weight: 0.2,
    totalPriceUsd: 16.04,
    image: "https://m.media-amazon.com/images/I/71nBIpLw0TL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71nBIpLw0TL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 34500,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 19.23,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 58,
    name: "Funda OtterBox Defender iPhone 16 Pro",
    slug: "funda-otterbox-defender-iphone-16-pro",
    category: "phones",
    description: "La funda m\xE1s resistente del mercado con protecci\xF3n multicapa certificada.",
    basePrice: 49.99,
    weight: 0.3,
    totalPriceUsd: 59.14,
    image: "https://m.media-amazon.com/images/I/71RjnN03dAL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71RjnN03dAL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 22100,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Red: "Desbloqueado",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 78.37,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 13,
    name: "PlayStation 5 Slim Disc Console",
    slug: "playstation-5-slim-disc-console",
    category: "gaming",
    description: "La consola m\xE1s popular con SSD ultrarr\xE1pido, ray tracing y miles de juegos.",
    basePrice: 449.99,
    weight: 8,
    totalPriceUsd: 561.49,
    image: "https://m.media-amazon.com/images/I/51QTmFOJfNL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/51QTmFOJfNL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 14200,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 14,
    name: "Xbox Series X 1TB",
    slug: "xbox-series-x-1tb",
    category: "gaming",
    description: "La Xbox m\xE1s potente con 12 teraflops, 4K nativo y Game Pass.",
    basePrice: 449.99,
    weight: 9.8,
    totalPriceUsd: 571.39,
    image: "https://m.media-amazon.com/images/I/61-jjE67uqL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61-jjE67uqL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 9800,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 699.86,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 15,
    name: "Nintendo Switch OLED Model",
    slug: "nintendo-switch-oled-model",
    category: "gaming",
    description: "Consola h\xEDbrida con pantalla OLED de 7\u2033",
    basePrice: 329,
    weight: 1.8,
    totalPriceUsd: 388.25,
    image: "https://m.media-amazon.com/images/I/61nqNujSF1L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61nqNujSF1L._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 22400,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 426.91,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 16,
    name: "PlayStation DualSense Controller",
    slug: "playstation-dualsense-controller",
    category: "gaming",
    description: "Control inal\xE1mbrico con gatillos adaptativos y retroalimentaci\xF3n h\xE1ptica.",
    basePrice: 69.99,
    weight: 0.8,
    totalPriceUsd: 84.89,
    image: "https://m.media-amazon.com/images/I/61myEBQOKQL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61myEBQOKQL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 41200,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 17,
    name: "Razer BlackShark V2 X Gaming Headset",
    slug: "razer-blackshark-v2-x-gaming-headset",
    category: "gaming",
    description: "Headset gaming ligero con sonido espacial 7.1 y micr\xF3fono cardioide.",
    basePrice: 39.99,
    weight: 0.7,
    totalPriceUsd: 49.84,
    image: "https://m.media-amazon.com/images/I/61CGnG2a8hL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61CGnG2a8hL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 18300,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 59.58,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 59,
    name: "Meta Quest 3 128GB",
    slug: "meta-quest-3-128gb",
    category: "gaming",
    description: "Visor de realidad mixta con passthrough a color y rendimiento mejorado.",
    basePrice: 499.99,
    weight: 1.2,
    totalPriceUsd: 581.59,
    image: "https://m.media-amazon.com/images/I/61EB+YMDVwL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61EB+YMDVwL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 12400,
    badge: "Popular",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 60,
    name: "Steam Deck OLED 512GB",
    slug: "steam-deck-oled-512gb",
    category: "gaming",
    description: "PC gaming port\xE1til con pantalla OLED HDR y acceso a toda tu biblioteca Steam.",
    basePrice: 549,
    weight: 1.7,
    totalPriceUsd: 640.7,
    image: "https://m.media-amazon.com/images/I/71xyNBO7OqL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71xyNBO7OqL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 8900,
    badge: "Nuevo",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 61,
    name: "God of War Ragnar\xF6k PS5",
    slug: "god-of-war-ragnarok-ps5",
    category: "gaming",
    description: "\xC9pica aventura de Kratos y Atreus por los nueve reinos n\xF3rdicos.",
    basePrice: 39.99,
    weight: 0.3,
    totalPriceUsd: 47.64,
    image: "https://m.media-amazon.com/images/I/81B4O1YXCSL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81B4O1YXCSL._AC_SL1500_.jpg"
    ],
    rating: 4.9,
    reviews: 28400,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 62.68,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 62,
    name: "Marvel's Spider-Man 2 PS5",
    slug: "marvel-s-spider-man-2-ps5",
    category: "gaming",
    description: "S\xE9 Peter Parker y Miles Morales en esta aventura por Nueva York.",
    basePrice: 49.99,
    weight: 0.3,
    totalPriceUsd: 59.14,
    image: "https://m.media-amazon.com/images/I/81a0x92JUHL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81a0x92JUHL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 19800,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 69.44,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 63,
    name: "Razer DeathAdder V3 Gaming Mouse",
    slug: "razer-deathadder-v3-gaming-mouse",
    category: "gaming",
    description: "Mouse gaming ultraliviano con sensor Focus Pro 30K de m\xE1xima precisi\xF3n.",
    basePrice: 69.99,
    weight: 0.3,
    totalPriceUsd: 82.14,
    image: "https://m.media-amazon.com/images/I/61lJr8-L8BL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61lJr8-L8BL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 14600,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 89.43,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 64,
    name: "Razer Huntsman Mini 60% Teclado",
    slug: "razer-huntsman-mini-60-teclado",
    category: "gaming",
    description: "Teclado gaming compacto 60% con switches \xF3pticos y RGB Chroma.",
    basePrice: 79.99,
    weight: 0.8,
    totalPriceUsd: 96.39,
    image: "https://m.media-amazon.com/images/I/61OVY4u3DRL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61OVY4u3DRL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 9200,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 65,
    name: "Silla Gaming Secretlab Titan Evo",
    slug: "silla-gaming-secretlab-titan-evo",
    category: "gaming",
    description: "Silla gaming premium con soporte lumbar ajustable y materiales de primera.",
    basePrice: 449,
    weight: 65,
    totalPriceUsd: 873.85,
    image: "https://m.media-amazon.com/images/I/71bXpXNaAOL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71bXpXNaAOL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 6800,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 942.19,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 66,
    name: "Xbox Game Pass Ultimate 3 Meses",
    slug: "xbox-game-pass-ultimate-3-meses",
    category: "gaming",
    description: "Acceso a cientos de juegos en Xbox y PC + EA Play y Xbox Live Gold.",
    basePrice: 44.99,
    weight: 0.1,
    totalPriceUsd: 52.29,
    image: "https://m.media-amazon.com/images/I/71Ppm+xAJZL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Ppm+xAJZL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 52e3,
    badge: "",
    specs: {
      Garant\u00EDa: "1 a\xF1o",
      Plataforma: "Multi",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 56.4,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 18,
    name: "Dyson Airwrap Multi-Styler Complete",
    slug: "dyson-airwrap-multi-styler-complete",
    category: "beauty",
    description: "Estilizador multiusos con tecnolog\xEDa Coanda para rizar, alisar y secar.",
    basePrice: 479.99,
    weight: 2.5,
    totalPriceUsd: 565.74,
    image: "https://m.media-amazon.com/images/I/61eIQb2a6YL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61eIQb2a6YL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 7600,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 601.57,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 19,
    name: "CeraVe Moisturizing Cream 19oz",
    slug: "cerave-moisturizing-cream-19oz",
    category: "beauty",
    description: "Crema hidratante con ceramidas y \xE1cido hialur\xF3nico, recomendada por dermat\xF3logos.",
    basePrice: 17.39,
    weight: 1.3,
    totalPriceUsd: 27.15,
    image: "https://m.media-amazon.com/images/I/61S7BrCBj7L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61S7BrCBj7L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 98200,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 20,
    name: "Revlon One-Step Hair Dryer & Volumizer",
    slug: "revlon-one-step-hair-dryer-volumizer",
    category: "beauty",
    description: "Secador y voluminizador en un solo paso, reduce el frizz y da brillo.",
    basePrice: 34.99,
    weight: 1.6,
    totalPriceUsd: 49.04,
    image: "https://m.media-amazon.com/images/I/71D9e3NRPhL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71D9e3NRPhL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 315e3,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 21,
    name: "Maybelline Lash Sensational Mascara",
    slug: "maybelline-lash-sensational-mascara",
    category: "beauty",
    description: "M\xE1scara que atrapa hasta las pesta\xF1as m\xE1s peque\xF1as con efecto abanico.",
    basePrice: 9.97,
    weight: 0.2,
    totalPriceUsd: 12.57,
    image: "https://m.media-amazon.com/images/I/61Y9QTfzIoL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61Y9QTfzIoL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 84500,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 67,
    name: "MAC Matte Lipstick - Ruby Woo",
    slug: "mac-matte-lipstick-ruby-woo",
    category: "beauty",
    description: "El labial rojo ic\xF3nico de MAC, acabado matte intenso y larga duraci\xF3n.",
    basePrice: 23,
    weight: 0.2,
    totalPriceUsd: 27.55,
    image: "https://m.media-amazon.com/images/I/71oYV1FafkL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71oYV1FafkL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 42800,
    badge: "Popular",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 68,
    name: "NYX Professional Setting Spray Matte",
    slug: "nyx-professional-setting-spray-matte",
    category: "beauty",
    description: "Spray fijador de maquillaje con acabado matte que dura todo el d\xEDa.",
    basePrice: 8.99,
    weight: 0.5,
    totalPriceUsd: 13.09,
    image: "https://m.media-amazon.com/images/I/71Ywjf8t6yL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Ywjf8t6yL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 67300,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 69,
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    slug: "the-ordinary-niacinamide-10-zinc-1",
    category: "beauty",
    description: "S\xE9rum para reducir poros y marcas, f\xF3rmula vegana y libre de crueldad.",
    basePrice: 6.5,
    weight: 0.2,
    totalPriceUsd: 8.57,
    image: "https://m.media-amazon.com/images/I/61z50jmb3jL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61z50jmb3jL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 128e3,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 70,
    name: "Olaplex No.7 Bonding Oil 30ml",
    slug: "olaplex-no-7-bonding-oil-30ml",
    category: "beauty",
    description: "Aceite reparador ultraligero que protege y da brillo sin engrasar.",
    basePrice: 28,
    weight: 0.2,
    totalPriceUsd: 33.3,
    image: "https://m.media-amazon.com/images/I/71VVbCvP5LL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71VVbCvP5LL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 15600,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 38.1,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 71,
    name: "Neutrogena Ultra Sheer SPF 70",
    slug: "neutrogena-ultra-sheer-spf-70",
    category: "beauty",
    description: "Protector solar de amplio espectro, textura ligera y no grasa.",
    basePrice: 12.97,
    weight: 0.5,
    totalPriceUsd: 17.67,
    image: "https://m.media-amazon.com/images/I/71e5RBIU4bL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71e5RBIU4bL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 54200,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 19.43,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 72,
    name: "L'Or\xE9al Excellence Creme Hair Color",
    slug: "l-oreal-excellence-creme-hair-color",
    category: "beauty",
    description: "Tinte permanente con triple protecci\xF3n y cobertura 100% de canas.",
    basePrice: 10.97,
    weight: 0.6,
    totalPriceUsd: 15.92,
    image: "https://m.media-amazon.com/images/I/71IIBX6KDLL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71IIBX6KDLL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 38700,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 21.24,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 73,
    name: "BaBylissPRO Nano Titanium Flat Iron 1\u2033",
    slug: "babylisspro-nano-titanium-flat-iron-1",
    category: "beauty",
    description: "Plancha de titanio con calentamiento ultrarr\xE1pido y temperatura regulable.",
    basePrice: 69.99,
    weight: 0.8,
    totalPriceUsd: 84.89,
    image: "https://m.media-amazon.com/images/I/71Gc0+RuoYL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Gc0+RuoYL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 28400,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 106.75,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 74,
    name: "Bioderma Sensibio H2O Micellar Water 500ml",
    slug: "bioderma-sensibio-h2o-micellar-water-500ml",
    category: "beauty",
    description: "Agua micelar original para piel sensible, limpia y desmaquilla sin irritar.",
    basePrice: 14.99,
    weight: 1.2,
    totalPriceUsd: 23.84,
    image: "https://m.media-amazon.com/images/I/61bqbDl1GmL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61bqbDl1GmL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 72100,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 31.89,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 75,
    name: "Dove Body Wash Deep Moisture 22oz",
    slug: "dove-body-wash-deep-moisture-22oz",
    category: "beauty",
    description: "Gel de ducha hidratante con NutriumMoisture para piel suave por 24 horas.",
    basePrice: 7.49,
    weight: 1.5,
    totalPriceUsd: 16.86,
    image: "https://m.media-amazon.com/images/I/61JcQxu8E8L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61JcQxu8E8L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 11e4,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 20.73,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 22,
    name: "Nike Air Max 270 \u2014 Hombre",
    slug: "nike-air-max-270-hombre",
    category: "shoes",
    description: "Zapatillas con la unidad Air m\xE1s grande de Nike para m\xE1xima amortiguaci\xF3n.",
    basePrice: 159.99,
    weight: 1.5,
    totalPriceUsd: 192.24,
    image: "https://m.media-amazon.com/images/I/71GSZPJTU2L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71GSZPJTU2L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 18700,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 23,
    name: "Adidas Ultraboost 23 \u2014 Hombre",
    slug: "adidas-ultraboost-23-hombre",
    category: "shoes",
    description: "Zapatillas de running con retorno de energ\xEDa Boost y ajuste Primeknit.",
    basePrice: 119,
    weight: 1.4,
    totalPriceUsd: 144.55,
    image: "https://m.media-amazon.com/images/I/71rQmP+HBjL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71rQmP+HBjL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 5400,
    badge: "Oferta",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 160.81,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 24,
    name: "New Balance 574 Classic \u2014 Unisex",
    slug: "new-balance-574-classic-unisex",
    category: "shoes",
    description: "El cl\xE1sico de New Balance que combina estilo retro con comodidad moderna.",
    basePrice: 89.99,
    weight: 1.3,
    totalPriceUsd: 110.64,
    image: "https://m.media-amazon.com/images/I/61xQNKgtnLL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61xQNKgtnLL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 28900,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 25,
    name: "Nike Air Force 1 '07 \u2014 Hombre",
    slug: "nike-air-force-1-07-hombre",
    category: "shoes",
    description: "El \xEDcono del streetwear con amortiguaci\xF3n Air y piel premium.",
    basePrice: 114.99,
    weight: 1.6,
    totalPriceUsd: 141.04,
    image: "https://m.media-amazon.com/images/I/71WiGMpDOcL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71WiGMpDOcL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 42100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 184.43,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 26,
    name: "Crocs Classic Clog \u2014 Unisex",
    slug: "crocs-classic-clog-unisex",
    category: "shoes",
    description: "El clog original ultraliviano y c\xF3modo con Croslite y ventilaci\xF3n.",
    basePrice: 34.99,
    weight: 0.5,
    totalPriceUsd: 42.99,
    image: "https://m.media-amazon.com/images/I/71sL2JCU+6L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71sL2JCU+6L._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 521e3,
    badge: "Oferta",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 51.72,
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 76,
    name: "Converse Chuck Taylor All Star",
    slug: "converse-chuck-taylor-all-star",
    category: "shoes",
    description: "El cl\xE1sico eterno de lona, perfecto para cualquier estilo.",
    basePrice: 55,
    weight: 1.2,
    totalPriceUsd: 69.85,
    image: "https://m.media-amazon.com/images/I/81LhGv3LHWL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81LhGv3LHWL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 186e3,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.468Z"
  },
  {
    id: 77,
    name: "Puma RS-X Reinvention",
    slug: "puma-rs-x-reinvention",
    category: "shoes",
    description: "Zapatillas chunky retro-futuristas con tecnolog\xEDa RS de amortiguaci\xF3n.",
    basePrice: 89.99,
    weight: 1.4,
    totalPriceUsd: 111.19,
    image: "https://m.media-amazon.com/images/I/71SCXT5X2kL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71SCXT5X2kL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 8700,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 149.14,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 78,
    name: "ASICS Gel-Kayano 31",
    slug: "asics-gel-kayano-31",
    category: "shoes",
    description: "Zapatilla premium de estabilidad con gel FF Blast+ y soporte 4D.",
    basePrice: 159.95,
    weight: 1.5,
    totalPriceUsd: 192.19,
    image: "https://m.media-amazon.com/images/I/71kJRKlB5YL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71kJRKlB5YL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 4200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 79,
    name: "Vans Old Skool \u2014 Unisex",
    slug: "vans-old-skool-unisex",
    category: "shoes",
    description: "El cl\xE1sico de Vans con la ic\xF3nica franja lateral y suela waffle.",
    basePrice: 69.99,
    weight: 1.2,
    totalPriceUsd: 87.09,
    image: "https://m.media-amazon.com/images/I/61oy59tnM0L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61oy59tnM0L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 94300,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 100.31,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 81,
    name: "UGG Classic Mini II \u2014 Mujer",
    slug: "ugg-classic-mini-ii-mujer",
    category: "shoes",
    description: "Bota corta de piel de oveja genuina, c\xE1lida y acogedora.",
    basePrice: 149.99,
    weight: 1.8,
    totalPriceUsd: 182.39,
    image: "https://m.media-amazon.com/images/I/71dC5DvqkvL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71dC5DvqkvL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 47800,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 222.72,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 82,
    name: "Skechers Go Walk 7 \u2014 Unisex",
    slug: "skechers-go-walk-7-unisex",
    category: "shoes",
    description: "Zapatillas ultralivianas con Hyper Pillar para caminar todo el d\xEDa.",
    basePrice: 69.99,
    weight: 0.9,
    totalPriceUsd: 85.44,
    image: "https://m.media-amazon.com/images/I/71V5sNsK6+L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71V5sNsK6+L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 62100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 111.73,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 83,
    name: "Timberland 6\u2033",
    slug: "timberland-6",
    category: "shoes",
    description: "La bota ic\xF3nica resistente al agua con piel nubuck premium.",
    basePrice: 198,
    weight: 3.5,
    totalPriceUsd: 246.95,
    image: "https://m.media-amazon.com/images/I/81ZT5KLhJfL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81ZT5KLhJfL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 38900,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 299.36,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 84,
    name: "Levi's 501 Original Fit Jeans \u2014 Hombre",
    slug: "levi-s-501-original-fit-jeans-hombre",
    category: "clothing",
    description: "El jean original desde 1873, corte recto cl\xE1sico que nunca pasa de moda.",
    basePrice: 49.98,
    weight: 1.8,
    totalPriceUsd: 67.38,
    image: "https://m.media-amazon.com/images/I/51v3P9QJHLL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/51v3P9QJHLL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 89400,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 85,
    name: "Calvin Klein Cotton Stretch Boxer 3-Pack",
    slug: "calvin-klein-cotton-stretch-boxer-3-pack",
    category: "clothing",
    description: "Pack de 3 boxers de algod\xF3n con elastano para m\xE1xima comodidad.",
    basePrice: 29.5,
    weight: 0.5,
    totalPriceUsd: 36.67,
    image: "https://m.media-amazon.com/images/I/71GhbN+YOML._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71GhbN+YOML._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 67200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 44.29,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 86,
    name: "Champion Reverse Weave Hoodie",
    slug: "champion-reverse-weave-hoodie",
    category: "clothing",
    description: "Sudadera con capucha ic\xF3nica con tejido Reverse Weave anti-encogimiento.",
    basePrice: 55,
    weight: 1.5,
    totalPriceUsd: 71.5,
    image: "https://m.media-amazon.com/images/I/71bBR-R4CQL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71bBR-R4CQL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 34100,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 87,
    name: "Columbia Omni-Heat Jacket \u2014 Hombre",
    slug: "columbia-omni-heat-jacket-hombre",
    category: "clothing",
    description: "Chaqueta t\xE9rmica con tecnolog\xEDa Omni-Heat reflectante para el fr\xEDo.",
    basePrice: 89.99,
    weight: 2,
    totalPriceUsd: 114.49,
    image: "https://m.media-amazon.com/images/I/71GNMI7j7gL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71GNMI7j7gL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 12400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 134.4,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 88,
    name: "Hanes EcoSmart T-Shirt 6 Pack",
    slug: "hanes-ecosmart-t-shirt-6-pack",
    category: "clothing",
    description: "Pack de 6 camisetas b\xE1sicas de algod\xF3n suave, perfectas para el d\xEDa a d\xEDa.",
    basePrice: 21,
    weight: 1.5,
    totalPriceUsd: 32.4,
    image: "https://m.media-amazon.com/images/I/71-FG2E6nHL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71-FG2E6nHL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 142e3,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 41.45,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 89,
    name: "Under Armour Tech 2.0 Shorts \u2014 Hombre",
    slug: "under-armour-tech-2-0-shorts-hombre",
    category: "clothing",
    description: "Shorts deportivos ultraligeros con tecnolog\xEDa anti-olor y secado r\xE1pido.",
    basePrice: 24.99,
    weight: 0.4,
    totalPriceUsd: 30.94,
    image: "https://m.media-amazon.com/images/I/71L1RG04yPL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71L1RG04yPL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 45600,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 41.54,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 90,
    name: "Tommy Hilfiger Classic Polo \u2014 Hombre",
    slug: "tommy-hilfiger-classic-polo-hombre",
    category: "clothing",
    description: "Polo cl\xE1sico de Tommy con fit regular y la ic\xF3nica bandera bordada.",
    basePrice: 49.5,
    weight: 0.5,
    totalPriceUsd: 59.67,
    image: "https://m.media-amazon.com/images/I/81-2dBcq6+L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81-2dBcq6+L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 28700,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 76.77,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 91,
    name: "Ralph Lauren Classic Cap",
    slug: "ralph-lauren-classic-cap",
    category: "clothing",
    description: "Gorra cl\xE1sica con el ic\xF3nico pony bordado, ajustable para todos.",
    basePrice: 44.99,
    weight: 0.3,
    totalPriceUsd: 53.39,
    image: "https://m.media-amazon.com/images/I/71tBLFnx7RL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71tBLFnx7RL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 52300,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 92,
    name: "Carhartt Acrylic Watch Hat Beanie",
    slug: "carhartt-acrylic-watch-hat-beanie",
    category: "clothing",
    description: "El gorro Carhartt m\xE1s vendido del mundo, c\xE1lido y duradero.",
    basePrice: 17.99,
    weight: 0.2,
    totalPriceUsd: 21.79,
    image: "https://m.media-amazon.com/images/I/71b3j9LJIML._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71b3j9LJIML._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 198e3,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 93,
    name: "Nike Sportswear Club Joggers \u2014 Hombre",
    slug: "nike-sportswear-club-joggers-hombre",
    category: "clothing",
    description: "Joggers de fleece cepillado con corte c\xF3nico moderno y bolsillos.",
    basePrice: 49.99,
    weight: 0.8,
    totalPriceUsd: 61.89,
    image: "https://m.media-amazon.com/images/I/71e7OXx+JHL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71e7OXx+JHL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 72400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 94,
    name: "Adidas Essentials 3-Stripes Track Jacket",
    slug: "adidas-essentials-3-stripes-track-jacket",
    category: "clothing",
    description: "Chaqueta track cl\xE1sica de Adidas con las 3 rayas ic\xF3nicas.",
    basePrice: 45,
    weight: 0.7,
    totalPriceUsd: 55.6,
    image: "https://m.media-amazon.com/images/I/61Gy-qLQ0tL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61Gy-qLQ0tL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 38200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 72.29,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 95,
    name: "Ray-Ban Aviator Classic RB3025",
    slug: "ray-ban-aviator-classic-rb3025",
    category: "clothing",
    description: "Los lentes aviador m\xE1s ic\xF3nicos del mundo con cristal G-15.",
    basePrice: 163,
    weight: 0.3,
    totalPriceUsd: 189.1,
    image: "https://m.media-amazon.com/images/I/71sSCJWpXdL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71sSCJWpXdL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 64100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Material: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 240.87,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 27,
    name: "Instant Pot Duo 7-in-1 6Qt",
    slug: "instant-pot-duo-7-in-1-6qt",
    category: "home",
    description: "Olla multifunci\xF3n: presi\xF3n, cocci\xF3n lenta, arroz, vapor, saut\xE9 y m\xE1s.",
    basePrice: 79.99,
    weight: 12,
    totalPriceUsd: 157.99,
    image: "https://m.media-amazon.com/images/I/71V1LiDZJCL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71V1LiDZJCL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 172e3,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 28,
    name: "Dyson V15 Detect Aspiradora",
    slug: "dyson-v15-detect-aspiradora",
    category: "home",
    description: "Aspiradora inal\xE1mbrica con l\xE1ser que revela polvo microsc\xF3pico.",
    basePrice: 549.99,
    weight: 6.8,
    totalPriceUsd: 669.89,
    image: "https://m.media-amazon.com/images/I/61nzPMNY7zL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61nzPMNY7zL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 4200,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 826.91,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 29,
    name: "iRobot Roomba j7+ Robot Aspiradora",
    slug: "irobot-roomba-j7-robot-aspiradora",
    category: "home",
    description: "Robot inteligente que evita obst\xE1culos y se vac\xEDa solo.",
    basePrice: 399,
    weight: 7.5,
    totalPriceUsd: 500.1,
    image: "https://m.media-amazon.com/images/I/61K7wMifBBL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61K7wMifBBL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 8100,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 30,
    name: "Ninja Creami Ice Cream Maker NC301",
    slug: "ninja-creami-ice-cream-maker-nc301",
    category: "home",
    description: "Haz helados, sorbetes, batidos y m\xE1s desde ingredientes congelados.",
    basePrice: 149.99,
    weight: 11,
    totalPriceUsd: 232.99,
    image: "https://m.media-amazon.com/images/I/71bXpXNaAOL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71bXpXNaAOL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 38400,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 31,
    name: "Keurig K-Supreme Coffee Maker",
    slug: "keurig-k-supreme-coffee-maker",
    category: "home",
    description: "Cafetera de c\xE1psulas con tecnolog\xEDa MultiStream para caf\xE9 m\xE1s intenso.",
    basePrice: 99.99,
    weight: 8.2,
    totalPriceUsd: 160.09,
    image: "https://m.media-amazon.com/images/I/61IMR6AUVOL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61IMR6AUVOL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 21300,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 180.65,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 96,
    name: "Cosori Air Fryer Pro 5.8Qt",
    slug: "cosori-air-fryer-pro-5-8qt",
    category: "home",
    description: "Freidora de aire con 11 funciones, pantalla t\xE1ctil y cesta antiadherente.",
    basePrice: 99.99,
    weight: 10,
    totalPriceUsd: 169.99,
    image: "https://m.media-amazon.com/images/I/71kB+xNnXeL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71kB+xNnXeL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 89400,
    badge: "Popular",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 97,
    name: "Vitamix E310 Explorian Blender",
    slug: "vitamix-e310-explorian-blender",
    category: "home",
    description: "Licuadora profesional con motor potente para sopas, batidos y m\xE1s.",
    basePrice: 289.95,
    weight: 10.5,
    totalPriceUsd: 391.19,
    image: "https://m.media-amazon.com/images/I/81A2p4v7N4L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81A2p4v7N4L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 14200,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 510.45,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 98,
    name: "Amazon Echo Dot 5ta Gen con Alexa",
    slug: "amazon-echo-dot-5ta-gen-con-alexa",
    category: "home",
    description: "Altavoz inteligente compacto con Alexa, sonido mejorado y sensor de temperatura.",
    basePrice: 29.99,
    weight: 0.7,
    totalPriceUsd: 38.34,
    image: "https://m.media-amazon.com/images/I/51CkaHdGSeL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/51CkaHdGSeL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 312e3,
    badge: "Oferta",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 48.86,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 99,
    name: "Ring Video Doorbell 4",
    slug: "ring-video-doorbell-4",
    category: "home",
    description: "Timbre inteligente con video 1080p, detecci\xF3n de movimiento y audio bidireccional.",
    basePrice: 199.99,
    weight: 0.6,
    totalPriceUsd: 233.29,
    image: "https://m.media-amazon.com/images/I/71pRpi5fB1L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71pRpi5fB1L._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 48700,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 293.27,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 100,
    name: "Etekcity Digital Kitchen Scale",
    slug: "etekcity-digital-kitchen-scale",
    category: "home",
    description: "B\xE1scula de cocina de precisi\xF3n con pantalla LCD retroiluminada.",
    basePrice: 11.99,
    weight: 0.8,
    totalPriceUsd: 18.19,
    image: "https://m.media-amazon.com/images/I/71PoVxm5JpL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71PoVxm5JpL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 167e3,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 20.86,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 101,
    name: "Cuisinart DBM-8 Supreme Grind Coffee Mill",
    slug: "cuisinart-dbm-8-supreme-grind-coffee-mill",
    category: "home",
    description: "Molinillo de caf\xE9 con 18 niveles de molienda para caf\xE9 perfecto.",
    basePrice: 49.95,
    weight: 2.5,
    totalPriceUsd: 71.19,
    image: "https://m.media-amazon.com/images/I/71gPYxBQ0eL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71gPYxBQ0eL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 18900,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 81.68,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 102,
    name: "Le Creuset Enameled Dutch Oven 5.5Qt",
    slug: "le-creuset-enameled-dutch-oven-5-5qt",
    category: "home",
    description: "La olla de hierro esmaltado m\xE1s prestigiosa del mundo, hecha en Francia.",
    basePrice: 369.95,
    weight: 12,
    totalPriceUsd: 491.44,
    image: "https://m.media-amazon.com/images/I/71e+RgLJRZL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71e+RgLJRZL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 8400,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 103,
    name: "TP-Link Kasa Smart Plug 4-Pack",
    slug: "tp-link-kasa-smart-plug-4-pack",
    category: "home",
    description: "Enchufes inteligentes WiFi para controlar aparatos con voz o app.",
    basePrice: 26.99,
    weight: 0.5,
    totalPriceUsd: 33.79,
    image: "https://m.media-amazon.com/images/I/61oq-u6L7oL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61oq-u6L7oL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 142e3,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Uso: "Hogar"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 45.1,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 32,
    name: "Optimum Nutrition Gold Standard Whey 5lbs",
    slug: "optimum-nutrition-gold-standard-whey-5lbs",
    category: "health",
    description: "La prote\xEDna whey m\xE1s vendida del mundo con 24g de prote\xEDna por servicio.",
    basePrice: 62.99,
    weight: 5.4,
    totalPriceUsd: 102.14,
    image: "https://m.media-amazon.com/images/I/71ky7YNrcML._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71ky7YNrcML._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 102e3,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 33,
    name: "Nature Made Multivitamin 300 Tablets",
    slug: "nature-made-multivitamin-300-tablets",
    category: "health",
    description: "Multivitam\xEDnico completo con vitaminas y minerales esenciales.",
    basePrice: 15.99,
    weight: 0.8,
    totalPriceUsd: 22.79,
    image: "https://m.media-amazon.com/images/I/71Rd-c+B0jL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Rd-c+B0jL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 47800,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 34,
    name: "Fitbit Charge 6 Fitness Tracker",
    slug: "fitbit-charge-6-fitness-tracker",
    category: "health",
    description: "Pulsera fitness con GPS, ritmo card\xEDaco y m\xE1s de 40 modos de ejercicio.",
    basePrice: 119.95,
    weight: 0.3,
    totalPriceUsd: 139.59,
    image: "https://m.media-amazon.com/images/I/71TZcnvE8jL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71TZcnvE8jL._AC_SL1500_.jpg"
    ],
    rating: 4.2,
    reviews: 6700,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 161.24,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 104,
    name: "Creatine Monohydrate 5g - 300g",
    slug: "creatine-monohydrate-5g-300g",
    category: "health",
    description: "Creatina monohidratada micronizada para fuerza y rendimiento muscular.",
    basePrice: 24.99,
    weight: 0.8,
    totalPriceUsd: 33.14,
    image: "https://m.media-amazon.com/images/I/71hSmbAvE0L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71hSmbAvE0L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 68400,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 105,
    name: "Nature Made Fish Oil Omega-3 200 Softgels",
    slug: "nature-made-fish-oil-omega-3-200-softgels",
    category: "health",
    description: "Aceite de pescado purificado con 1200mg EPA+DHA para salud cardiovascular.",
    basePrice: 14.49,
    weight: 0.7,
    totalPriceUsd: 20.51,
    image: "https://m.media-amazon.com/images/I/71dESw-6ILL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71dESw-6ILL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 84200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 25.6,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 106,
    name: "NatureWise Vitamin D3 5000 IU 360 Softgels",
    slug: "naturewise-vitamin-d3-5000-iu-360-softgels",
    category: "health",
    description: "Vitamina D3 de alta potencia para huesos, inmunidad y estado de \xE1nimo.",
    basePrice: 14.26,
    weight: 0.4,
    totalPriceUsd: 18.6,
    image: "https://m.media-amazon.com/images/I/71KkkGJqGQL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71KkkGJqGQL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 92100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 22.99,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 107,
    name: "Vital Proteins Collagen Peptides 20oz",
    slug: "vital-proteins-collagen-peptides-20oz",
    category: "health",
    description: "P\xE9ptidos de col\xE1geno para piel, cabello, u\xF1as y articulaciones.",
    basePrice: 27,
    weight: 1.4,
    totalPriceUsd: 38.75,
    image: "https://m.media-amazon.com/images/I/71ItL-sDqgL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71ItL-sDqgL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 58300,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 47.77,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 108,
    name: "Fit Simplify Resistance Bands Set",
    slug: "fit-simplify-resistance-bands-set",
    category: "health",
    description: "Set de 5 bandas de resistencia de diferentes niveles para ejercicio en casa.",
    basePrice: 10.95,
    weight: 0.5,
    totalPriceUsd: 15.34,
    image: "https://m.media-amazon.com/images/I/71L0Ct-X7GL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71L0Ct-X7GL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 218e3,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 109,
    name: "LuxFit Premium High Density Foam Roller",
    slug: "luxfit-premium-high-density-foam-roller",
    category: "health",
    description: "Rodillo de espuma de alta densidad para recuperaci\xF3n muscular y masaje.",
    basePrice: 21.95,
    weight: 1.8,
    totalPriceUsd: 35.14,
    image: "https://m.media-amazon.com/images/I/71PoG4cZMRL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71PoG4cZMRL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 34200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 40.17,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 110,
    name: "Omron Platinum Blood Pressure Monitor",
    slug: "omron-platinum-blood-pressure-monitor",
    category: "health",
    description: "Monitor de presi\xF3n arterial de brazo con Bluetooth y almacenamiento ilimitado.",
    basePrice: 74.99,
    weight: 1.5,
    totalPriceUsd: 94.49,
    image: "https://m.media-amazon.com/images/I/71Lkm+qSCtL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Lkm+qSCtL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 18400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 109.17,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 111,
    name: "Oral-B iO Series 5 Electric Toothbrush",
    slug: "oral-b-io-series-5-electric-toothbrush",
    category: "health",
    description: "Cepillo el\xE9ctrico con IA que gu\xEDa tu cepillado para una limpieza perfecta.",
    basePrice: 89.99,
    weight: 0.8,
    totalPriceUsd: 107.89,
    image: "https://m.media-amazon.com/images/I/71BHBH7TBJL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71BHBH7TBJL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 24600,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Certificaci\u00F3n: "FDA",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 35,
    name: "Graco Modes Pramette Travel System",
    slug: "graco-modes-pramette-travel-system",
    category: "baby",
    description: "Sistema de viaje completo con coche y silla de auto para beb\xE9.",
    basePrice: 329.99,
    weight: 35,
    totalPriceUsd: 571.99,
    image: "https://m.media-amazon.com/images/I/71hgdz1+20L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71hgdz1+20L._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 4500,
    badge: "Oferta",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 603.44,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 36,
    name: "Pampers Swaddlers Size 1 (198 count)",
    slug: "pampers-swaddlers-size-1-198-count",
    category: "baby",
    description: "Los pa\xF1ales m\xE1s vendidos con indicador de humedad y suavidad premium.",
    basePrice: 44.99,
    weight: 8,
    totalPriceUsd: 95.74,
    image: "https://m.media-amazon.com/images/I/81qQDU1z+5L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81qQDU1z+5L._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 87400,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 112,
    name: "VTech DM221 Audio Baby Monitor",
    slug: "vtech-dm221-audio-baby-monitor",
    category: "baby",
    description: "Monitor de audio para beb\xE9 con alcance de 300m y modo nocturno.",
    basePrice: 29.99,
    weight: 0.6,
    totalPriceUsd: 37.79,
    image: "https://m.media-amazon.com/images/I/71dQMgrFYkL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71dQMgrFYkL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 42100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 40.68,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 113,
    name: "Dr. Brown's Anti-Colic Bottles 8oz 4-Pack",
    slug: "dr-brown-s-anti-colic-bottles-8oz-4-pack",
    category: "baby",
    description: "Biberones anti-c\xF3lico con sistema de ventilaci\xF3n interna.",
    basePrice: 22.49,
    weight: 1,
    totalPriceUsd: 31.36,
    image: "https://m.media-amazon.com/images/I/71oMiDqEFzL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71oMiDqEFzL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 58900,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 114,
    name: "Graco 4Ever DLX 4-in-1 Car Seat",
    slug: "graco-4ever-dlx-4-in-1-car-seat",
    category: "baby",
    description: "Silla de auto que crece con tu hijo desde reci\xE9n nacido hasta 54kg.",
    basePrice: 229.99,
    weight: 22,
    totalPriceUsd: 385.49,
    image: "https://m.media-amazon.com/images/I/71gY0I+P3uL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71gY0I+P3uL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 18400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 478.93,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 115,
    name: "Carter's Baby 8-Pack Bodysuits",
    slug: "carter-s-baby-8-pack-bodysuits",
    category: "baby",
    description: "Pack de 8 bodies de algod\xF3n suave con broches f\xE1ciles de abrir.",
    basePrice: 19.99,
    weight: 0.5,
    totalPriceUsd: 25.74,
    image: "https://m.media-amazon.com/images/I/81mCaVrPPwL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81mCaVrPPwL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 34200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 29.03,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 116,
    name: "Nuby Ice Gel Teether Keys",
    slug: "nuby-ice-gel-teether-keys",
    category: "baby",
    description: "Mordedor con gel fr\xEDo que alivia las enc\xEDas del beb\xE9 de forma segura.",
    basePrice: 5.49,
    weight: 0.2,
    totalPriceUsd: 7.41,
    image: "https://m.media-amazon.com/images/I/71b9r0cGYBL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71b9r0cGYBL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 86700,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 9.75,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 117,
    name: "Baby Einstein Take Along Tunes Musical Toy",
    slug: "baby-einstein-take-along-tunes-musical-toy",
    category: "baby",
    description: "Juguete musical con 7 melod\xEDas cl\xE1sicas y luces suaves para beb\xE9s.",
    basePrice: 9.99,
    weight: 0.3,
    totalPriceUsd: 13.14,
    image: "https://m.media-amazon.com/images/I/71KMz1cOYhL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71KMz1cOYhL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 92400,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 37,
    name: "Bowflex SelectTech 552 Dumbbells (Par)",
    slug: "bowflex-selecttech-552-dumbbells-par",
    category: "sports",
    description: "Mancuernas ajustables de 2.3 a 23.8kg cada una, reemplazan 15 pares.",
    basePrice: 349,
    weight: 70,
    totalPriceUsd: 786.35,
    image: "https://m.media-amazon.com/images/I/71kB+xNnXeL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71kB+xNnXeL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 18200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 930.88,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 38,
    name: "Manduka PRO Yoga Mat 71\u2033",
    slug: "manduka-pro-yoga-mat-71",
    category: "sports",
    description: "Mat de yoga premium de alta densidad, antideslizante y duradero.",
    basePrice: 92,
    weight: 7.5,
    totalPriceUsd: 147.05,
    image: "https://m.media-amazon.com/images/I/716wg-E-URL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/716wg-E-URL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 5100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 118,
    name: "Brooks Ghost 15 Running \u2014 Hombre",
    slug: "brooks-ghost-15-running-hombre",
    category: "sports",
    description: "Zapatilla de running neutral con amortiguaci\xF3n DNA LOFT suave y c\xF3moda.",
    basePrice: 119.95,
    weight: 1.5,
    totalPriceUsd: 146.19,
    image: "https://m.media-amazon.com/images/I/71YX2KQMZ+L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71YX2KQMZ+L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 22800,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 119,
    name: "WOD Nation Speed Jump Rope",
    slug: "wod-nation-speed-jump-rope",
    category: "sports",
    description: "Cuerda de saltar ajustable con rodamientos de bola para velocidad m\xE1xima.",
    basePrice: 15.95,
    weight: 0.3,
    totalPriceUsd: 19.99,
    image: "https://m.media-amazon.com/images/I/71-yjjhYE1L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71-yjjhYE1L._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 34200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 25.93,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 120,
    name: "Hydro Flask 32oz Wide Mouth",
    slug: "hydro-flask-32oz-wide-mouth",
    category: "sports",
    description: "Botella de agua aislada al vac\xEDo que mantiene fr\xEDo 24h o caliente 12h.",
    basePrice: 44.95,
    weight: 1,
    totalPriceUsd: 57.19,
    image: "https://m.media-amazon.com/images/I/81JvI1ZSIDL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81JvI1ZSIDL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 87600,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 121,
    name: "Coleman Sundome 4-Person Tent",
    slug: "coleman-sundome-4-person-tent",
    category: "sports",
    description: "Carpa para 4 personas con montaje r\xE1pido en 10 minutos.",
    basePrice: 79.99,
    weight: 9.5,
    totalPriceUsd: 144.24,
    image: "https://m.media-amazon.com/images/I/71MZUVNYqhL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71MZUVNYqhL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 34800,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 186.53,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 122,
    name: "Osprey Atmos AG 65 Backpack",
    slug: "osprey-atmos-ag-65-backpack",
    category: "sports",
    description: "Mochila de trekking con sistema Anti-Gravity para m\xE1xima comodidad.",
    basePrice: 270,
    weight: 4.3,
    totalPriceUsd: 334.15,
    image: "https://m.media-amazon.com/images/I/71VQ7bsFhQL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71VQ7bsFhQL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 8900,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 428.02,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 123,
    name: "Yes4All Doorway Pull-Up Bar",
    slug: "yes4all-doorway-pull-up-bar",
    category: "sports",
    description: "Barra de dominadas para puerta, sin tornillos, soporta hasta 136kg.",
    basePrice: 29.99,
    weight: 3.5,
    totalPriceUsd: 53.74,
    image: "https://m.media-amazon.com/images/I/71CQWH1vb6L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71CQWH1vb6L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 68400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 60.46,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 124,
    name: "Trideer Exercise Ball 65cm",
    slug: "trideer-exercise-ball-65cm",
    category: "sports",
    description: "Pelota de ejercicio anti-explosi\xF3n para fitness, yoga y oficina.",
    basePrice: 17.99,
    weight: 2.2,
    totalPriceUsd: 32.79,
    image: "https://m.media-amazon.com/images/I/71dMi+H-zQL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71dMi+H-zQL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 48200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 35.77,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 125,
    name: "Speedo Vanquisher 2.0 Swim Goggles",
    slug: "speedo-vanquisher-2-0-swim-goggles",
    category: "sports",
    description: "Goggles de nataci\xF3n con lentes panor\xE1micas anti-fog y protecci\xF3n UV.",
    basePrice: 15,
    weight: 0.2,
    totalPriceUsd: 18.35,
    image: "https://m.media-amazon.com/images/I/71kBnKNwHcL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71kBnKNwHcL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 28900,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Garant\u00EDa: "Fabricante",
      Uso: "Deportivo"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 21.47,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 39,
    name: "KONG Classic Dog Toy - Large",
    slug: "kong-classic-dog-toy-large",
    category: "pets",
    description: "El juguete para perro m\xE1s popular del mundo, rellenable y ultraresistente.",
    basePrice: 13.99,
    weight: 0.5,
    totalPriceUsd: 18.84,
    image: "https://m.media-amazon.com/images/I/71YpANtv3QL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71YpANtv3QL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 142e3,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 40,
    name: "Purina Pro Plan Adult Dog Food 35lbs",
    slug: "purina-pro-plan-adult-dog-food-35lbs",
    category: "pets",
    description: "Alimento premium para perro adulto con pollo real como ingrediente #1.",
    basePrice: 54.48,
    weight: 35,
    totalPriceUsd: 255.15,
    image: "https://m.media-amazon.com/images/I/81+SfxHyl4L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81+SfxHyl4L._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 28e3,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 300.2,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 126,
    name: "Purina Fancy Feast Cat Food 24-Pack",
    slug: "purina-fancy-feast-cat-food-24-pack",
    category: "pets",
    description: "Pack de 24 latas de comida gourmet para gato en salsa.",
    basePrice: 17.76,
    weight: 4.5,
    totalPriceUsd: 45.17,
    image: "https://m.media-amazon.com/images/I/81FSrO9fLcL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81FSrO9fLcL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 186e3,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 127,
    name: "Best Friends by Sheri Donut Dog Bed",
    slug: "best-friends-by-sheri-donut-dog-bed",
    category: "pets",
    description: "Cama redonda tipo donut de peluche para perros y gatos.",
    basePrice: 34.99,
    weight: 3,
    totalPriceUsd: 56.74,
    image: "https://m.media-amazon.com/images/I/71SvLcK4oHL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71SvLcK4oHL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 78400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 64.02,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 128,
    name: "Sherpa Original Deluxe Pet Carrier",
    slug: "sherpa-original-deluxe-pet-carrier",
    category: "pets",
    description: "Transportador aprobado por aerol\xEDneas con ventilaci\xF3n y comodidad.",
    basePrice: 37.99,
    weight: 3.5,
    totalPriceUsd: 62.94,
    image: "https://m.media-amazon.com/images/I/71sQ8fmKUhL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71sQ8fmKUhL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 42100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 80.34,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 129,
    name: "Frontline Plus Flea Treatment Dogs 6-Pack",
    slug: "frontline-plus-flea-treatment-dogs-6-pack",
    category: "pets",
    description: "Tratamiento antipulgas y garrapatas mensual para perros de 20-40kg.",
    basePrice: 55.99,
    weight: 0.3,
    totalPriceUsd: 66.04,
    image: "https://m.media-amazon.com/images/I/71-9QFWLE1L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71-9QFWLE1L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 67800,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 82.25,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 130,
    name: "Fresh Step Clean Paws Cat Litter 22.5lbs",
    slug: "fresh-step-clean-paws-cat-litter-22-5lbs",
    category: "pets",
    description: "Arena para gato con f\xF3rmula de patas limpias y control de olores 10 d\xEDas.",
    basePrice: 16.99,
    weight: 22.5,
    totalPriceUsd: 143.29,
    image: "https://m.media-amazon.com/images/I/81KqVJuPa0L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81KqVJuPa0L._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 34200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 131,
    name: "PetSafe Healthy Pet Simply Feed Automatic",
    slug: "petsafe-healthy-pet-simply-feed-automatic",
    category: "pets",
    description: "Comedero autom\xE1tico programable con hasta 12 comidas al d\xEDa.",
    basePrice: 89.95,
    weight: 4,
    totalPriceUsd: 125.44,
    image: "https://m.media-amazon.com/images/I/71Fd5z3zPFL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Fd5z3zPFL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 18900,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguro: "S\xED",
      Tipo: "Premium"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 165.99,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 41,
    name: "Nutella Hazelnut Spread 26.5oz",
    slug: "nutella-hazelnut-spread-26-5oz",
    category: "food",
    description: "La crema de avellanas m\xE1s famosa del mundo, perfecta para todo.",
    basePrice: 9.48,
    weight: 1.7,
    totalPriceUsd: 20.25,
    image: "https://m.media-amazon.com/images/I/81Lqeb-ASpL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81Lqeb-ASpL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 52400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 26.82,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 42,
    name: "Kirkland Signature Mixed Nuts 40oz",
    slug: "kirkland-signature-mixed-nuts-40oz",
    category: "food",
    description: "Mezcla premium de nueces sin sal: almendras, nueces, pistachos y m\xE1s.",
    basePrice: 16.99,
    weight: 2.5,
    totalPriceUsd: 33.29,
    image: "https://m.media-amazon.com/images/I/81KU0JLIU4L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81KU0JLIU4L._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 14200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 132,
    name: "Quest Protein Bars Variety 12-Pack",
    slug: "quest-protein-bars-variety-12-pack",
    category: "food",
    description: "Pack variado de 12 barras proteicas con 20g de prote\xEDna y bajo az\xFAcar.",
    basePrice: 24.99,
    weight: 1.5,
    totalPriceUsd: 36.99,
    image: "https://m.media-amazon.com/images/I/71bSYOKfaUL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71bSYOKfaUL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 84200,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 133,
    name: "Lavazza Super Crema Coffee Beans 2.2lb",
    slug: "lavazza-super-crema-coffee-beans-2-2lb",
    category: "food",
    description: "Caf\xE9 en grano italiano premium, mezcla cremosa y arom\xE1tica.",
    basePrice: 18.98,
    weight: 2.2,
    totalPriceUsd: 33.93,
    image: "https://m.media-amazon.com/images/I/61+xqC1bPpL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61+xqC1bPpL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 42800,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 42.72,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 134,
    name: "Yellowbird Hot Sauce Variety 3-Pack",
    slug: "yellowbird-hot-sauce-variety-3-pack",
    category: "food",
    description: "Set de 3 salsas picantes artesanales: Habanero, Serrano, Ghost Pepper.",
    basePrice: 19.99,
    weight: 2,
    totalPriceUsd: 33.99,
    image: "https://m.media-amazon.com/images/I/71j2FBVCP1L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71j2FBVCP1L._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 8900,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 135,
    name: "Bare Baked Crunchy Apple Chips 6-Pack",
    slug: "bare-baked-crunchy-apple-chips-6-pack",
    category: "food",
    description: "Chips de manzana horneadas, crujientes y saludables, sin az\xFAcar a\xF1adida.",
    basePrice: 17.99,
    weight: 1,
    totalPriceUsd: 26.19,
    image: "https://m.media-amazon.com/images/I/71Vu+cJYqjL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Vu+cJYqjL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 28400,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 34.96,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 136,
    name: "Jif Creamy Peanut Butter 40oz",
    slug: "jif-creamy-peanut-butter-40oz",
    category: "food",
    description: "La mantequilla de man\xED cremosa preferida de Am\xE9rica.",
    basePrice: 7.98,
    weight: 2.5,
    totalPriceUsd: 22.93,
    image: "https://m.media-amazon.com/images/I/71NR8WuaAfL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71NR8WuaAfL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 124e3,
    badge: "M\xE1s vendido",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 137,
    name: "Pompeian Extra Virgin Olive Oil 48oz",
    slug: "pompeian-extra-virgin-olive-oil-48oz",
    category: "food",
    description: "Aceite de oliva extra virgen de primera extracci\xF3n en fr\xEDo.",
    basePrice: 11.99,
    weight: 3.2,
    totalPriceUsd: 31.39,
    image: "https://m.media-amazon.com/images/I/71y5Bdi+6gL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71y5Bdi+6gL._AC_SL1500_.jpg"
    ],
    rating: 4.6,
    reviews: 56200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 38.19,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 138,
    name: "Nature Nate's Raw & Unfiltered Honey 32oz",
    slug: "nature-nate-s-raw-unfiltered-honey-32oz",
    category: "food",
    description: "Miel 100% pura, cruda y sin filtrar, directa de la colmena.",
    basePrice: 12.98,
    weight: 2.1,
    totalPriceUsd: 26.48,
    image: "https://m.media-amazon.com/images/I/71RStKD3wAL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71RStKD3wAL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 72100,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 139,
    name: "Kirkland Trail Mix 4lb",
    slug: "kirkland-trail-mix-4lb",
    category: "food",
    description: "Mezcla de frutos secos, chocolate y frutas deshidratadas, bolsa grande.",
    basePrice: 14.99,
    weight: 4,
    totalPriceUsd: 39.24,
    image: "https://m.media-amazon.com/images/I/81Gre7eKp+L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81Gre7eKp+L._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 18200,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Tipo: "Importado USA",
      Fecha: "Vigente",
      Original: "S\xED"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 43,
    name: "Mobil 1 Advanced Full Synthetic 5W-30 5Qt",
    slug: "mobil-1-advanced-full-synthetic-5w-30-5qt",
    category: "auto",
    description: "Aceite sint\xE9tico completo de alto rendimiento para m\xE1xima protecci\xF3n.",
    basePrice: 27.97,
    weight: 10,
    totalPriceUsd: 87.17,
    image: "https://m.media-amazon.com/images/I/71pmgnspksL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71pmgnspksL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 64300,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 104.62,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 44,
    name: "NOCO Boost Plus GB40 Jump Starter",
    slug: "noco-boost-plus-gb40-jump-starter",
    category: "auto",
    description: "Arrancador port\xE1til de 1000A para motores de hasta 6L gasolina.",
    basePrice: 99.95,
    weight: 2.4,
    totalPriceUsd: 128.14,
    image: "https://m.media-amazon.com/images/I/71ztGFaAiqL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71ztGFaAiqL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 231e3,
    badge: "M\xE1s vendido",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 140,
    name: "ThisWorx Car Vacuum Cleaner",
    slug: "thisworx-car-vacuum-cleaner",
    category: "auto",
    description: "Aspiradora port\xE1til para auto con cable de 4.9m y succi\xF3n potente.",
    basePrice: 29.99,
    weight: 2,
    totalPriceUsd: 45.49,
    image: "https://m.media-amazon.com/images/I/71-NNz4Y3kL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71-NNz4Y3kL._AC_SL1500_.jpg"
    ],
    rating: 4.3,
    reviews: 142e3,
    badge: "Popular",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 141,
    name: "Vantrue N1 Pro 2K Dash Cam",
    slug: "vantrue-n1-pro-2k-dash-cam",
    category: "auto",
    description: "C\xE1mara para auto con grabaci\xF3n 2K, visi\xF3n nocturna y sensor G.",
    basePrice: 89.99,
    weight: 0.5,
    totalPriceUsd: 106.24,
    image: "https://m.media-amazon.com/images/I/71tn4Qzqa6L._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71tn4Qzqa6L._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 24600,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 114.22,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 142,
    name: "AstroAI Tire Inflator Portable",
    slug: "astroai-tire-inflator-portable",
    category: "auto",
    description: "Inflador de neum\xE1ticos port\xE1til con pantalla digital y auto-stop.",
    basePrice: 29.99,
    weight: 2.5,
    totalPriceUsd: 48.24,
    image: "https://m.media-amazon.com/images/I/71-Lb3ZFPCL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71-Lb3ZFPCL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 86700,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 64.11,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 143,
    name: "Anker USB-C Car Charger 52.5W",
    slug: "anker-usb-c-car-charger-52-5w",
    category: "auto",
    description: "Cargador de auto dual USB-C + USB-A con carga r\xE1pida PowerIQ 3.0.",
    basePrice: 15.99,
    weight: 0.2,
    totalPriceUsd: 19.49,
    image: "https://m.media-amazon.com/images/I/71WGBbz8TjL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71WGBbz8TjL._AC_SL1500_.jpg"
    ],
    rating: 4.7,
    reviews: 48200,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 25.7,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 144,
    name: "Fahren H11 LED Headlight Bulbs",
    slug: "fahren-h11-led-headlight-bulbs",
    category: "auto",
    description: "Bombillos LED H11 de alto brillo, 300% m\xE1s luminosos que hal\xF3genos.",
    basePrice: 32.99,
    weight: 0.5,
    totalPriceUsd: 40.69,
    image: "https://m.media-amazon.com/images/I/71EvJoFCMSL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71EvJoFCMSL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 67800,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 43.27,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 145,
    name: "Armor All Complete Car Care Kit",
    slug: "armor-all-complete-car-care-kit",
    category: "auto",
    description: "Kit completo de limpieza para auto con 8 productos esenciales.",
    basePrice: 19.99,
    weight: 4.5,
    totalPriceUsd: 47.74,
    image: "https://m.media-amazon.com/images/I/81SvFqrR1oL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81SvFqrR1oL._AC_SL1500_.jpg"
    ],
    rating: 4.4,
    reviews: 38200,
    badge: "",
    specs: {
      Garant\u00EDa: "Fabricante",
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Compatible: "Universal"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 53.23,
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 146,
    name: "LEGO Star Wars Millennium Falcon 75375",
    slug: "lego-star-wars-millennium-falcon-75375",
    category: "toys",
    description: "Set de 1351 piezas del Halc\xF3n Milenario con 7 minifiguras.",
    basePrice: 169.99,
    weight: 3.5,
    totalPriceUsd: 214.74,
    image: "https://m.media-amazon.com/images/I/81v5DKaDFjL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81v5DKaDFjL._AC_SL1500_.jpg"
    ],
    rating: 4.8,
    reviews: 8400,
    badge: "Popular",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Edad: "3+"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    createdAt: "2026-03-13T02:16:08.469Z"
  },
  {
    id: 147,
    name: "Barbie Dreamhouse 2024",
    slug: "barbie-dreamhouse-2024",
    category: "toys",
    description: "Casa de ensue\xF1o de Barbie con 3 pisos, tobog\xE1n y 75+ accesorios.",
    basePrice: 179.99,
    weight: 14,
    totalPriceUsd: 283.99,
    image: "https://m.media-amazon.com/images/I/71J5l9qsFoL._AC_SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71J5l9qsFoL._AC_SL1500_.jpg"
    ],
    rating: 4.5,
    reviews: 12800,
    badge: "",
    specs: {
      Condici\u00F3n: "Nuevo",
      Original: "S\xED",
      Seguridad: "Certificado",
      Edad: "3+"
    },
    isActive: true,
    isManual: false,
    amazonAsin: "",
    oldPrice: 328.2,
    createdAt: "2026-03-13T02:16:08.469Z"
  }
];

// server/pg-storage.ts
init_schema();
var import_drizzle_orm = require("drizzle-orm");
init_db();
var import_crypto = require("crypto");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
function generateOrderNumber() {
  const num = Math.floor(1e4 + Math.random() * 9e4);
  return `CK-${num}`;
}
function calculateEstimatedDelivery() {
  const now = /* @__PURE__ */ new Date();
  const arrivesMiami = new Date(now);
  arrivesMiami.setDate(arrivesMiami.getDate() + 3);
  let shipDate = new Date(arrivesMiami);
  const day = arrivesMiami.getDay();
  if (day <= 4) {
    shipDate.setDate(arrivesMiami.getDate() + (5 - day));
  } else {
    shipDate.setDate(arrivesMiami.getDate() + (12 - day));
  }
  const arriveVzla = new Date(shipDate);
  arriveVzla.setDate(shipDate.getDate() + 4);
  const available = new Date(arriveVzla);
  available.setDate(arriveVzla.getDate() + 1);
  return available.toISOString();
}
function buildAmazonCartUrl(items) {
  let url = "https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=copikonusa-20";
  items.forEach((item, i) => {
    if (item.amazonAsin) {
      url += `&ASIN.${i + 1}=${item.amazonAsin}&Quantity.${i + 1}=${item.quantity}`;
    }
  });
  return url;
}
var PgStorage = class {
  db;
  constructor() {
    this.db = getDb();
    this.seed();
  }
  async seed() {
    await this.db.execute(import_drizzle_orm.sql`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        total_products INTEGER DEFAULT 0,
        updated INTEGER DEFAULT 0,
        deactivated INTEGER DEFAULT 0,
        reactivated INTEGER DEFAULT 0,
        price_alerts INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'running',
        details JSONB DEFAULT '{}'
      )
    `);
    try {
      await this.db.execute(import_drizzle_orm.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amazon_order_ids JSONB DEFAULT '[]'`);
      await this.db.execute(import_drizzle_orm.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amazon_purchase_status TEXT DEFAULT ''`);
      await this.db.execute(import_drizzle_orm.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amazon_purchase_notes TEXT DEFAULT ''`);
      await this.db.execute(import_drizzle_orm.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amazon_cost_usd REAL DEFAULT 0`);
      await this.db.execute(import_drizzle_orm.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS profit_usd REAL DEFAULT 0`);
      console.log("[DB] Purchase automation columns added/verified");
    } catch (e) {
      console.log("[DB] Column migration note:", e.message);
    }
    try {
      await this.db.execute(import_drizzle_orm.sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
      await this.db.execute(import_drizzle_orm.sql`CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops)`);
      await this.db.execute(import_drizzle_orm.sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)`);
      await this.db.execute(import_drizzle_orm.sql`CREATE INDEX IF NOT EXISTS idx_products_reviews ON products (reviews DESC)`);
      await this.db.execute(import_drizzle_orm.sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active)`);
      await this.db.execute(import_drizzle_orm.sql`CREATE INDEX IF NOT EXISTS idx_products_active_cat ON products (is_active, category)`);
      console.log("[DB] Search indexes created/verified");
    } catch (e) {
      console.log("[DB] Index creation note:", e.message);
    }
    const existing = await this.db.select().from(usersTable).where((0, import_drizzle_orm.eq)(usersTable.email, "admin@copikonusa.com")).limit(1);
    if (existing.length === 0) {
      const hashedPw = await import_bcryptjs.default.hash("admin123", 10);
      await this.db.insert(usersTable).values({
        id: (0, import_crypto.randomUUID)(),
        name: "Admin CopikonUSA",
        email: "admin@copikonusa.com",
        password: hashedPw,
        phone: "+584120000000",
        whatsapp: "+584120000000",
        city: "Caracas",
        address: "",
        branch: "Caracas",
        role: "admin",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const defaultSettings = {
      bcv_rate: "62",
      shipping_per_lb: "5.50",
      bs_differential: "1.50",
      zelle_email: "pagos@copikonusa.com",
      binance_wallet: "0x1234567890abcdef",
      bank_name: "Banesco",
      bank_account: "01340000000000000000",
      bank_rif: "J-12345678-9",
      bank_phone: "04120000000",
      delivery_caracas: "5",
      delivery_barquisimeto: "8",
      delivery_valencia: "7",
      delivery_maracay: "6"
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      const exists = await this.db.select().from(settingsTable).where((0, import_drizzle_orm.eq)(settingsTable.key, key)).limit(1);
      if (exists.length === 0) {
        await this.db.insert(settingsTable).values({ key, value });
      }
    }
  }
  // ===== USERS =====
  async getUser(id) {
    const rows = await this.db.select().from(usersTable).where((0, import_drizzle_orm.eq)(usersTable.id, id)).limit(1);
    return rows[0];
  }
  async getUserByEmail(email) {
    const rows = await this.db.select().from(usersTable).where((0, import_drizzle_orm.ilike)(usersTable.email, email)).limit(1);
    return rows[0];
  }
  async createUser(data) {
    const id = (0, import_crypto.randomUUID)();
    const hashedPw = await import_bcryptjs.default.hash(data.password, 10);
    const user = {
      id,
      name: data.name,
      email: data.email,
      password: hashedPw,
      phone: data.phone,
      whatsapp: data.whatsapp || "",
      city: data.city,
      address: data.address || "",
      branch: data.branch,
      role: "customer",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.db.insert(usersTable).values(user);
    return user;
  }
  async updateUser(id, data) {
    const { id: _id, ...updateData } = data;
    const rows = await this.db.update(usersTable).set(updateData).where((0, import_drizzle_orm.eq)(usersTable.id, id)).returning();
    return rows[0];
  }
  async getAllUsers() {
    const rows = await this.db.select().from(usersTable).where((0, import_drizzle_orm.eq)(usersTable.role, "customer"));
    return rows;
  }
  // ===== PRODUCTS =====
  async getProducts(filters) {
    const conditions = [(0, import_drizzle_orm.eq)(productsTable.isActive, true)];
    const searchTerm = filters?.search?.trim() || "";
    if (filters?.category) {
      conditions.push((0, import_drizzle_orm.eq)(productsTable.category, filters.category));
    }
    if (searchTerm) {
      const searchVariants = filters?.searchVariants || [searchTerm];
      const orConditions = searchVariants.flatMap((term) => {
        const q = `%${term}%`;
        return [
          import_drizzle_orm.sql`${productsTable.name} ILIKE ${q}`,
          import_drizzle_orm.sql`${productsTable.description} ILIKE ${q}`
        ];
      });
      orConditions.push((0, import_drizzle_orm.ilike)(productsTable.category, `%${searchTerm}%`));
      conditions.push((0, import_drizzle_orm.or)(...orConditions));
    }
    if (filters?.minPrice !== void 0) {
      conditions.push((0, import_drizzle_orm.gte)(productsTable.totalPriceUsd, filters.minPrice));
    }
    if (filters?.maxPrice !== void 0) {
      conditions.push((0, import_drizzle_orm.lte)(productsTable.totalPriceUsd, filters.maxPrice));
    }
    if (filters?.minRating !== void 0) {
      conditions.push((0, import_drizzle_orm.gte)(productsTable.rating, filters.minRating));
    }
    const where = (0, import_drizzle_orm.and)(...conditions);
    const countResult = await this.db.select({ count: (0, import_drizzle_orm.count)() }).from(productsTable).where(where);
    const total = countResult[0]?.count || 0;
    let orderBy;
    if (filters?.sort === "price_asc") orderBy = (0, import_drizzle_orm.asc)(productsTable.totalPriceUsd);
    else if (filters?.sort === "price_desc") orderBy = (0, import_drizzle_orm.desc)(productsTable.totalPriceUsd);
    else if (filters?.sort === "rating") orderBy = (0, import_drizzle_orm.desc)(productsTable.rating);
    else if (filters?.sort === "name") orderBy = (0, import_drizzle_orm.asc)(productsTable.name);
    else if (searchTerm && !filters?.sort) {
      const qLower = searchTerm.toLowerCase();
      const words = qLower.split(/\s+/).filter((w) => w.length >= 2);
      let wordMatchSql = import_drizzle_orm.sql`0`;
      for (const word of words) {
        wordMatchSql = import_drizzle_orm.sql`${wordMatchSql} + CASE WHEN LOWER(name) ILIKE ${"%" + word + "%"} THEN 30 ELSE 0 END`;
      }
      orderBy = import_drizzle_orm.sql`
        CASE WHEN LOWER(name) LIKE ${qLower + "%"} THEN 100 ELSE 0 END
        + CASE WHEN LOWER(name) ILIKE ${"%" + qLower + "%"} THEN 50 ELSE 0 END
        + (${wordMatchSql})
        + (50.0 / GREATEST(LENGTH(name), 1))
        + similarity(LOWER(name), ${qLower}) * 30
        + LEAST(COALESCE(reviews, 0)::float / 50000.0, 10)
        DESC
      `;
    } else {
      orderBy = import_drizzle_orm.sql`
        (COALESCE(rating, 0) * LN(GREATEST(COALESCE(reviews, 0), 1)))
        + CASE WHEN created_at >= TO_CHAR(NOW() - INTERVAL '7 days', 'YYYY-MM-DD') THEN 15 ELSE 0 END
        + MOD(id * EXTRACT(DOY FROM NOW())::int, 100) / 100.0 * 3
        DESC
      `;
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    const rows = await this.db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit).offset(offset);
    return { products: rows, total };
  }
  async getProduct(id) {
    const rows = await this.db.select().from(productsTable).where((0, import_drizzle_orm.eq)(productsTable.id, id)).limit(1);
    return rows[0];
  }
  async getProductBySlug(slug) {
    const rows = await this.db.select().from(productsTable).where((0, import_drizzle_orm.eq)(productsTable.slug, slug)).limit(1);
    return rows[0];
  }
  async updateProduct(id, data) {
    const { id: _id, ...updateData } = data;
    if (data.basePrice !== void 0 || data.weight !== void 0) {
      const current = await this.getProduct(id);
      if (current) {
        const bp = data.basePrice ?? current.basePrice;
        const w = data.weight ?? current.weight;
        const shippingPerLb = parseFloat(await this.getSetting("shipping_per_lb") || "5.50");
        updateData.totalPriceUsd = +(bp * 1.15 + Math.max(w, 1) * shippingPerLb).toFixed(2);
      }
    }
    const rows = await this.db.update(productsTable).set(updateData).where((0, import_drizzle_orm.eq)(productsTable.id, id)).returning();
    return rows[0];
  }
  async getCategories() {
    const rows = await this.db.select({ category: productsTable.category, count: (0, import_drizzle_orm.count)() }).from(productsTable).where((0, import_drizzle_orm.eq)(productsTable.isActive, true)).groupBy(productsTable.category);
    const catNames = {
      tech: "Tecnolog\xEDa",
      phones: "Tel\xE9fonos",
      gaming: "Gaming",
      beauty: "Belleza",
      shoes: "Calzado",
      clothing: "Ropa y Moda",
      home: "Hogar y Cocina",
      health: "Salud",
      baby: "Beb\xE9s y Ni\xF1os",
      sports: "Deportes",
      pets: "Mascotas",
      food: "Comestibles",
      auto: "Autos y Herramientas",
      toys: "Juguetes",
      office: "Oficina"
    };
    return rows.map((r) => ({
      id: r.category,
      name: catNames[r.category] || r.category,
      count: r.count
    })).sort((a, b) => b.count - a.count);
  }
  // ===== ORDERS =====
  async createOrder(userId, data, settings) {
    const id = (0, import_crypto.randomUUID)();
    let subtotalUsd = 0;
    let totalWeight = 0;
    for (const item of data.items) {
      subtotalUsd += item.priceUsd * item.quantity;
      totalWeight += Math.max(item.weight, 1) * item.quantity;
    }
    const shippingUsd = +(totalWeight * settings.shippingPerLb).toFixed(2);
    const totalUsd = +subtotalUsd.toFixed(2);
    const totalBs = +(totalUsd * settings.bsDifferential * settings.bcvRate).toFixed(2);
    const order = {
      id,
      userId,
      orderNumber: generateOrderNumber(),
      items: data.items,
      subtotalUsd: +(subtotalUsd - shippingUsd).toFixed(2),
      shippingUsd,
      totalUsd,
      totalBs,
      paymentMethod: data.paymentMethod,
      paymentProof: "",
      status: "pending_payment",
      branch: data.branch,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress || "",
      estimatedDelivery: calculateEstimatedDelivery(),
      amazonCartUrl: buildAmazonCartUrl(data.items),
      notes: data.notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.db.insert(ordersTable).values(order);
    return order;
  }
  async getOrder(id) {
    const rows = await this.db.select().from(ordersTable).where((0, import_drizzle_orm.eq)(ordersTable.id, id)).limit(1);
    return rows[0];
  }
  async getOrderByNumber(orderNumber) {
    const rows = await this.db.select().from(ordersTable).where((0, import_drizzle_orm.eq)(ordersTable.orderNumber, orderNumber)).limit(1);
    return rows[0];
  }
  async getUserOrders(userId) {
    const rows = await this.db.select().from(ordersTable).where((0, import_drizzle_orm.eq)(ordersTable.userId, userId)).orderBy((0, import_drizzle_orm.desc)(ordersTable.createdAt));
    return rows;
  }
  async getAllOrders(filters) {
    const conditions = [];
    if (filters?.status) {
      conditions.push((0, import_drizzle_orm.eq)(ordersTable.status, filters.status));
    }
    const where = conditions.length > 0 ? (0, import_drizzle_orm.and)(...conditions) : void 0;
    const rows = await this.db.select().from(ordersTable).where(where).orderBy((0, import_drizzle_orm.desc)(ordersTable.createdAt));
    return rows;
  }
  async updateOrderStatus(id, status) {
    const rows = await this.db.update(ordersTable).set({ status }).where((0, import_drizzle_orm.eq)(ordersTable.id, id)).returning();
    return rows[0];
  }
  async updateOrder(id, data) {
    const { id: _id, ...updateData } = data;
    const rows = await this.db.update(ordersTable).set(updateData).where((0, import_drizzle_orm.eq)(ordersTable.id, id)).returning();
    return rows[0];
  }
  // ===== WISHLIST =====
  async getWishlist(userId) {
    const items = await this.db.select().from(wishlistTable).where((0, import_drizzle_orm.eq)(wishlistTable.userId, userId));
    const result = [];
    for (const w of items) {
      const prodRows = await this.db.select().from(productsTable).where((0, import_drizzle_orm.eq)(productsTable.id, w.productId)).limit(1);
      result.push({ ...w, product: prodRows[0] });
    }
    return result;
  }
  async addToWishlist(userId, productId) {
    const existing = await this.db.select().from(wishlistTable).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(wishlistTable.userId, userId), (0, import_drizzle_orm.eq)(wishlistTable.productId, productId))).limit(1);
    if (existing.length > 0) return existing[0];
    const id = (0, import_crypto.randomUUID)();
    const item = { id, userId, productId };
    await this.db.insert(wishlistTable).values(item);
    return item;
  }
  async removeFromWishlist(userId, productId) {
    await this.db.delete(wishlistTable).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(wishlistTable.userId, userId), (0, import_drizzle_orm.eq)(wishlistTable.productId, productId)));
  }
  // ===== REVIEWS =====
  async getProductReviews(productId) {
    const rows = await this.db.select().from(reviewsTable).where((0, import_drizzle_orm.eq)(reviewsTable.productId, productId)).orderBy((0, import_drizzle_orm.desc)(reviewsTable.createdAt));
    return rows;
  }
  async createReview(userId, userName, data) {
    const id = (0, import_crypto.randomUUID)();
    const review = {
      id,
      userId,
      userName,
      productId: data.productId,
      orderId: data.orderId || "",
      rating: data.rating,
      comment: data.comment,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.db.insert(reviewsTable).values(review);
    return review;
  }
  // ===== SETTINGS =====
  async getSetting(key) {
    const rows = await this.db.select().from(settingsTable).where((0, import_drizzle_orm.eq)(settingsTable.key, key)).limit(1);
    return rows[0]?.value;
  }
  async setSetting(key, value) {
    const exists = await this.db.select().from(settingsTable).where((0, import_drizzle_orm.eq)(settingsTable.key, key)).limit(1);
    if (exists.length > 0) {
      await this.db.update(settingsTable).set({ value }).where((0, import_drizzle_orm.eq)(settingsTable.key, key));
    } else {
      await this.db.insert(settingsTable).values({ key, value });
    }
  }
  async getAllSettings() {
    const rows = await this.db.select().from(settingsTable);
    return rows;
  }
  // ===== DASHBOARD =====
  async getDashboardStats() {
    const orders = await this.db.select().from(ordersTable);
    const now = /* @__PURE__ */ new Date();
    const today = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 864e5);
    const monthAgo = new Date(now.getTime() - 30 * 864e5);
    const allOrders = orders;
    const todaySales = allOrders.filter((o) => o.createdAt.startsWith(today) && o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const weekSales = allOrders.filter((o) => new Date(o.createdAt) >= weekAgo && o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const monthSales = allOrders.filter((o) => new Date(o.createdAt) >= monthAgo && o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const totalRevenue = allOrders.filter((o) => o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const pendingOrders = allOrders.filter((o) => o.status === "pending_payment").length;
    const customerCount = await this.db.select({ count: (0, import_drizzle_orm.count)() }).from(usersTable).where((0, import_drizzle_orm.eq)(usersTable.role, "customer"));
    const totalCustomers = customerCount[0]?.count || 0;
    const productCount = await this.db.select({ count: (0, import_drizzle_orm.count)() }).from(productsTable);
    const totalProducts = productCount[0]?.count || 0;
    return {
      todaySales: +todaySales.toFixed(2),
      weekSales: +weekSales.toFixed(2),
      monthSales: +monthSales.toFixed(2),
      totalRevenue: +totalRevenue.toFixed(2),
      pendingOrders,
      totalCustomers,
      totalOrders: allOrders.length,
      totalProducts,
      recentOrders: allOrders.slice(0, 10)
    };
  }
  // ===== PRODUCT CREATION (for Canopy import) =====
  async createProduct(data) {
    const rows = await this.db.insert(productsTable).values({
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: data.description,
      basePrice: data.basePrice,
      weight: data.weight,
      totalPriceUsd: data.totalPriceUsd,
      image: data.image,
      images: data.images,
      rating: data.rating,
      reviews: data.reviews,
      badge: data.badge,
      specs: data.specs,
      isActive: data.isActive,
      isManual: data.isManual,
      amazonAsin: data.amazonAsin,
      oldPrice: data.oldPrice,
      createdAt: data.createdAt
    }).returning();
    return rows[0];
  }
};

// server/storage.ts
function generateOrderNumber2() {
  const num = Math.floor(1e4 + Math.random() * 9e4);
  return `CK-${num}`;
}
function calculateEstimatedDelivery2() {
  const now = /* @__PURE__ */ new Date();
  const arrivesMiami = new Date(now);
  arrivesMiami.setDate(arrivesMiami.getDate() + 3);
  let shipDate = new Date(arrivesMiami);
  const day = arrivesMiami.getDay();
  if (day <= 4) {
    shipDate.setDate(arrivesMiami.getDate() + (5 - day));
  } else {
    shipDate.setDate(arrivesMiami.getDate() + (12 - day));
  }
  const arriveVzla = new Date(shipDate);
  arriveVzla.setDate(shipDate.getDate() + 4);
  const available = new Date(arriveVzla);
  available.setDate(arriveVzla.getDate() + 1);
  return available.toISOString();
}
function buildAmazonCartUrl2(items) {
  let url = "https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=copikonusa-20";
  items.forEach((item, i) => {
    if (item.amazonAsin) {
      url += `&ASIN.${i + 1}=${item.amazonAsin}&Quantity.${i + 1}=${item.quantity}`;
    }
  });
  return url;
}
var MemStorage = class {
  users;
  products;
  orders;
  wishlist;
  reviews;
  settings;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.wishlist = /* @__PURE__ */ new Map();
    this.reviews = /* @__PURE__ */ new Map();
    this.settings = /* @__PURE__ */ new Map();
    this.seed();
  }
  seed() {
    const adminId = (0, import_crypto2.randomUUID)();
    this.users.set(adminId, {
      id: adminId,
      name: "Admin CopikonUSA",
      email: "admin@copikonusa.com",
      password: "admin123",
      phone: "+584120000000",
      whatsapp: "+584120000000",
      city: "Caracas",
      address: "",
      branch: "Caracas",
      role: "admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    for (const p of products_data_default) {
      this.products.set(p.id, p);
    }
    this.settings.set("bcv_rate", "62");
    this.settings.set("shipping_per_lb", "5.50");
    this.settings.set("bs_differential", "1.50");
    this.settings.set("zelle_email", "pagos@copikonusa.com");
    this.settings.set("binance_wallet", "0x1234567890abcdef");
    this.settings.set("bank_name", "Banesco");
    this.settings.set("bank_account", "01340000000000000000");
    this.settings.set("bank_rif", "J-12345678-9");
    this.settings.set("bank_phone", "04120000000");
    this.settings.set("delivery_caracas", "5");
    this.settings.set("delivery_barquisimeto", "8");
    this.settings.set("delivery_valencia", "7");
    this.settings.set("delivery_maracay", "6");
  }
  // ===== USERS =====
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  async createUser(data) {
    const id = (0, import_crypto2.randomUUID)();
    const user = {
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      whatsapp: data.whatsapp || "",
      city: data.city,
      address: data.address || "",
      branch: data.branch,
      role: "customer",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, data) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updated = { ...user, ...data, id };
    this.users.set(id, updated);
    return updated;
  }
  async getAllUsers() {
    return Array.from(this.users.values()).filter((u) => u.role === "customer");
  }
  // ===== PRODUCTS =====
  async getProducts(filters) {
    let prods = Array.from(this.products.values()).filter((p) => p.isActive);
    if (filters?.category) {
      prods = prods.filter((p) => p.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (filters?.minPrice !== void 0) {
      prods = prods.filter((p) => p.totalPriceUsd >= filters.minPrice);
    }
    if (filters?.maxPrice !== void 0) {
      prods = prods.filter((p) => p.totalPriceUsd <= filters.maxPrice);
    }
    if (filters?.minRating !== void 0) {
      prods = prods.filter((p) => p.rating >= filters.minRating);
    }
    const total = prods.length;
    if (filters?.sort === "price_asc") prods.sort((a, b) => a.totalPriceUsd - b.totalPriceUsd);
    else if (filters?.sort === "price_desc") prods.sort((a, b) => b.totalPriceUsd - a.totalPriceUsd);
    else if (filters?.sort === "rating") prods.sort((a, b) => b.rating - a.rating);
    else if (filters?.sort === "name") prods.sort((a, b) => a.name.localeCompare(b.name));
    else prods.sort((a, b) => b.reviews - a.reviews);
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    prods = prods.slice(start, start + limit);
    return { products: prods, total };
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async getProductBySlug(slug) {
    return Array.from(this.products.values()).find((p) => p.slug === slug);
  }
  async updateProduct(id, data) {
    const product = this.products.get(id);
    if (!product) return void 0;
    const updated = { ...product, ...data, id };
    if (data.basePrice !== void 0 || data.weight !== void 0) {
      const bp = data.basePrice ?? product.basePrice;
      const w = data.weight ?? product.weight;
      const shippingPerLb = parseFloat(await this.getSetting("shipping_per_lb") || "5.50");
      updated.totalPriceUsd = +(bp * 1.15 + Math.max(w, 1) * shippingPerLb).toFixed(2);
    }
    this.products.set(id, updated);
    return updated;
  }
  async getCategories() {
    const counts = {};
    for (const p of this.products.values()) {
      if (p.isActive) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    const catNames = {
      tech: "Tecnolog\xEDa",
      phones: "Tel\xE9fonos",
      gaming: "Gaming",
      beauty: "Belleza",
      shoes: "Calzado",
      clothing: "Ropa y Moda",
      home: "Hogar y Cocina",
      health: "Salud",
      baby: "Beb\xE9s y Ni\xF1os",
      sports: "Deportes",
      pets: "Mascotas",
      food: "Comestibles",
      auto: "Autos y Herramientas",
      toys: "Juguetes",
      office: "Oficina"
    };
    return Object.entries(counts).map(([id, count2]) => ({
      id,
      name: catNames[id] || id,
      count: count2
    })).sort((a, b) => b.count - a.count);
  }
  // ===== ORDERS =====
  async createOrder(userId, data, settings) {
    const id = (0, import_crypto2.randomUUID)();
    let subtotalUsd = 0;
    let totalWeight = 0;
    for (const item of data.items) {
      subtotalUsd += item.priceUsd * item.quantity;
      totalWeight += item.weight * item.quantity;
    }
    const shippingUsd = +(totalWeight * settings.shippingPerLb).toFixed(2);
    const totalUsd = +subtotalUsd.toFixed(2);
    const totalBs = +(totalUsd * settings.bsDifferential * settings.bcvRate).toFixed(2);
    const order = {
      id,
      userId,
      orderNumber: generateOrderNumber2(),
      items: data.items,
      subtotalUsd: +(subtotalUsd - shippingUsd).toFixed(2),
      shippingUsd,
      totalUsd,
      totalBs,
      paymentMethod: data.paymentMethod,
      paymentProof: "",
      status: "pending_payment",
      branch: data.branch,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress || "",
      estimatedDelivery: calculateEstimatedDelivery2(),
      amazonCartUrl: buildAmazonCartUrl2(data.items),
      notes: data.notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.orders.set(id, order);
    return order;
  }
  async getOrder(id) {
    return this.orders.get(id);
  }
  async getOrderByNumber(orderNumber) {
    return Array.from(this.orders.values()).find((o) => o.orderNumber === orderNumber);
  }
  async getUserOrders(userId) {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getAllOrders(filters) {
    let orders = Array.from(this.orders.values());
    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async updateOrderStatus(id, status) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    order.status = status;
    this.orders.set(id, order);
    return order;
  }
  async updateOrder(id, data) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updated = { ...order, ...data, id };
    this.orders.set(id, updated);
    return updated;
  }
  // ===== WISHLIST =====
  async getWishlist(userId) {
    const items = Array.from(this.wishlist.values()).filter((w) => w.userId === userId);
    return items.map((w) => ({
      ...w,
      product: this.products.get(w.productId)
    }));
  }
  async addToWishlist(userId, productId) {
    const existing = Array.from(this.wishlist.values()).find(
      (w) => w.userId === userId && w.productId === productId
    );
    if (existing) return existing;
    const id = (0, import_crypto2.randomUUID)();
    const item = { id, userId, productId };
    this.wishlist.set(id, item);
    return item;
  }
  async removeFromWishlist(userId, productId) {
    for (const [key, item] of this.wishlist.entries()) {
      if (item.userId === userId && item.productId === productId) {
        this.wishlist.delete(key);
        break;
      }
    }
  }
  // ===== REVIEWS =====
  async getProductReviews(productId) {
    return Array.from(this.reviews.values()).filter((r) => r.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createReview(userId, userName, data) {
    const id = (0, import_crypto2.randomUUID)();
    const review = {
      id,
      userId,
      userName,
      productId: data.productId,
      orderId: data.orderId || "",
      rating: data.rating,
      comment: data.comment,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.reviews.set(id, review);
    return review;
  }
  // ===== SETTINGS =====
  async getSetting(key) {
    return this.settings.get(key);
  }
  async setSetting(key, value) {
    this.settings.set(key, value);
  }
  async getAllSettings() {
    return Array.from(this.settings.entries()).map(([key, value]) => ({ key, value }));
  }
  // ===== DASHBOARD =====
  async getDashboardStats() {
    const orders = Array.from(this.orders.values());
    const now = /* @__PURE__ */ new Date();
    const today = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 864e5);
    const monthAgo = new Date(now.getTime() - 30 * 864e5);
    const todaySales = orders.filter((o) => o.createdAt.startsWith(today) && o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const weekSales = orders.filter((o) => new Date(o.createdAt) >= weekAgo && o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const monthSales = orders.filter((o) => new Date(o.createdAt) >= monthAgo && o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const totalRevenue = orders.filter((o) => o.status !== "pending_payment").reduce((sum, o) => sum + o.totalUsd, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending_payment").length;
    const totalCustomers = Array.from(this.users.values()).filter((u) => u.role === "customer").length;
    return {
      todaySales: +todaySales.toFixed(2),
      weekSales: +weekSales.toFixed(2),
      monthSales: +monthSales.toFixed(2),
      totalRevenue: +totalRevenue.toFixed(2),
      pendingOrders,
      totalCustomers,
      totalOrders: orders.length,
      totalProducts: this.products.size,
      recentOrders: orders.slice(0, 10)
    };
  }
};
var storage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();

// server/routes.ts
init_schema();
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);

// server/canopy.ts
var CANOPY_API_KEY = process.env.CANOPY_API_KEY || "";
var REST_BASE = "https://rest.canopyapi.co";
function parseWeightToLbs(weightStr) {
  if (!weightStr) return null;
  const match = weightStr.match(/([\d.]+)\s*(pounds?|lbs?|ounces?|oz|kilograms?|kg|grams?|g)\b/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (isNaN(value) || value <= 0) return null;
  const unit = match[2].toLowerCase();
  if (unit.startsWith("pound") || unit.startsWith("lb")) return +value.toFixed(2);
  if (unit.startsWith("ounce") || unit === "oz") return +(value / 16).toFixed(2);
  if (unit.startsWith("kilogram") || unit === "kg") return +(value * 2.20462).toFixed(2);
  if (unit.startsWith("gram") || unit === "g") return +(value * 220462e-8).toFixed(2);
  return null;
}
async function getProductWeight(asin) {
  if (!CANOPY_API_KEY) return { itemWeight: null, packageWeight: null, rawItem: null, rawPackage: null };
  try {
    const query = `query { amazonProduct(input: { asin: "${asin}" }) { itemWeight packageWeight } }`;
    const res = await fetch(GRAPHQL_BASE, {
      method: "POST",
      headers: { "API-KEY": CANOPY_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(1e4)
    });
    if (!res.ok) return { itemWeight: null, packageWeight: null, rawItem: null, rawPackage: null };
    const data = await res.json();
    const product = data?.data?.amazonProduct;
    return {
      itemWeight: parseWeightToLbs(product?.itemWeight),
      packageWeight: parseWeightToLbs(product?.packageWeight),
      rawItem: product?.itemWeight || null,
      rawPackage: product?.packageWeight || null
    };
  } catch {
    return { itemWeight: null, packageWeight: null, rawItem: null, rawPackage: null };
  }
}
var UNSENDABLE_PATTERNS = [
  // Gym equipment - large steel structures
  { pattern: /\bpower\s*(cage|racks?)\b/i, reason: "Power cage/rack" },
  { pattern: /\bsquat\s*racks?\b/i, reason: "Squat rack" },
  { pattern: /\bsmith\s*machine\b/i, reason: "Smith machine" },
  { pattern: /\bcable\s*crossover\b/i, reason: "Cable crossover" },
  { pattern: /\bfunctional\s*trainer\b/i, reason: "Functional trainer" },
  { pattern: /\bhalf\s*rack\b/i, reason: "Half rack" },
  { pattern: /\bpower\s*tower\b/i, reason: "Power tower" },
  { pattern: /\b(weight|cable)\s*stack\s*(machine|system)\b/i, reason: "Weight stack machine" },
  { pattern: /\bhome\s*gym\b.*\b(weight\s*stack|150\s*lb|pulley|lat\s*pull|cable|multifunction|complete\s*workout|strength\s*training)(?!.{0,30}\b(band|tube|bar\s*kit|resistance|pilates|yoga|rope|pedal)\b)/i, reason: "Home gym system" },
  { pattern: /\b(multifunctional|multifunction)\b.*\b(home\s*gym|strength\s*training)\b.*\b(workout|equipment|machine|training)(?!.{0,30}\b(band|tube|bar\s*kit|resistance|pilates|yoga|rope|pedal)\b)/i, reason: "Home gym system" },
  { pattern: /\b(bowflex|harison|mikolo|sincmill|total\s*gym)\b.*\b(home\s*gym|gym\s*(system|machine|station)|workout\s*system)/i, reason: "Home gym system" },
  { pattern: /\bgym\s*(monster|station)\b/i, reason: "Gym station" },
  // Heavy benches
  { pattern: /\bweight\s*bench\b/i, reason: "Weight bench" },
  { pattern: /\bbench\s*press\b(?!.{0,20}\b(pad|grip|shirt|sleeve|barbell\s*pad|hip\s*thrust|squat\s*pad)\b)/i, reason: "Bench press" },
  // Cardio machines (with exclusions for accessories/mats)
  { pattern: /\btreadmill\b(?!.{0,40}\b(mat|cover|lubricant|belt|oil|key|desk|clip|pad|protection|floor)\b)/i, reason: "Treadmill" },
  { pattern: /\belliptical\s*(machine|trainer)?\b(?!.{0,20}\b(mat|pad|desk|under|mini|portable)\b)/i, reason: "Elliptical" },
  { pattern: /\b(stationary|exercise|spin|recumbent|indoor\s*cycling?)\s*bike\b(?!.{0,20}\b(seat|cover|pedal|cushion)\b)/i, reason: "Stationary bike" },
  { pattern: /\browing\s*machine\b(?!.{0,40}\b(seat|pad|handle|cushion|foldable|plegable|squat|compact|portable)\b)/i, reason: "Rowing machine" },
  // Large appliances (careful negative lookaheads to avoid accessories)
  { pattern: /\b(upright\s*)?refrigerator\b(?!.{0,40}\b(mat|magnet|organizer|bin|shelf|light|thermometer|filter|seal|mini|fridge|deodorizer|odor|freshener|cleaner)\b)/i, reason: "Refrigerator" },
  { pattern: /\bwashing\s*machine\b(?!.{0,40}\b(cleaner|clean|tab|detergent|cover|hose|filter|mini|portable|limpiador|affresh|descaler)\b)/i, reason: "Washing machine" },
  // Large furniture — broad patterns to block ALL unshippable furniture
  { pattern: /\bsofas?\b(?!.{0,20}\b(cover|slipcover|leg|cushion\s*cover|throw|blanket)\b)/i, reason: "Furniture: sofa" },
  { pattern: /\bcouch(es)?\b(?!.{0,20}\b(cover|slipcover|cushion\s*cover|throw|blanket)\b)/i, reason: "Furniture: couch" },
  { pattern: /\bloveseats?\b(?!.{0,20}\b(cover|slipcover)\b)/i, reason: "Furniture: loveseat" },
  { pattern: /\bsectionals?\b(?!.{0,20}\b(cover|slipcover)\b)/i, reason: "Furniture: sectional" },
  { pattern: /\bfutons?\b(?!.{0,20}\b(cover|slipcover|sheet)\b)/i, reason: "Furniture: futon" },
  { pattern: /\bmattress(es)?\b(?!.{0,20}\b(protector|cover|pad|topper|bag|encasement)\b)/i, reason: "Furniture: mattress" },
  { pattern: /\bbed\s*frame(s)?\b(?!.{0,20}\b(bracket|stopper|wheel|pad|riser)\b)/i, reason: "Furniture: bed frame" },
  { pattern: /\bbunk\s*bed(s)?\b/i, reason: "Furniture: bunk bed" },
  { pattern: /\bheadboard(s)?\b/i, reason: "Furniture: headboard" },
  { pattern: /\bwardrobe(s)?\b/i, reason: "Furniture: wardrobe" },
  { pattern: /\bdresser(s)?\b/i, reason: "Furniture: dresser" },
  { pattern: /\bbookcase(s)?\b/i, reason: "Furniture: bookcase" },
  { pattern: /\brecliner(s)?\b(?!.{0,20}\b(cover|slipcover|cushion)\b)/i, reason: "Furniture: recliner" },
  { pattern: /\barmchair(s)?\b(?!.{0,20}\b(cover|slipcover|cushion)\b)/i, reason: "Furniture: armchair" },
  { pattern: /\bottomans?\b(?!.{0,20}\b(cover|slipcover|tray)\b)/i, reason: "Furniture: ottoman" },
  { pattern: /\bdining\s*table(s)?\b/i, reason: "Furniture: dining table" },
  { pattern: /\bdesk(s)?\b(?!.{0,20}\b(mat|pad|lamp|organizer|shelf|clock|fan|accessory|calendar|tray)\b)/i, reason: "Furniture: desk" },
  { pattern: /\bcabinet(s)?\b(?!.{0,20}\b(knob|handle|pull|hinge|lock|liner|organizer|bumper)\b)/i, reason: "Furniture: cabinet" },
  { pattern: /\bvanity\b(?!.{0,20}\b(mirror|light|bulb|organizer|tray|brush|bag)\b)/i, reason: "Furniture: vanity" },
  // Tables, stands, shelves — assembled furniture too large/heavy for air
  { pattern: /\bnightstand(s)?\b/i, reason: "Furniture: nightstand" },
  { pattern: /\bnight\s+stand(s)?\b/i, reason: "Furniture: night stand" },
  { pattern: /\bbedside\s+(table|stand|cargador|storage)\b/i, reason: "Furniture: bedside table" },
  { pattern: /\btv\s*(stand|soporte|console)(s)?\b/i, reason: "Furniture: TV stand" },
  { pattern: /\bentertainment\s*center(s)?\b/i, reason: "Furniture: entertainment center" },
  { pattern: /\bcoffee\s*table(s)?\b(?!.{0,20}\b(book|mat|cover|coaster|tray|runner)\b)/i, reason: "Furniture: coffee table" },
  { pattern: /\bend\s*table(s)?\b/i, reason: "Furniture: end table" },
  { pattern: /\bside\s*table(s)?\b/i, reason: "Furniture: side table" },
  { pattern: /\baccent\s*table(s)?\b/i, reason: "Furniture: accent table" },
  { pattern: /\bconsole\s*table(s)?\b/i, reason: "Furniture: console table" },
  { pattern: /\bshoe\s*(rack|organizer|shelf|storage|tower)(s)?\b/i, reason: "Furniture: shoe rack" },
  { pattern: /\bfloor\s*lamp(s)?\b/i, reason: "Furniture: floor lamp" },
  { pattern: /\bcorner\s*(shelf|shelves|stand|tower)\b/i, reason: "Furniture: corner shelf" },
  { pattern: /\bstanding\s*shelf\b|\bshelf\s*organizer\b|\bshelving\s*unit(s)?\b/i, reason: "Furniture: shelving unit" },
  { pattern: /\bstorage\s*(cart|rack|tower|shelf)(s)?\b(?!.{0,20}\b(bag|bin|box|container|basket|pouch)\b)/i, reason: "Furniture: storage unit" },
  { pattern: /\bpatio\s*(furniture|set|conversation)\b/i, reason: "Furniture: patio set" },
  { pattern: /\boutdoor\s*(furniture|wicker|sofa|table\s*set)\b/i, reason: "Furniture: outdoor furniture" },
  { pattern: /\bgaming\s*(desk|chair|table)\b/i, reason: "Furniture: gaming furniture" },
  { pattern: /\boffice\s*chair(s)?\b/i, reason: "Furniture: office chair" },
  { pattern: /\bbar\s*(stool|cart|table)(s)?\b(?!.{0,20}\b(cover|pad|cushion|cap|protector)\b)/i, reason: "Furniture: bar furniture" },
  { pattern: /\bbookshelf\b|\bbook\s*shelf\b|\bbook\s*shelves\b/i, reason: "Furniture: bookshelf" },
  { pattern: /\bwriting\s*desk\b|\bcomputer\s*desk\b|\bstanding\s*desk\b/i, reason: "Furniture: desk" },
  // Outdoor/recreation
  { pattern: /\bpool\s*table\b(?!.{0,20}\b(cover|cloth|chalk|cue|ball)\b)/i, reason: "Pool table" },
  { pattern: /\btrampoline\b(?!.{0,20}\b(pad|spring|net|mat|cover|mini|fitness|rebounder)\b)/i, reason: "Trampoline" },
  // HAZMAT / Chemicals / Bulk liquids — CANNOT ship by air
  { pattern: /\b\d+\s*gallon.*\b(bleach|chlorine|cloro|chemical|acid|ammonia|detergent)\b/i, reason: "Bulk chemical liquid (HAZMAT)" },
  { pattern: /\b(bleach|chlorine|cloro)\b.*\b\d+\s*gallon/i, reason: "Bulk chemical liquid (HAZMAT)" },
  { pattern: /\b(muriatic|hydrochloric|sulfuric)\s*acid\b/i, reason: "Corrosive acid (HAZMAT)" },
  { pattern: /\bgasoline\b|\bkerosene\b|\bpropane\s*(tank|cylinder)\b/i, reason: "Flammable fuel (HAZMAT)" },
  { pattern: /\bammonia\b(?!.{0,20}\b(free|fragrance)\b)/i, reason: "Ammonia (HAZMAT)" },
  { pattern: /\bpesticide\b|\bherbicide\b|\binsecticide\b.*\b(gallon|concentrate)\b/i, reason: "Pesticide (HAZMAT)" },
  { pattern: /\bpool\s*(chlorine|shock|chemical)\b.*\b(\d+\s*lb|gallon|bucket)\b/i, reason: "Pool chemicals (HAZMAT)" },
  { pattern: /\b(5|6|10|15|20|25|30|40|50|55)\s*gallon\b(?!.{0,30}\b(bag|trash|garbage|storage|container|pot|planter|drum\s*liner|liner)\b)/i, reason: "Bulk liquid (too heavy for air)" },
  // Industrial
  { pattern: /\btable\s*saw\b(?!.{0,20}\b(blade|fence|guard|jig|insert)\b)/i, reason: "Table saw" },
  { pattern: /\blawn\s*mower\b(?!.{0,20}\b(blade|belt|filter|cover|wheel|part)\b)/i, reason: "Lawn mower" },
  // Dumbbells, weights, barbells — ALL too heavy for air shipping
  { pattern: /\bdumbbell(s)?\b(?!.{0,20}\b(rack only|stand only|storage only)\b)/i, reason: "Gym: dumbbell" },
  { pattern: /\bmancuerna(s)?\b/i, reason: "Gym: mancuerna" },
  { pattern: /\bbarbell\b(?!.{0,20}\b(pad|mat|yoga|clamp|collar|clip)\b)/i, reason: "Gym: barbell" },
  { pattern: /\bkettlebell(s)?\b/i, reason: "Gym: kettlebell" },
  { pattern: /\bpesas?\s*(libres?|rusas?|ajustable|de\s*tobillo)\b/i, reason: "Gym: pesas" },
  { pattern: /\bhand\s*weight(s)?\b/i, reason: "Gym: hand weights" },
  { pattern: /\bweight\s*(set|plate|bench)(s)?\b/i, reason: "Gym: weight set/bench" },
  { pattern: /\bbanco\s*de\s*pesas\b/i, reason: "Gym: banco de pesas" },
  { pattern: /\b(home|gimnasio\s*en)\s*(gym|casa)\b.*\b(weight|pila|station|equipo|system|multifuncional)\b/i, reason: "Gym: home gym system" },
  { pattern: /\b(dumbbell|weight)\s*(set|kit)\b.*\b(rack|stand|tree|tower)\b/i, reason: "Gym: weight set with rack" },
  { pattern: /\b(rack|stand|tree|tower)\b.*\b(dumbbell|weight)\s*(set|kit)\b/i, reason: "Gym: weight set with rack" },
  // Gaming cockpit
  { pattern: /\bgaming\s*(cockpit|workstation|pod)\b/i, reason: "Gaming cockpit" },
  // Drones — restricted for air shipping (exclude toys, LEGO, orb balls)
  { pattern: /\bdrone\b(?!.{0,30}\b(toy|lego|orb|ball|costume|cosplay|spaceship|space|interstellar)\b)(?<!\b(boomerang|magic|flying\s*orb|lego|toy|space)\s*)/i, reason: "Drone" },
  { pattern: /\bdji\s+(mini|mavic|air|avata|phantom|fpv|inspire)\b/i, reason: "DJI drone" },
  { pattern: /\bquadcopter\b(?!.{0,20}\b(toy|mini|kids)\b)/i, reason: "Quadcopter/drone" },
  { pattern: /\b(fpv|uav)\s+(drone|fly|camera|kit|combo)\b/i, reason: "FPV/UAV drone" }
];
function isUnsendable(name) {
  for (const { pattern, reason } of UNSENDABLE_PATTERNS) {
    if (pattern.test(name)) return reason;
  }
  const allLbMatches = name.match(/(\d+)\s*(?:lbs?|pounds?)\b/gi);
  if (allLbMatches) {
    const maxWeight = Math.max(...allLbMatches.map((m) => parseInt(m)));
    if (maxWeight >= 80) return `Product indicates ${maxWeight} lbs in name (exceeds air shipping limit)`;
  }
  const kgMatches = name.match(/(\d+)\s*(?:kg|kilograms?)\b/gi);
  if (kgMatches) {
    const maxKg = Math.max(...kgMatches.map((m) => parseInt(m)));
    if (maxKg >= 35) return `Product indicates ${maxKg} kg in name (exceeds air shipping limit)`;
  }
  return null;
}
var MAX_CATEGORY_WEIGHT = {
  phones: 3,
  beauty: 5,
  health: 15,
  clothing: 5,
  shoes: 5,
  toys: 10,
  gaming: 10,
  tech: 15,
  office: 10,
  food: 30,
  pets: 40,
  home: 20,
  baby: 20,
  sports: 50,
  auto: 15,
  default: 10
};
function estimateWeightByName(name, category) {
  const t = name.toLowerCase();
  if (/fire tv stick|streaming stick|roku stick|chromecast|dongle/.test(t)) return 0.5;
  if (/earbuds?|airpods?|in-ear|auricular|audifonos?/.test(t)) return 0.3;
  if (/phone case|funda|screen protector|protector.*pantalla|pop socket/.test(t)) return 0.3;
  if (/memory card|sd card|flash drive|pendrive|thumb drive/.test(t)) return 0.1;
  if (/remote|control remoto/.test(t)) return 0.3;
  if (/\bplug\b|smart plug|enchufe/.test(t)) return 0.3;
  if (/\bsticker\b|\bdecal\b|\bpatch\b|\bbookmark\b|\bpin\b|\bkeychain\b/.test(t)) return 0.2;
  if (/\blip\s?balm|lip\s?gloss|nail\s?polish|mascara/.test(t)) return 0.3;
  if (/\bbandage|band-?aid|adhesive.*strip/.test(t)) return 0.3;
  if (/\bring\b(?!.*light|.*doorbell)/.test(t) && /\b(silver|gold|wedding|engagement|band|jewelry)\b/.test(t)) return 0.1;
  if (/charger|cable|hdmi|\busb\b|adapter|adaptador|\bhub\b|cargador/.test(t)) return 0.5;
  if (/\bmouse\b|\bmice\b|raton|ratón/.test(t) && !/mouse\s*pad|mouse\s*mat|desk\s*mat/.test(t)) return 0.5;
  if (/smart\s?watch|reloj.*inteligente|fitbit|fitness.*tracker/.test(t)) return 0.5;
  if (/cream|serum|lotion|shampoo|soap|perfume|makeup|sponge/.test(t)) return 0.5;
  if (/protein.*shake|shake.*protein/.test(t)) {
    const packMatch = t.match(/pack\s+of\s+(\d+)|(\d+)\s*[-]?\s*(?:pack|count|ct)\b/i);
    const packSize = packMatch ? parseInt(packMatch[1] || packMatch[2]) : 0;
    if (packSize >= 10) return 10;
    if (packSize >= 4) return 5;
    return 3;
  }
  if (/protein.*powder|whey.*protein|creatine.*powder/.test(t)) {
    const ozMatch = t.match(/(\d+\.?\d*)\s*(?:oz|ounce)/i);
    if (ozMatch && parseFloat(ozMatch[1]) > 30) return 3.5;
    return 2;
  }
  if (/\bpre-?workout\b|\bbcaa\b|\bamino\b|\bcollagen\b.*powder/.test(t)) return 1.5;
  if (/vitamin|supplement|capsule|tablet|softgel|gummies/i.test(t)) return 0.5;
  if (/\bbattery\b|\bbatteries\b|pila/.test(t)) return 0.5;
  if (/\bwhisk\b|\bpeeler\b|\bcan\s*opener|\bspatula|\btongs\b|\bladle\b/.test(t)) return 0.5;
  if (/herb\s*stripper|garlic\s*press|bottle\s*opener/.test(t)) return 0.3;
  if (/\bseat\s*cover\b(?!.*car\s*seat)/.test(t) && /chair|office|computer/.test(t)) return 1;
  if (/\bled\b.*\b(strip|tape)\b|\blight\s*strip\b/.test(t)) return 0.5;
  if (/mouse\s*pad|mouse\s*mat|desk\s*mat|desk\s*pad|gaming.*pad|gaming.*mat/.test(t)) return 1.5;
  if (/\bxxl\b.*\b(pad|mat)\b|\bpad\b.*\bxxl\b|extended.*gaming.*pad/.test(t)) return 2;
  if (/\bled\b.*\b(luz|light)\b.*\bbar\b|\blight\s*bar\b|\bluz\s*bar\b|\bbacklight\b|\bmonitor.*light/.test(t)) return 1.5;
  if (/\brgb\b.*\b(bar|luz|light)\b/.test(t)) return 1.5;
  if (/tv\s*backlight|bias\s*light|ambient.*light|immersive.*led/.test(t)) return 1;
  if (/keyboard|teclado/.test(t)) return 1.5;
  if (/headphone|headset|speaker.*portable|bocina|altavoz/.test(t)) return 1.5;
  if (/controller|gamepad|joystick/.test(t)) return 1;
  if (/shirt|camiseta|camisa|blouse|blusa|t-?shirt/.test(t)) return 0.8;
  if (/pants|pantalon|jeans|shorts/.test(t)) return 1;
  if (/jacket|chaqueta|hoodie|sweater|coat/.test(t)) return 1.5;
  if (/shoes|sneaker|boot|zapatos|zapatillas|tenis|sandal/.test(t)) return 2;
  if (/backpack|mochila|bag|bolso|purse|cartera/.test(t)) return 2;
  if (/toy|juguete|plush|peluche|lego|puzzle/.test(t)) return 2;
  if (/tablet|ipad|kindle|fire hd/.test(t)) return 1.5;
  if (/camera|camara|gopro|webcam/.test(t)) return 1.5;
  if (/router|modem|wifi|extender/.test(t)) return 1.5;
  if (/microphone|microfono/.test(t)) return 1.5;
  if (/bottle|botella|tumbler|cup|taza|mug/.test(t)) return 1;
  if (/\bpillow\b|\balmohada\b|\bcushion\b/.test(t)) return 2;
  if (/\bbook\b|\blibro\b(?!.*shelf|.*case|.*rack)/.test(t)) return 1.5;
  if (/\bwipe|toallita|pañal|diaper/.test(t)) return 2;
  if (/flash\s*light|\blinterna\b|\btorch\b/.test(t)) return 0.5;
  if (/\bgaming\b.*\b(microphone|mic)\b|\bcondenser.*mic/.test(t)) return 2;
  if (/laptop|chromebook|macbook|notebook/.test(t)) return 5;
  if (/monitor|pantalla/.test(t) && !/\bstand\b|\bmount\b|\bprotector\b/.test(t)) return 8;
  if (/\btv\b|television|televisor/.test(t)) return 8;
  if (/printer|impresora/.test(t)) return 10;
  if (/vacuum|aspiradora/.test(t)) return 8;
  if (/blender|licuadora|mixer|batidora/.test(t)) return 6;
  if (/coffee.*maker|cafetera|espresso/.test(t)) return 6;
  if (/air\s?fryer|freidora/.test(t)) return 8;
  if (/\bcomforter\b|\bduvet\b|bed\s*in\s*a\s*bag|bedding\s*set/.test(t)) return 7;
  if (/\bblanket\b|\bcobija\b|\bthrow\b/.test(t)) return 3;
  if (/shoe\s*rack|shoe\s*organizer|shoe\s*shelf/.test(t)) return 5;
  if (/portable.*hard\s*drive|external.*hard\s*drive|\bhdd\b|\bssd\b/.test(t)) return 0.5;
  if (/\bdesk\b(?!.*mat|.*pad|.*lamp|.*organizer)/.test(t)) return 15;
  if (/cat\s*litter|arena.*gato/.test(t)) {
    const lbMatch = t.match(/(\d+\.?\d*)\s*(?:lbs?|pounds?)/);
    if (lbMatch) return Math.min(parseFloat(lbMatch[1]), 50);
    return 20;
  }
  if (/dog\s*food|cat\s*food|pet\s*food|comida.*(?:perro|gato)/.test(t)) {
    const lbMatch = t.match(/(\d+\.?\d*)\s*(?:lbs?|pounds?)/);
    if (lbMatch) return Math.min(parseFloat(lbMatch[1]), 50);
    return 15;
  }
  if (/dumbbell|pesa|barbell|weight.*set|kettlebell/.test(t)) {
    const lbMatch = t.match(/(\d+)\s*(?:lbs?|pounds?)/);
    if (lbMatch) return Math.min(parseFloat(lbMatch[1]), 100);
    return 20;
  }
  if (/gaming\s*chair|silla.*gaming|office\s*chair|silla.*oficina/.test(t)) return 35;
  if (/treadmill|caminadora|elliptical|bench.*press/.test(t)) return 40;
  if (/stroller|carriola|car\s*seat|silla.*auto|crib|cuna/.test(t)) return 15;
  if (/motor\s?oil|aceite.*motor/.test(t)) return 10;
  if (/jumper\s*cable|booster\s*cable/.test(t)) return 6;
  if (/\bvacuum\b.*\b(upright|shark|dyson|navigator)\b/.test(t)) return 15;
  if (/post-?it|sticky\s*note|nota.*adhesiva/.test(t)) return 0.3;
  if (/\bnotes?\b.*\bpad\b|notepad|cuaderno/.test(t)) return 0.5;
  if (/\bdrill\b|\bimpact.*driver\b|\bsaw\b.*\bcordless\b|\bpower.*tool.*kit\b/.test(t)) return 8;
  if (/\bscrewdriver.*set\b|\btool.*set\b/.test(t)) return 3;
  const gallonMatch = t.match(/(\d+\.?\d*)\s*gallon/i);
  if (gallonMatch) return +(parseFloat(gallonMatch[1]) * 8.6).toFixed(1);
  const lbInName = t.match(/(\d+\.?\d*)\s*(?:lbs?|pounds?)/);
  if (lbInName && !/dumbbell|pesa|barbell|kettlebell|weight.*set/.test(t)) return Math.min(parseFloat(lbInName[1]), 80);
  const kgInName = t.match(/(\d+\.?\d*)\s*(?:kg|kilograms?)/);
  if (kgInName) return Math.min(+(parseFloat(kgInName[1]) * 2.2).toFixed(1), 80);
  const catW = { phones: 0.5, beauty: 0.5, health: 1, clothing: 1, shoes: 2, toys: 2, gaming: 1.5, tech: 2, office: 1.5, food: 2, pets: 2, home: 3, baby: 3, sports: 3, auto: 3 };
  return catW[category] || 2;
}
function validateWeight(weight, name, category) {
  const maxForCategory = MAX_CATEGORY_WEIGHT[category] || MAX_CATEGORY_WEIGHT.default;
  const estimate = estimateWeightByName(name, category);
  if (weight > 150) {
    return { weight: estimate, warning: `Weight ${weight} lbs exceeds 150 lb limit, using estimate ${estimate} lbs` };
  }
  const isMultipack = /\b(\d{2,})\s*[-]?\s*(pack|count|ct|cans?|bottles?|pods?|bags?|bars?)\b/i.test(name) || /pack\s+of\s+\d+/i.test(name);
  const multiplier = isMultipack ? 15 : 5;
  if (weight > estimate * multiplier && weight > maxForCategory) {
    return { weight: estimate, warning: `Weight ${weight} lbs is ${(weight / estimate).toFixed(0)}x the estimate for "${name.slice(0, 40)}", clamped to ${estimate} lbs` };
  }
  if (weight > 10 && /cable|usb|charger|mouse|earbuds?|plug|hub|adapter|remote|sponge|brush|protector|\bcase\b/i.test(name)) {
    return { weight: estimate, warning: `Small item "${name.slice(0, 30)}" had ${weight} lbs, corrected to ${estimate} lbs` };
  }
  return { weight, warning: null };
}
function getBestWeight(itemWeight, packageWeight, fallbackEstimate, productName, category) {
  let raw;
  if (packageWeight && packageWeight > 0) raw = packageWeight;
  else if (itemWeight && itemWeight > 0) raw = +(itemWeight * 1.1).toFixed(2);
  else raw = fallbackEstimate;
  if (productName && category) {
    const validated = validateWeight(raw, productName, category);
    if (validated.warning) {
      console.log(`[WEIGHT GUARD] ${validated.warning}`);
    }
    return validated.weight;
  }
  return raw;
}
async function searchProducts(query, page = 1) {
  if (!CANOPY_API_KEY) throw new Error("CANOPY_API_KEY no configurada");
  const res = await fetch(`${REST_BASE}/api/amazon/search?searchTerm=${encodeURIComponent(query)}&page=${page}`, {
    headers: {
      "API-KEY": CANOPY_API_KEY,
      "Content-Type": "application/json"
    },
    signal: AbortSignal.timeout(2e4)
  });
  if (!res.ok) {
    const text2 = await res.text().catch(() => "");
    throw new Error(`Canopy API error ${res.status}: ${text2}`);
  }
  const data = await res.json();
  const searchResults = data?.data?.amazonProductSearchResults?.productResults;
  return {
    results: searchResults?.results || [],
    pageInfo: searchResults?.pageInfo || {}
  };
}
async function getProductByAsin(asin) {
  if (!CANOPY_API_KEY) throw new Error("CANOPY_API_KEY no configurada");
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${REST_BASE}/api/amazon/product?asin=${asin}`, {
        headers: {
          "API-KEY": CANOPY_API_KEY,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(15e3)
      });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 3e3 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        const text2 = await res.text().catch(() => "");
        throw new Error(`Canopy API error ${res.status}: ${text2}`);
      }
      const data = await res.json();
      return data?.data?.amazonProduct || data;
    } catch (e) {
      if (attempt === 1 || e.name !== "TimeoutError" && e.name !== "AbortError") throw e;
      await new Promise((r) => setTimeout(r, 2e3));
    }
  }
  throw new Error(`Canopy API: max retries for ASIN ${asin}`);
}
var GRAPHQL_BASE = "https://graphql.canopyapi.co";
async function getFullProductDetail(asin) {
  if (!CANOPY_API_KEY) return null;
  try {
    const query = `query {
      amazonProduct(input: { asin: "${asin}" }) {
        title
        asin
        brand
        mainImageUrl
        imageUrls
        featureBullets
        rating
        ratingsTotal
        isPrime
        itemWeight
        packageWeight
        price { value display currency }
        variants {
          asin
          text
          price { display value }
          attributes { name value }
        }
      }
    }`;
    const res = await fetch(GRAPHQL_BASE, {
      method: "POST",
      headers: {
        "API-KEY": CANOPY_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.amazonProduct || null;
  } catch {
    return null;
  }
}
function checkShippingViability(basePrice, weight, category = "") {
  if (!basePrice || basePrice <= 0 || !weight || weight <= 0) {
    return { viable: true, ratio: 0, shippingCost: 0, reason: null };
  }
  const shippingCost = weight * 5.5;
  const ratio = shippingCost / basePrice;
  const heavyCategories = ["sports", "pets", "home"];
  const isHeavyCategory = heavyCategories.includes(category);
  const maxRatio = isHeavyCategory ? 2 : 1.5;
  if (ratio > maxRatio) {
    return {
      viable: false,
      ratio: +ratio.toFixed(2),
      shippingCost: +shippingCost.toFixed(2),
      reason: `Env\xEDo ($${shippingCost.toFixed(2)}) es ${ratio.toFixed(1)}x el precio del producto ($${basePrice.toFixed(2)}) \u2014 m\xE1ximo permitido: ${maxRatio}x`
    };
  }
  return {
    viable: true,
    ratio: +ratio.toFixed(2),
    shippingCost: +shippingCost.toFixed(2),
    reason: null
  };
}
function extractWeightFromName(name) {
  const t = name.toLowerCase();
  const isDiaper = /diaper|pull-?up|training\s*pants|underwear/i.test(t);
  const isCapacity = /resistance|capacity|load[\s-]*bearing|arm\s*trainer|twister\s*arm|exerciser|chair/i.test(t);
  const isSuction = /suction|magnetic/i.test(t);
  const hasDensity = /\d+\s*kg\s*\/\s*m|density/i.test(t);
  if (!hasDensity && !isDiaper && !isCapacity && !isSuction) {
    const kgMatch = t.match(/(\d+\.?\d*)\s*(?:kg|kilograms?)\b/i);
    if (kgMatch) {
      const idx = t.indexOf(kgMatch[0]);
      const after = t.slice(idx + kgMatch[0].length, idx + kgMatch[0].length + 5);
      if (!/^[\s]*\/\s*m/i.test(after)) {
        return +(parseFloat(kgMatch[1]) * 2.20462).toFixed(2);
      }
    }
  }
  if (!isDiaper && !isCapacity && !isSuction) {
    const lbMatch = t.match(/(\d+\.?\d*)\s*(?:lbs?|pounds?)\b/i);
    if (lbMatch) {
      return +parseFloat(lbMatch[1]).toFixed(2);
    }
  }
  const gallonMatch = t.match(/(\d+\.?\d*)\s*gallon/i);
  if (gallonMatch) {
    const isNonLiquid = /trash|garbage|bag|bucket|container|storage|pot|planter|drum\s*liner|liner|bin|tote|can\b/i.test(t);
    if (!isNonLiquid) {
      return +(parseFloat(gallonMatch[1]) * 8.3).toFixed(2);
    }
  }
  return null;
}
function checkProductShippability(name, weight) {
  const t = name.toLowerCase();
  if (weight > 50) {
    return { shippable: false, reason: `Weight ${weight} lbs exceeds 50 lb air shipping limit` };
  }
  if (/\b(sofa|couch|loveseat|sectional|futon)\b/i.test(name)) {
    return { shippable: false, reason: "Furniture: sofa/couch" };
  }
  if (/\bmattress\b/i.test(name) && !/protector|cover|pad|topper|bag|encasement/i.test(name)) {
    return { shippable: false, reason: "Furniture: mattress" };
  }
  if (/\btreadmill\b/i.test(name) && !/mat|cover|lubricant|belt|oil|key|desk|clip|pad|protection|floor/i.test(name)) {
    return { shippable: false, reason: "Heavy equipment: treadmill" };
  }
  if (/\belliptical\b/i.test(name) && !/mat|pad|desk|under|mini|portable/i.test(name)) {
    return { shippable: false, reason: "Heavy equipment: elliptical" };
  }
  if (/\bexercise\s*bike\b/i.test(name) && !/seat|cover|pedal|cushion/i.test(name)) {
    return { shippable: false, reason: "Heavy equipment: exercise bike" };
  }
  if (/\bwashing\s*machine\b/i.test(name) && !/cleaner|clean|tab|detergent|cover|hose|filter|mini|portable|limpiador|affresh|descaler/i.test(name)) {
    return { shippable: false, reason: "Heavy appliance: washing machine" };
  }
  if (/\brefrigerator\b/i.test(name) && !/mat|magnet|organizer|bin|shelf|light|thermometer|filter|seal|mini|fridge|deodorizer|odor|freshener|cleaner/i.test(name)) {
    return { shippable: false, reason: "Heavy appliance: refrigerator" };
  }
  if (/\bdishwasher\b/i.test(name) && !/dishwasher[\s-]*safe|dishwasher[\s-]*friendly|dishwasher[\s-]*clean|safe.*dishwasher|top[\s-]*rack|rack[\s-]*dishwasher/i.test(name)) {
    if (/\b(portable|countertop|built[\s-]*in|freestanding|stainless)\b.*\bdishwasher\b|\bdishwasher\b.*\b(portable|countertop|built[\s-]*in|freestanding|stainless)\b/i.test(name)) {
      return { shippable: false, reason: "Heavy appliance: dishwasher" };
    }
  }
  if (/\b(dumbbell|weight|barbell)\s*(set|kit)\b/i.test(name) && weight > 20) {
    return { shippable: false, reason: `Heavy gym equipment: ${weight} lbs` };
  }
  return { shippable: true, reason: "" };
}
function canopyToProduct(cp, category, weight = 1) {
  const basePrice = cp.price?.value || 0;
  const shippingPerLb = 5.5;
  const totalPriceUsd = +(basePrice * 1.15 + Math.max(weight, 1) * shippingPerLb).toFixed(2);
  return {
    id: 0,
    name: cp.title || "Sin nombre",
    slug: slugify(cp.title || cp.asin),
    category,
    description: cp.title || "",
    basePrice,
    weight,
    totalPriceUsd,
    image: cp.mainImageUrl || "",
    images: cp.imageUrls || (cp.mainImageUrl ? [cp.mainImageUrl] : []),
    rating: cp.rating || 0,
    reviews: cp.ratingsTotal || 0,
    badge: "",
    specs: { brand: cp.brand || "" },
    isActive: true,
    isManual: false,
    amazonAsin: cp.asin,
    descriptionEs: "",
    featuresEs: [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function slugify(text2) {
  return text2.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().slice(0, 100);
}

// server/email.ts
var import_resend = require("resend");
var _resend = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new import_resend.Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
var FROM_INFO = "CopikonUSA <info@copikonusa.com>";
var FROM_PEDIDOS = "CopikonUSA Pedidos <pedidos@copikonusa.com>";
var FROM_SOPORTE = "CopikonUSA Soporte <soporte@copikonusa.com>";
var REPLY_TO_INFO = "info@copikonusa.com";
var REPLY_TO_ADMIN = "admin@copikonusa.com";
var NAVY = "#1B2A4A";
var RED = "#E31E24";
var LIGHT_BG = "#f4f4f4";
var WHITE = "#ffffff";
function baseTemplate(title, body, preheader, footerExtra) {
  const preheaderBlock = preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : "";
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;background:${LIGHT_BG};-webkit-font-smoothing:antialiased;">
${preheaderBlock}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LIGHT_BG};padding:0;">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1);max-width:600px;width:100%;">
  <!-- Top accent bar -->
  <tr><td style="background:${RED};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <!-- Header -->
  <tr><td style="background:${NAVY};padding:24px 32px;text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      <span style="font-size:28px;font-weight:800;color:${WHITE};letter-spacing:1.5px;">COP</span><span style="font-size:28px;font-weight:800;color:${RED};letter-spacing:1.5px;">IKON</span><span style="font-size:28px;font-weight:800;color:${WHITE};letter-spacing:1.5px;">USA</span>
    </td></tr><tr><td align="center" style="padding-top:6px;">
      <span style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Tu tienda de productos americanos</span>
    </td></tr></table>
  </td></tr>
  <!-- Accent line below header -->
  <tr><td style="background:linear-gradient(90deg,${RED},${NAVY});height:3px;font-size:0;line-height:0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="width:50%;background:${RED};height:3px;font-size:0;line-height:0;">&nbsp;</td>
      <td style="width:50%;background:${NAVY};height:3px;font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px 32px 24px 32px;">
    <h2 style="color:${NAVY};margin:0 0 20px 0;font-size:22px;font-weight:700;">${title}</h2>
    ${body}
  </td></tr>
  <!-- Footer -->
  <tr><td style="border-top:1px solid #e8e8e8;background:#fafafa;padding:24px 32px;text-align:center;">
    ${footerExtra || ""}
    <!-- WhatsApp contact -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-bottom:16px;">
      <a href="https://wa.me/17869695464" style="color:${NAVY};font-size:13px;text-decoration:none;font-weight:600;">&#9742; WhatsApp: +1 (786) 969-5464</a>
    </td></tr></table>
    <!-- Social placeholders -->
    <table cellpadding="0" cellspacing="0" border="0" align="center"><tr>
      <td style="padding:0 8px;"><a href="https://instagram.com/copikonusa" style="color:#999;font-size:12px;text-decoration:none;">Instagram</a></td>
      <td style="color:#ccc;font-size:12px;">|</td>
      <td style="padding:0 8px;"><a href="https://copikonusa.com" style="color:#999;font-size:12px;text-decoration:none;">Web</a></td>
      <td style="color:#ccc;font-size:12px;">|</td>
      <td style="padding:0 8px;"><a href="https://wa.me/17869695464" style="color:#999;font-size:12px;text-decoration:none;">WhatsApp</a></td>
    </tr></table>
    <p style="color:#999;font-size:11px;margin:14px 0 0 0;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} CopikonUSA &mdash; Productos americanos al mejor precio</p>
    <p style="color:#bbb;font-size:10px;margin:6px 0 0 0;">Si no deseas recibir estos correos, puedes <a href="https://copikonusa.com" style="color:#bbb;text-decoration:underline;">cancelar tu suscripci&oacute;n</a>.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
var STATUS_LABELS = {
  pending_payment: { label: "Pendiente de Pago", icon: "\u23F3", color: "#856404", bg: "#FFF3CD" },
  payment_verified: { label: "Pago Verificado", icon: "\u2705", color: "#155724", bg: "#D4EDDA" },
  processing: { label: "En Procesamiento", icon: "\u2699\uFE0F", color: "#0c5460", bg: "#D1ECF1" },
  purchased: { label: "Comprado en USA", icon: "\u{1F6D2}", color: "#155724", bg: "#D4EDDA" },
  shipped_to_warehouse: { label: "Enviado al Almac\xE9n", icon: "\u{1F4E6}", color: "#0c5460", bg: "#D1ECF1" },
  in_warehouse: { label: "En Almac\xE9n USA", icon: "\u{1F3ED}", color: "#383d41", bg: "#E2E3E5" },
  shipped_international: { label: "En Camino a Venezuela", icon: "\u2708\uFE0F", color: "#004085", bg: "#CCE5FF" },
  in_customs: { label: "En Aduana", icon: "\u{1F3DB}\uFE0F", color: "#856404", bg: "#FFF3CD" },
  ready_for_pickup: { label: "Listo para Retirar", icon: "\u{1F389}", color: "#155724", bg: "#D4EDDA" },
  delivered: { label: "Entregado", icon: "\u2705", color: "#155724", bg: "#D4EDDA" },
  cancelled: { label: "Cancelado", icon: "\u274C", color: "#721c24", bg: "#F8D7DA" }
};
async function sendWelcomeEmail(to, customerName) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping welcome email to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_INFO,
      replyTo: REPLY_TO_INFO,
      to,
      subject: "\u{1F389} \xA1Bienvenido a CopikonUSA!",
      html: baseTemplate(
        `\xA1Hola ${customerName}!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">\xA1Bienvenido a <strong>CopikonUSA</strong>! Tu cuenta ha sido creada exitosamente.</p>
        <p style="color:#333;line-height:1.7;font-size:15px;">En CopikonUSA consigues cualquier producto de Estados Unidos al mejor precio del mercado, con env\xEDo incluido y pago en bol\xEDvares.</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 8px 0;color:${NAVY};font-weight:600;font-size:14px;">\xBFC\xF3mo funciona?</p>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#555;">
            <tr><td style="width:30px;vertical-align:top;">1\uFE0F\u20E3</td><td>Busca y selecciona tus productos</td></tr>
            <tr><td style="width:30px;vertical-align:top;">2\uFE0F\u20E3</td><td>Realiza tu pedido y paga en bol\xEDvares</td></tr>
            <tr><td style="width:30px;vertical-align:top;">3\uFE0F\u20E3</td><td>Nosotros compramos y enviamos desde USA</td></tr>
            <tr><td style="width:30px;vertical-align:top;">4\uFE0F\u20E3</td><td>Retira en tu sucursal en Venezuela</td></tr>
          </table>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${RED};color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:15px;">Explorar Productos</a>
        </div>
        <p style="color:#888;font-size:13px;text-align:center;">\xBFPreguntas? Cont\xE1ctanos por WhatsApp o escr\xEDbenos a info@copikonusa.com</p>`,
        "Tu cuenta est\xE1 lista. Explora miles de productos de USA."
      )
    });
    console.log("[Email] Welcome email sent to", to);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
async function sendOrderConfirmation(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping order confirmation to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `\u{1F4CB} Pedido ${data.orderNumber} \u2014 Recibido`,
      html: baseTemplate(
        `Pedido ${data.orderNumber}`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, hemos recibido tu pedido exitosamente.</p>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;border-bottom:1px solid #eee;width:40%;"><strong>Productos</strong></td><td style="border-bottom:1px solid #eee;">${data.products}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Total USD</strong></td><td style="border-bottom:1px solid #eee;font-weight:bold;color:${RED};font-size:16px;">$${data.totalUsd}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Total Bs</strong></td><td style="border-bottom:1px solid #eee;font-weight:600;">Bs. ${data.totalBs}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>M\xE9todo de pago</strong></td><td style="border-bottom:1px solid #eee;">${data.paymentMethod}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Sucursal</strong></td><td style="border-bottom:1px solid #eee;">${data.branch}</td></tr>
          <tr><td style="color:#666;"><strong>Entrega estimada</strong></td><td>${data.estimatedDelivery}</td></tr>
        </table>

        <div style="background:#FFF3CD;border-left:4px solid ${RED};padding:14px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#856404;font-size:14px;line-height:1.5;">\u26A0\uFE0F <strong>Importante:</strong> Tienes hasta el <strong>${data.paymentDeadline}</strong> para enviar tu comprobante de pago. De lo contrario, el pedido ser\xE1 cancelado autom\xE1ticamente.</p>
        </div>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${NAVY};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Ver Mi Pedido</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">\xBFNecesitas ayuda? Responde a este correo o cont\xE1ctanos por WhatsApp</p>`,
        "Pedido recibido. Realiza tu pago para procesarlo."
      )
    });
    console.log("[Email] Order confirmation sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}
async function sendPaymentConfirmed(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping payment confirmed to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `\u2705 Pago Confirmado \u2014 Pedido ${data.orderNumber}`,
      html: baseTemplate(
        `\xA1Pago Confirmado!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, tu pago para el pedido <strong>${data.orderNumber}</strong> ha sido verificado exitosamente.</p>

        <div style="background:#D4EDDA;border-left:4px solid #28a745;padding:16px 18px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#155724;font-size:18px;font-weight:bold;">\u2705 Monto Verificado: $${data.totalUsd}</p>
        </div>

        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 8px 0;color:${NAVY};font-weight:600;font-size:14px;">\xBFQu\xE9 sigue?</p>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#555;">
            <tr><td style="width:30px;vertical-align:top;">\u{1F6D2}</td><td>Procederemos con la compra de tus productos en USA</td></tr>
            <tr><td style="width:30px;vertical-align:top;">\u{1F4E6}</td><td>Te notificaremos cuando est\xE9n en camino</td></tr>
            <tr><td style="width:30px;vertical-align:top;">\u{1F3E2}</td><td>Entrega estimada: <strong>${data.estimatedDelivery}</strong> en <strong>${data.branch}</strong></td></tr>
          </table>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">Te mantendremos informado en cada paso del proceso</p>`,
        "Ya verificamos tu pago. Pr\xF3ximo paso: compra en USA."
      )
    });
    console.log("[Email] Payment confirmed sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending payment confirmed email:", error);
  }
}
async function sendStatusUpdate(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping status update to", to);
      return;
    }
    const statusInfo = STATUS_LABELS[data.status] || { label: data.statusLabel, icon: "\u{1F4E6}", color: "#333", bg: "#E2E3E5" };
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `${statusInfo.icon} Pedido ${data.orderNumber} \u2014 ${statusInfo.label}`,
      html: baseTemplate(
        `Actualizaci\xF3n de Pedido`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, tu pedido <strong>${data.orderNumber}</strong> tiene una actualizaci\xF3n:</p>

        <div style="background:${statusInfo.bg};border-left:4px solid ${statusInfo.color};padding:18px 20px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:${statusInfo.color};font-size:20px;font-weight:bold;">${statusInfo.icon} ${statusInfo.label}</p>
        </div>

        <table width="100%" cellpadding="8" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;width:40%;"><strong>Pedido</strong></td><td>${data.orderNumber}</td></tr>
          <tr><td style="color:#666;"><strong>Sucursal de destino</strong></td><td>${data.branch}</td></tr>
        </table>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${NAVY};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Ver Detalles del Pedido</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">\xBFPreguntas sobre tu pedido? Responde a este correo</p>`,
        `Tu pedido ${data.orderNumber} cambi\xF3 a: ${statusInfo.label}.`
      )
    });
    console.log("[Email] Status update sent to", to, "order:", data.orderNumber, "status:", data.status);
  } catch (error) {
    console.error("Error sending status update email:", error);
  }
}
async function sendPaymentReminder(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping payment reminder to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `\u23F0 Recordatorio de Pago \u2014 Pedido ${data.orderNumber}`,
      html: baseTemplate(
        `Recordatorio de Pago`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, te recordamos que tu pedido <strong>${data.orderNumber}</strong> est\xE1 pendiente de pago.</p>

        <div style="background:#FFF3CD;border-left:4px solid ${RED};padding:16px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#856404;font-size:15px;font-weight:bold;">\u23F0 Te quedan aproximadamente ${data.hoursRemaining} horas</p>
          <p style="margin:8px 0 0 0;color:#856404;font-size:14px;">Fecha l\xEDmite: <strong>${data.paymentDeadline}</strong></p>
        </div>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Total USD</strong></td><td style="border-bottom:1px solid #eee;font-weight:bold;color:${RED};font-size:16px;">$${data.totalUsd}</td></tr>
          <tr><td style="color:#666;"><strong>Total Bs</strong></td><td style="font-weight:600;">Bs. ${data.totalBs}</td></tr>
        </table>

        <p style="color:#333;line-height:1.7;font-size:14px;">Si ya realizaste el pago, por favor env\xEDa tu comprobante a trav\xE9s de tu cuenta en CopikonUSA o por WhatsApp.</p>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${RED};color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:15px;">Enviar Comprobante</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">Si el pago no se recibe antes de la fecha l\xEDmite, el pedido ser\xE1 cancelado autom\xE1ticamente.</p>`,
        "Tu pedido est\xE1 pendiente de pago."
      )
    });
    console.log("[Email] Payment reminder sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending payment reminder email:", error);
  }
}
async function sendOrderShipped(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping shipped email to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `\u2708\uFE0F \xA1Tu Pedido ${data.orderNumber} Est\xE1 en Camino!`,
      html: baseTemplate(
        `\xA1Tu Pedido Est\xE1 en Camino!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, \xA1excelentes noticias! Tu pedido <strong>${data.orderNumber}</strong> ya fue enviado desde Estados Unidos.</p>

        <div style="background:#CCE5FF;border-left:4px solid #004085;padding:18px 20px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#004085;font-size:20px;font-weight:bold;">\u2708\uFE0F En Camino a Venezuela</p>
        </div>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          ${data.trackingInfo ? `<tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Tracking</strong></td><td style="border-bottom:1px solid #eee;font-family:monospace;">${data.trackingInfo}</td></tr>` : ""}
          <tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Entrega estimada</strong></td><td style="border-bottom:1px solid #eee;">${data.estimatedDelivery}</td></tr>
          <tr><td style="color:#666;"><strong>Sucursal</strong></td><td>${data.branch}</td></tr>
        </table>

        <p style="color:#333;line-height:1.7;font-size:14px;">Te notificaremos cuando tu pedido llegue a la sucursal y est\xE9 listo para retirar.</p>

        <p style="color:#888;font-size:13px;text-align:center;">\xBFPreguntas? Responde a este correo o cont\xE1ctanos por WhatsApp</p>`,
        "Tu pedido ya est\xE1 en camino desde Estados Unidos."
      )
    });
    console.log("[Email] Order shipped email sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending order shipped email:", error);
  }
}
async function sendReadyForPickup(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping ready for pickup email to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `\u{1F389} \xA1Pedido ${data.orderNumber} Listo para Retirar!`,
      html: baseTemplate(
        `\xA1Tu Pedido Lleg\xF3!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, \xA1tu pedido <strong>${data.orderNumber}</strong> ya est\xE1 en tu sucursal listo para que lo retires!</p>

        <div style="background:#D4EDDA;border-left:4px solid #28a745;padding:18px 20px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#155724;font-size:22px;font-weight:bold;">\u{1F389} \xA1Listo para Retirar!</p>
        </div>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Sucursal</strong></td><td style="border-bottom:1px solid #eee;font-weight:600;">${data.branch}</td></tr>
          ${data.branchAddress ? `<tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Direcci\xF3n</strong></td><td style="border-bottom:1px solid #eee;">${data.branchAddress}</td></tr>` : ""}
          <tr><td style="color:#666;"><strong>Pedido</strong></td><td>${data.orderNumber}</td></tr>
        </table>

        ${data.pickupDeadlineDays ? `
        <div style="background:#FFF3CD;border-left:4px solid #ffc107;padding:12px 16px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;color:#856404;font-size:13px;">\u{1F4CC} Por favor retira tu pedido dentro de los pr\xF3ximos <strong>${data.pickupDeadlineDays} d\xEDas</strong>.</p>
        </div>` : ""}

        <p style="color:#333;line-height:1.7;font-size:14px;">Presenta tu n\xFAmero de pedido y c\xE9dula al momento de retirar.</p>

        <p style="color:#888;font-size:13px;text-align:center;">\xA1Gracias por comprar en CopikonUSA! \u{1F1FA}\u{1F1F8}\u{1F1FB}\u{1F1EA}</p>`,
        "\xA1Tu paquete lleg\xF3! Ret\xEDralo en tu sucursal."
      )
    });
    console.log("[Email] Ready for pickup email sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending ready for pickup email:", error);
  }
}
async function sendOrderCancelled(to, data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping cancellation email to", to);
      return;
    }
    await resend.emails.send({
      from: FROM_SOPORTE,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `\u274C Pedido ${data.orderNumber} \u2014 Cancelado`,
      html: baseTemplate(
        `Pedido Cancelado`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, lamentamos informarte que tu pedido <strong>${data.orderNumber}</strong> ha sido cancelado.</p>

        <div style="background:#F8D7DA;border-left:4px solid #dc3545;padding:16px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#721c24;font-size:14px;"><strong>Motivo:</strong> ${data.reason}</p>
        </div>

        ${data.refundInfo ? `
        <div style="background:#D1ECF1;border-left:4px solid #17a2b8;padding:14px 18px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;color:#0c5460;font-size:14px;"><strong>Reembolso:</strong> ${data.refundInfo}</p>
        </div>` : ""}

        <p style="color:#333;line-height:1.7;font-size:14px;">Si crees que esto es un error o necesitas ayuda, no dudes en contactarnos.</p>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${NAVY};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Seguir Comprando</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">Responde a este correo si necesitas asistencia</p>`,
        "Tu pedido ha sido cancelado."
      )
    });
    console.log("[Email] Order cancelled email sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending order cancelled email:", error);
  }
}
async function sendAdminNewOrderAlert(data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping admin alert");
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      to: REPLY_TO_ADMIN,
      subject: `\u{1F514} Nuevo Pedido ${data.orderNumber} \u2014 $${data.totalUsd}`,
      html: baseTemplate(
        `Nuevo Pedido Recibido`,
        `<div style="background:#D1ECF1;border-left:4px solid #17a2b8;padding:16px 18px;border-radius:6px;margin:16px 0;">
          <p style="margin:0 0 8px 0;color:#0c5460;font-size:16px;font-weight:bold;">\u{1F514} Nuevo pedido de ${data.customerName}</p>
          <p style="margin:0;color:#0c5460;font-size:14px;">Pedido: <strong>${data.orderNumber}</strong> \u2014 Total: <strong>$${data.totalUsd}</strong></p>
        </div>
        <p style="color:#333;font-size:14px;">${data.products}</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com/#/admin" style="background:${RED};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Ir al Panel de Admin</a>
        </div>`,
        `Nuevo pedido de ${data.customerName} por $${data.totalUsd}.`
      )
    });
    console.log("[Email] Admin new order alert sent for order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending admin new order alert:", error);
  }
}
async function sendAdminPaymentReceivedAlert(data) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[Email] RESEND_API_KEY not set, skipping admin payment alert");
      return;
    }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      to: REPLY_TO_ADMIN,
      subject: `\u{1F4B0} Pago Recibido \u2014 Pedido ${data.orderNumber}`,
      html: baseTemplate(
        `Pago Recibido`,
        `<div style="background:#D4EDDA;border-left:4px solid #28a745;padding:16px 18px;border-radius:6px;margin:16px 0;">
          <p style="margin:0 0 8px 0;color:#155724;font-size:16px;font-weight:bold;">\u{1F4B0} Comprobante de pago recibido</p>
          <p style="margin:0;color:#155724;font-size:14px;">Cliente: <strong>${data.customerName}</strong> \u2014 Pedido: <strong>${data.orderNumber}</strong> \u2014 $${data.totalUsd}</p>
        </div>
        <p style="color:#333;font-size:14px;">Verifica el pago y actualiza el estado del pedido en el panel de administraci\xF3n.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com/#/admin" style="background:${RED};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Verificar Pago</a>
        </div>`,
        `Pago recibido de ${data.customerName} \u2014 Pedido ${data.orderNumber}.`
      )
    });
    console.log("[Email] Admin payment alert sent for order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending admin payment alert:", error);
  }
}

// server/whatsapp.ts
var WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
var WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";
var WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "copikonusa_verify_2026";
var WHATSAPP_API = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;
async function sendWhatsAppMessage(to, text2) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log("[WhatsApp] Not configured, skipping message to", to);
    return;
  }
  try {
    const response = await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text2 }
      })
    });
    const data = await response.json();
    console.log("[WhatsApp] Sent message to", to, "response:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
  }
}
async function sendWhatsAppInteractiveButtons(to, bodyText, buttons) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return;
  try {
    await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      })
    });
  } catch (error) {
    console.error("[WhatsApp] Error sending interactive:", error);
  }
}
async function sendWhatsAppList(to, bodyText, buttonText, sections) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return;
  try {
    await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: bodyText },
          action: {
            button: buttonText,
            sections
          }
        }
      })
    });
  } catch (error) {
    console.error("[WhatsApp] Error sending list:", error);
  }
}
var STATUS_LABELS_ES = {
  pending_payment: "\u23F3 Pendiente de Pago",
  payment_verified: "\u2705 Pago Verificado",
  processing: "\u2699\uFE0F En Procesamiento",
  purchased: "\u{1F6D2} Comprado en USA",
  shipped_to_warehouse: "\u{1F4E6} Enviado al Almac\xE9n",
  in_warehouse: "\u{1F3ED} En Almac\xE9n USA",
  shipped_international: "\u2708\uFE0F En Camino a Venezuela",
  in_customs: "\u{1F3DB}\uFE0F En Aduana",
  ready_for_pickup: "\u{1F389} Listo para Retirar",
  delivered: "\u2705 Entregado",
  cancelled: "\u274C Cancelado"
};
function detectIntent(message) {
  const lower = message.toLowerCase().trim();
  if (/^(hola|hi|hello|hey|buenas|buenos?\s*d[ií]as?|buenas\s*tardes?|buenas\s*noches?|que tal|saludos)/i.test(lower)) return "greeting";
  if (/pedido|orden|estado|tracking|rastreo|seguimiento|mi\s*compra|COP-\d+/i.test(lower)) return "order_status";
  if (/precio|costo|cuanto|cu[aá]nto|cobran|cuesta|vale|tarifa|envio|env[ií]o/i.test(lower)) return "pricing";
  if (/pago|pagar|bol[ií]vares|transferencia|zelle|paypal|binance|cripto|usdt|m[eé]todo/i.test(lower)) return "payment";
  if (/envio|env[ií]o|entrega|llega|tarda|tiempo|d[ií]as|demora|cu[aá]nto\s*tarda|rápido|shipping/i.test(lower)) return "shipping";
  if (/sucursal|retirar|retiro|oficina|direcci[oó]n|d[oó]nde|ubicaci[oó]n/i.test(lower)) return "branches";
  if (/producto|busco|buscar|tienen|cat[aá]logo|quiero|necesito|disponible|hay/i.test(lower)) return "products";
  if (/ayuda|help|soporte|problema|queja|reclamaci[oó]n|devoluci[oó]n|reembolso/i.test(lower)) return "support";
  if (/gracias|thanks|ok|perfecto|listo|entendido|genial|excelente/i.test(lower)) return "thanks";
  if (/menu|men[uú]|opciones|opci[oó]n/i.test(lower)) return "menu";
  return "unknown";
}
function extractOrderNumber(message) {
  const match = message.match(/COP-\d+/i);
  return match ? match[0].toUpperCase() : null;
}
async function handleMessage(from, message, senderName) {
  const intent = detectIntent(message);
  console.log(`[WhatsApp Bot] From: ${from}, Intent: ${intent}, Message: "${message.substring(0, 100)}"`);
  switch (intent) {
    case "greeting": {
      await sendWhatsAppInteractiveButtons(
        from,
        `\xA1Hola${senderName ? ` ${senderName}` : ""}! \u{1F44B} Bienvenido a *CopikonUSA* \u{1F1FA}\u{1F1F8}\u{1F1FB}\u{1F1EA}

Somos tu tienda de productos americanos con env\xEDo incluido y pago en bol\xEDvares.

\xBFEn qu\xE9 puedo ayudarte?`,
        [
          { id: "menu_order_status", title: "\u{1F4CB} Mi Pedido" },
          { id: "menu_how_it_works", title: "\u2139\uFE0F \xBFC\xF3mo funciona?" },
          { id: "menu_support", title: "\u{1F4AC} Hablar con alguien" }
        ]
      );
      break;
    }
    case "order_status": {
      const orderNum = extractOrderNumber(message);
      if (orderNum) {
        const pgStorage = storage;
        const orders = await pgStorage.getAllOrders();
        const order = orders.find((o) => o.orderNumber === orderNum);
        if (order) {
          const statusLabel = STATUS_LABELS_ES[order.status] || order.status;
          const items = order.items.map((i) => `\u2022 ${i.name} (x${i.quantity})`).join("\n");
          await sendWhatsAppMessage(
            from,
            `\u{1F4CB} *Pedido ${order.orderNumber}*

Estado: ${statusLabel}
Total: $${order.totalUsd.toFixed(2)}
Sucursal: ${order.branch}
Entrega estimada: ${new Date(order.estimatedDelivery).toLocaleDateString("es-VE")}

*Productos:*
${items}

\xBFNecesitas algo m\xE1s? Escribe *men\xFA* para ver las opciones.`
          );
        } else {
          await sendWhatsAppMessage(
            from,
            `No encontr\xE9 un pedido con el n\xFAmero *${orderNum}*. \u{1F50D}

Por favor verifica el n\xFAmero e intenta de nuevo. El formato es COP-XXXXXX.

Si necesitas ayuda, escribe *soporte*.`
          );
        }
      } else {
        await sendWhatsAppMessage(
          from,
          `Para consultar tu pedido, env\xEDame el n\xFAmero de pedido. \u{1F4CB}

Ejemplo: *COP-123456*

Lo encuentras en tu email de confirmaci\xF3n o en tu cuenta de copikonusa.com`
        );
      }
      break;
    }
    case "pricing": {
      await sendWhatsAppMessage(
        from,
        `\u{1F4B0} *\xBFC\xF3mo funcionan los precios en CopikonUSA?*

Nuestros precios ya incluyen:
\u2705 Costo del producto
\u2705 Env\xEDo a\xE9reo desde USA
\u2705 Gastos de importaci\xF3n

\u{1F4B5} *Precios en d\xF3lares y bol\xEDvares*
La tasa de cambio se actualiza diariamente seg\xFAn BCV.

\u{1F4E6} *Costo de env\xEDo*: $5.50 por libra (v\xEDa a\xE9rea)

Visita \u{1F449} copikonusa.com para ver los precios actualizados de todos los productos.`
      );
      break;
    }
    case "payment": {
      await sendWhatsAppMessage(
        from,
        `\u{1F4B3} *M\xE9todos de Pago*

Aceptamos:
\u{1F3E6} Transferencia bancaria (Bs)
\u{1F4F1} Pago M\xF3vil (Bs)
\u{1F4B5} Zelle (USD)
\u{1F517} Binance Pay (USDT)

\u23F0 *Importante*: Tienes 48 horas despu\xE9s de hacer tu pedido para enviar el comprobante de pago.

Despu\xE9s de pagar, sube tu comprobante en copikonusa.com o env\xEDalo por este chat.`
      );
      break;
    }
    case "shipping": {
      await sendWhatsAppMessage(
        from,
        `\u2708\uFE0F *Env\xEDo y Entregas*

\u{1F4CD} Enviamos desde Estados Unidos directo a Venezuela
\u23F1\uFE0F Tiempo estimado: 10-15 d\xEDas h\xE1biles
\u{1F4E6} Env\xEDo a\xE9reo ($5.50/lb incluido en el precio)
\u2696\uFE0F Peso m\xE1ximo por pedido: 150 lbs

*Proceso de env\xEDo:*
1\uFE0F\u20E3 Compra verificada \u2192 Producto comprado en USA
2\uFE0F\u20E3 Enviado al almac\xE9n en USA
3\uFE0F\u20E3 Enviado por avi\xF3n a Venezuela
4\uFE0F\u20E3 Tr\xE1mites de aduana
5\uFE0F\u20E3 Listo para retirar en tu sucursal

Te notificamos en cada paso por email y WhatsApp. \u{1F4E9}`
      );
      break;
    }
    case "branches": {
      await sendWhatsAppMessage(
        from,
        `\u{1F4CD} *Sucursales CopikonUSA*

Actualmente operamos con retiro en sucursal. Al hacer tu pedido, seleccionas la sucursal m\xE1s cercana.

Para ver las sucursales disponibles y sus direcciones, visita \u{1F449} copikonusa.com y ve a la secci\xF3n de sucursales.

\xBFNecesitas ayuda con algo m\xE1s?`
      );
      break;
    }
    case "products": {
      await sendWhatsAppMessage(
        from,
        `\u{1F6CD}\uFE0F *Cat\xE1logo CopikonUSA*

Tenemos miles de productos americanos disponibles:

\u{1F4F1} Electr\xF3nica y Tecnolog\xEDa
\u{1F457} Ropa y Moda
\u{1F3E0} Hogar y Cocina
\u{1F484} Belleza y Cuidado Personal
\u{1F3CB}\uFE0F Deportes y Fitness
\u{1F9F8} Juguetes y Juegos
Y mucho m\xE1s...

\u{1F449} Busca cualquier producto en *copikonusa.com*

\xBFBuscas algo espec\xEDfico? Dime qu\xE9 necesitas y te ayudo a encontrarlo.`
      );
      break;
    }
    case "support": {
      await sendWhatsAppMessage(
        from,
        `\u{1F4AC} *Soporte CopikonUSA*

Entiendo que necesitas hablar con alguien de nuestro equipo.

Un agente te atender\xE1 lo antes posible. Mientras tanto, puedes:

\u{1F4E7} Escribirnos a: info@copikonusa.com
\u{1F310} Revisar tu pedido en: copikonusa.com

Por favor describe tu consulta aqu\xED y te responderemos pronto. \u{1F64F}`
      );
      break;
    }
    case "thanks": {
      await sendWhatsAppMessage(
        from,
        `\xA1Con gusto! \u{1F60A} Si necesitas algo m\xE1s, estoy aqu\xED para ayudarte.

Escribe *men\xFA* para ver todas las opciones. \u{1F1FA}\u{1F1F8}\u{1F1FB}\u{1F1EA}`
      );
      break;
    }
    case "menu": {
      await sendWhatsAppList(
        from,
        `\xBFEn qu\xE9 puedo ayudarte? Selecciona una opci\xF3n:`,
        "Ver opciones",
        [{
          title: "Opciones",
          rows: [
            { id: "menu_order_status", title: "\u{1F4CB} Estado de mi pedido", description: "Consulta el estado actual de tu pedido" },
            { id: "menu_how_it_works", title: "\u2139\uFE0F \xBFC\xF3mo funciona?", description: "Precios, env\xEDos y proceso de compra" },
            { id: "menu_payment", title: "\u{1F4B3} M\xE9todos de pago", description: "Formas de pago disponibles" },
            { id: "menu_shipping", title: "\u2708\uFE0F Env\xEDos y entregas", description: "Tiempos y proceso de env\xEDo" },
            { id: "menu_products", title: "\u{1F6CD}\uFE0F Productos", description: "Nuestro cat\xE1logo de productos" },
            { id: "menu_support", title: "\u{1F4AC} Hablar con soporte", description: "Contactar a un agente" }
          ]
        }]
      );
      break;
    }
    default: {
      await sendWhatsAppInteractiveButtons(
        from,
        `No estoy seguro de entender tu mensaje. \u{1F914}

\xBFEn qu\xE9 puedo ayudarte?`,
        [
          { id: "menu_order_status", title: "\u{1F4CB} Mi Pedido" },
          { id: "menu_how_it_works", title: "\u2139\uFE0F \xBFC\xF3mo funciona?" },
          { id: "menu_support", title: "\u{1F4AC} Hablar con alguien" }
        ]
      );
      break;
    }
  }
}
async function handleInteractiveResponse(from, buttonId) {
  switch (buttonId) {
    case "menu_order_status":
      await sendWhatsAppMessage(
        from,
        `Para consultar tu pedido, env\xEDame el n\xFAmero de pedido. \u{1F4CB}

Ejemplo: *COP-123456*

Lo encuentras en tu email de confirmaci\xF3n o en tu cuenta de copikonusa.com`
      );
      break;
    case "menu_how_it_works":
      await sendWhatsAppMessage(
        from,
        `\u{1F6D2} *\xBFC\xF3mo comprar en CopikonUSA?*

1\uFE0F\u20E3 *Busca* tu producto en copikonusa.com
2\uFE0F\u20E3 *Agrega* al carrito y haz tu pedido
3\uFE0F\u20E3 *Paga* en bol\xEDvares o d\xF3lares (48h para pagar)
4\uFE0F\u20E3 *Nosotros compramos* el producto en USA
5\uFE0F\u20E3 *Enviamos* por avi\xF3n a Venezuela (10-15 d\xEDas)
6\uFE0F\u20E3 *Retira* en tu sucursal \u{1F389}

Los precios incluyen todo: producto + env\xEDo + importaci\xF3n.
Pago en bol\xEDvares a tasa BCV del d\xEDa.

\u{1F449} Empieza en *copikonusa.com*`
      );
      break;
    case "menu_payment":
      await handleMessage(from, "m\xE9todos de pago", "");
      break;
    case "menu_shipping":
      await handleMessage(from, "env\xEDo y entregas", "");
      break;
    case "menu_products":
      await handleMessage(from, "productos cat\xE1logo", "");
      break;
    case "menu_support":
      await handleMessage(from, "necesito soporte", "");
      break;
    default:
      await handleMessage(from, "men\xFA", "");
  }
}
function registerWhatsAppRoutes(app2) {
  app2.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("[WhatsApp] Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      console.log("[WhatsApp] Webhook verification failed", { mode, token });
      res.sendStatus(403);
    }
  });
  app2.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const body = req.body;
      res.sendStatus(200);
      if (body?.object !== "whatsapp_business_account") return;
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (change.field !== "messages") continue;
          const value = change.value;
          if (!value?.messages) continue;
          for (const msg of value.messages) {
            const from = msg.from;
            const senderName = value.contacts?.[0]?.profile?.name || "";
            if (msg.type === "text" && msg.text?.body) {
              await handleMessage(from, msg.text.body, senderName);
            } else if (msg.type === "interactive") {
              const buttonId = msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id;
              if (buttonId) {
                await handleInteractiveResponse(from, buttonId);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[WhatsApp] Webhook error:", error);
    }
  });
  app2.post("/api/admin/whatsapp/send", async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ message: "Se requiere 'to' (tel\xE9fono) y 'message'" });
    }
    const result = await sendWhatsAppMessage(to, message);
    res.json({ sent: true, result });
  });
  app2.get("/api/admin/whatsapp/status", (_req, res) => {
    res.json({
      configured: !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID),
      hasToken: !!WHATSAPP_TOKEN,
      hasPhoneId: !!WHATSAPP_PHONE_ID,
      webhookUrl: "https://copikonusa.com/api/whatsapp/webhook",
      verifyToken: WHATSAPP_VERIFY_TOKEN
    });
  });
  console.log("[WhatsApp] Routes registered. Configured:", !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID));
}
async function sendWhatsAppOrderUpdate(phone, data) {
  if (!phone) return;
  const statusLabel = STATUS_LABELS_ES[data.status] || data.status;
  const messages = {
    payment_verified: `\u2705 *\xA1Pago confirmado!*

Hola ${data.customerName}, tu pago para el pedido *${data.orderNumber}* ha sido verificado.

Procederemos con la compra de tus productos. Te mantendremos informado.`,
    purchased: `\u{1F6D2} *\xA1Productos comprados!*

Hola ${data.customerName}, los productos de tu pedido *${data.orderNumber}* ya fueron comprados en USA.

Pronto los enviaremos a Venezuela.`,
    shipped_international: `\u2708\uFE0F *\xA1En camino!*

Hola ${data.customerName}, tu pedido *${data.orderNumber}* est\xE1 volando hacia Venezuela.

Tiempo estimado de llegada: 7-10 d\xEDas.`,
    ready_for_pickup: `\u{1F389} *\xA1Tu pedido lleg\xF3!*

Hola ${data.customerName}, tu pedido *${data.orderNumber}* est\xE1 listo para retirar en tu sucursal.

Recuerda llevar tu c\xE9dula y n\xFAmero de pedido.`,
    cancelled: `\u274C *Pedido cancelado*

Hola ${data.customerName}, tu pedido *${data.orderNumber}* ha sido cancelado.

Si tienes preguntas, cont\xE1ctanos por este medio o escribe a info@copikonusa.com`
  };
  const text2 = messages[data.status] || `\u{1F4E6} *Actualizaci\xF3n de pedido*

Hola ${data.customerName}, tu pedido *${data.orderNumber}* ha sido actualizado:

${statusLabel}

Puedes ver los detalles en copikonusa.com`;
  await sendWhatsAppMessage(phone, text2);
}

// server/translate.ts
var import_sdk = __toESM(require("@anthropic-ai/sdk"), 1);
init_db();
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");
var ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
var client = ANTHROPIC_KEY ? new import_sdk.default() : null;
var translationCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 24 * 60 * 60 * 1e3;
function getCached(key) {
  const entry = translationCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.text;
  return null;
}
function setCache(key, text2) {
  translationCache.set(key, { text: text2, timestamp: Date.now() });
  if (translationCache.size > 2e3) {
    const oldest = [...translationCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) translationCache.delete(oldest[0]);
  }
}
async function getDbTranslation(productId) {
  try {
    const db2 = getDb();
    if (!db2) return null;
    const [row] = await db2.select({
      descriptionEs: productsTable.descriptionEs,
      featuresEs: productsTable.featuresEs
    }).from(productsTable).where((0, import_drizzle_orm2.eq)(productsTable.id, productId));
    if (!row) return null;
    const desc2 = row.descriptionEs || "";
    const feats = row.featuresEs || [];
    if (desc2 || feats.length > 0) {
      return { descriptionEs: desc2, featuresEs: feats };
    }
    return null;
  } catch (e) {
    console.error("[TRANSLATE] DB read error:", e.message);
    return null;
  }
}
async function saveDbTranslation(productId, descriptionEs, featuresEs) {
  try {
    const db2 = getDb();
    if (!db2) return;
    await db2.update(productsTable).set({ descriptionEs, featuresEs }).where((0, import_drizzle_orm2.eq)(productsTable.id, productId));
  } catch (e) {
    console.error("[TRANSLATE] DB save error:", e.message);
  }
}
var PROTECTED_BRANDS = [
  "Nintendo Switch",
  "PlayStation",
  "Xbox",
  "iPhone",
  "iPad",
  "MacBook",
  "AirPods",
  "Echo Dot",
  "Fire Stick",
  "Fire TV",
  "Kindle",
  "Alexa",
  "Samsung Galaxy",
  "Google Pixel",
  "Google Nest",
  "Google Home",
  "CeraVe",
  "Neutrogena",
  "L'Oreal",
  "L'Or\xE9al",
  "Maybelline",
  "Dove",
  "Olay",
  "Pampers",
  "Huggies",
  "Luvs",
  "Nike",
  "Adidas",
  "Under Armour",
  "Puma",
  "Reebok",
  "New Balance",
  "Instant Pot",
  "KitchenAid",
  "Keurig",
  "Nespresso",
  "Vitamix",
  "Dyson",
  "Roomba",
  "iRobot",
  "Ring",
  "Bose",
  "JBL",
  "Sony",
  "LG",
  "Roku",
  "Chromecast",
  "Apple Watch",
  "Galaxy Watch",
  "Fitbit",
  "GoPro",
  "Beats",
  "Anker",
  "Logitech",
  "Crocs",
  "Converse",
  "Vans",
  "Ray-Ban",
  "Oakley",
  "Stanley",
  "YETI",
  "Hydro Flask",
  "Contigo",
  "Lego",
  "Hot Wheels",
  "Barbie",
  "Play-Doh"
].join(", ");
async function translateDescription(englishText) {
  if (!englishText || englishText.trim().length < 5) return englishText;
  const cached = getCached(`desc:${englishText}`);
  if (cached) return cached;
  if (!client) {
    return englishText;
  }
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Traduce esta descripci\xF3n de producto de Amazon al espa\xF1ol natural para consumidores venezolanos.

Reglas:
- Espa\xF1ol natural y fluido, NO traducci\xF3n literal/rob\xF3tica
- NUNCA traduzcas estas marcas/nombres de producto, d\xE9jalos exactamente como est\xE1n: ${PROTECTED_BRANDS}
- NO traduzcas nombres de modelos, n\xFAmeros de modelo, ni siglas t\xE9cnicas (USB-C, Bluetooth, WiFi, HD, LED, HDMI, NFC, etc.)
- Preserva n\xFAmeros, medidas y especificaciones t\xE9cnicas exactas
- Preserva el formato: si hay vi\xF1etas o saltos de l\xEDnea, mantenlos
- NO agregues informaci\xF3n extra ni comentarios
- Responde SOLO con la traducci\xF3n, nada m\xE1s

Texto:
${englishText}`
      }]
    });
    const translated = response.content[0].text?.trim() || englishText;
    setCache(`desc:${englishText}`, translated);
    return translated;
  } catch (e) {
    console.error("[TRANSLATE] Anthropic description error, returning original English:", e.message);
    return englishText;
  }
}
async function translateBullets(bullets) {
  if (!bullets || bullets.length === 0) return bullets;
  const cacheKey = `bullets:${bullets.join("|||")}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.split("|||");
  if (!client) {
    return bullets;
  }
  try {
    const numbered = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `Traduce estas caracter\xEDsticas de producto de Amazon al espa\xF1ol natural para consumidores venezolanos.

Reglas:
- Espa\xF1ol natural y fluido, NO traducci\xF3n literal
- NUNCA traduzcas estas marcas/nombres de producto, d\xE9jalos exactamente como est\xE1n: ${PROTECTED_BRANDS}
- NO traduzcas nombres de modelos, n\xFAmeros de modelo, ni siglas t\xE9cnicas (USB-C, Bluetooth, WiFi, HD, LED, HDMI, NFC, etc.)
- Preserva n\xFAmeros, medidas y especificaciones exactas
- Responde SOLO con las l\xEDneas traducidas, numeradas igual (1. 2. 3. etc.), sin comentarios extra

Caracter\xEDsticas:
${numbered}`
      }]
    });
    const text2 = response.content[0].text?.trim() || "";
    const translated = text2.split("\n").map((line) => line.replace(/^\d+\.\s*/, "").trim()).filter((line) => line.length > 0);
    if (translated.length === bullets.length) {
      setCache(cacheKey, translated.join("|||"));
      return translated;
    }
    console.warn("[TRANSLATE] Bullet count mismatch, returning original English");
    return bullets;
  } catch (e) {
    console.error("[TRANSLATE] Anthropic bullets error, returning original English:", e.message);
    return bullets;
  }
}

// server/routes.ts
var sessions = /* @__PURE__ */ new Map();
var SEARCH_SYNONYMS = {
  // ── ELECTRONICS & TECH ──
  "disco duro": ["hard drive", "external hard drive", "HDD", "SSD"],
  "audifonos": ["headphones", "earbuds", "earphones", "headset"],
  "aud\xEDfonos": ["headphones", "earbuds", "earphones", "headset"],
  "auriculares": ["headphones", "earbuds", "earphones"],
  "pantalla": ["monitor", "screen", "display"],
  "monitor": ["monitor", "display"],
  "teclado": ["keyboard"],
  "raton": ["mouse"],
  "rat\xF3n": ["mouse"],
  "mouse": ["mouse"],
  "cargador": ["charger", "charging"],
  "bateria": ["battery", "power bank"],
  "bater\xEDa": ["battery", "power bank"],
  "bocina": ["speaker", "bluetooth speaker"],
  "parlante": ["speaker", "bluetooth speaker"],
  "altavoz": ["speaker"],
  "corneta": ["speaker"],
  "impresora": ["printer"],
  "camara": ["camera"],
  "c\xE1mara": ["camera"],
  "camara web": ["webcam"],
  "webcam": ["webcam"],
  "reloj": ["watch", "clock"],
  "reloj inteligente": ["smartwatch", "smart watch"],
  "smartwatch": ["smartwatch", "smart watch"],
  "computadora": ["computer", "laptop", "PC"],
  "computador": ["computer", "laptop", "PC"],
  "portatil": ["laptop", "notebook"],
  "port\xE1til": ["laptop", "notebook"],
  "laptop": ["laptop"],
  "tablet": ["tablet"],
  "tableta": ["tablet"],
  "memoria": ["memory", "ram", "USB flash", "SD card"],
  "pendrive": ["USB flash drive", "flash drive"],
  "usb": ["USB", "flash drive"],
  "cable": ["cable", "cord"],
  "funda": ["case", "cover"],
  "protector": ["protector", "screen protector"],
  "protector de pantalla": ["screen protector", "tempered glass"],
  "televisor": ["TV", "smart TV", "television"],
  "television": ["TV", "smart TV", "television"],
  "televisi\xF3n": ["TV", "smart TV", "television"],
  "tele": ["TV", "smart TV"],
  "tv": ["TV", "smart TV"],
  "proyector": ["projector"],
  "router": ["router", "wifi"],
  "wifi": ["wifi", "router", "wireless"],
  "enchufe inteligente": ["smart plug"],
  "enchufe": ["plug", "smart plug", "outlet"],
  "extension electrica": ["power strip", "surge protector"],
  "regleta": ["power strip", "surge protector"],
  "drone": ["drone"],
  "dron": ["drone"],
  "microsd": ["microSD", "micro SD", "SD card"],
  "tarjeta sd": ["SD card", "microSD"],
  "adaptador": ["adapter", "converter"],
  "hub": ["hub", "USB hub"],
  "tripode": ["tripod"],
  "tr\xEDpode": ["tripod"],
  "soporte": ["stand", "mount", "holder"],
  // ── FOOD & GROCERY ──
  "proteina": ["protein", "whey protein"],
  "prote\xEDna": ["protein", "whey protein"],
  "suplemento": ["supplement"],
  "suplementos": ["supplements"],
  "vitamina": ["vitamin", "vitamins"],
  "vitaminas": ["vitamin", "vitamins"],
  "cafe": ["coffee"],
  "caf\xE9": ["coffee"],
  "te": ["tea"],
  "t\xE9": ["tea"],
  "chocolate": ["chocolate", "cocoa"],
  "galletas": ["cookies", "crackers", "biscuits"],
  "cereal": ["cereal"],
  "arroz": ["rice"],
  "pasta": ["pasta", "spaghetti"],
  "aceite": ["oil", "olive oil"],
  "aceite de oliva": ["olive oil"],
  "vinagre": ["vinegar"],
  "sal": ["salt"],
  "azucar": ["sugar"],
  "az\xFAcar": ["sugar"],
  "harina": ["flour"],
  "leche": ["milk"],
  "leche en polvo": ["powdered milk", "milk powder", "formula"],
  "formula bebe": ["baby formula", "infant formula"],
  "miel": ["honey"],
  "mantequilla": ["butter", "peanut butter"],
  "jugo": ["juice"],
  "agua": ["water"],
  "cerveza": ["beer"],
  "vino": ["wine"],
  "salsa": ["sauce"],
  "snack": ["snack", "snacks"],
  "merienda": ["snack", "snacks"],
  "chicle": ["gum"],
  "dulce": ["candy", "sweets"],
  "dulces": ["candy", "sweets"],
  "nueces": ["nuts", "almonds", "cashews"],
  "frutos secos": ["nuts", "dried fruit"],
  "avena": ["oats", "oatmeal"],
  "granola": ["granola"],
  "atun": ["tuna"],
  "at\xFAn": ["tuna"],
  // ── CLOTHING & SHOES ──
  "zapatos": ["shoes", "sneaker"],
  "zapatillas": ["shoes", "sneaker", "running shoes"],
  "tenis": ["sneaker", "running shoes", "shoes"],
  "sandalias": ["sandals"],
  "chanclas": ["flip flops", "sandals", "slides"],
  "botas": ["boots"],
  "tacones": ["heels", "high heels"],
  "camisa": ["shirt"],
  "camiseta": ["t-shirt", "tee"],
  "franela": ["t-shirt", "tee", "shirt"],
  "pantalon": ["pants", "jeans"],
  "pantal\xF3n": ["pants", "jeans"],
  "pantalones": ["pants", "jeans"],
  "short": ["shorts"],
  "bermuda": ["shorts"],
  "vestido": ["dress"],
  "falda": ["skirt"],
  "chaqueta": ["jacket"],
  "sudadera": ["hoodie", "sweatshirt"],
  "sueter": ["sweater"],
  "su\xE9ter": ["sweater"],
  "abrigo": ["coat", "jacket"],
  "gorra": ["cap", "hat"],
  "sombrero": ["hat"],
  "mochila": ["backpack"],
  "maleta": ["luggage", "suitcase", "carry on", "travel bag"],
  "maletas": ["luggage", "suitcase", "carry on", "travel bag"],
  "equipaje": ["luggage", "suitcase", "travel bag"],
  "valija": ["suitcase", "luggage"],
  "bolso": ["bag", "handbag", "tote"],
  "bolso de viaje": ["travel bag", "duffel bag", "weekender"],
  "neceser": ["toiletry bag", "makeup bag", "travel kit"],
  "cartera": ["wallet", "purse"],
  "billetera": ["wallet"],
  "lentes": ["glasses", "sunglasses"],
  "gafas": ["glasses", "sunglasses"],
  "lentes de sol": ["sunglasses"],
  "cinturon": ["belt"],
  "cintur\xF3n": ["belt"],
  "corbata": ["tie", "necktie"],
  "bufanda": ["scarf"],
  "guantes": ["gloves"],
  "medias": ["socks", "stockings"],
  "calcetines": ["socks"],
  "ropa interior": ["underwear", "boxer", "briefs"],
  "brassier": ["bra"],
  "brasier": ["bra"],
  "sost\xE9n": ["bra"],
  "traje de bano": ["swimsuit", "swimwear", "bikini"],
  "traje de ba\xF1o": ["swimsuit", "swimwear", "bikini"],
  "bikini": ["bikini", "swimsuit"],
  "pijama": ["pajamas", "sleepwear"],
  "uniforme": ["uniform"],
  // ── JEWELRY & ACCESSORIES ──
  "anillo": ["ring"],
  "pulsera": ["bracelet", "bangle"],
  "collar": ["necklace", "chain"],
  "aretes": ["earrings"],
  "pendientes": ["earrings"],
  "zarcillos": ["earrings"],
  "cadena": ["chain", "necklace"],
  "joyeria": ["jewelry"],
  "joyer\xEDa": ["jewelry"],
  "reloj hombre": ["men watch", "mens watch"],
  "reloj mujer": ["women watch", "womens watch"],
  // ── HOME & KITCHEN ──
  "almohada": ["pillow"],
  "sabanas": ["sheets", "bedding", "bed sheet"],
  "s\xE1banas": ["sheets", "bedding", "bed sheet"],
  "colchon": ["mattress"],
  "colch\xF3n": ["mattress"],
  "cobija": ["blanket", "throw"],
  "manta": ["blanket", "throw"],
  "frazada": ["blanket"],
  "edredon": ["comforter", "duvet"],
  "edred\xF3n": ["comforter", "duvet"],
  "cortina": ["curtain", "curtains", "drape"],
  "cortinas": ["curtains", "drapes"],
  "alfombra": ["rug", "carpet", "mat"],
  "tapete": ["rug", "carpet", "mat"],
  "lampara": ["lamp", "light"],
  "l\xE1mpara": ["lamp", "light"],
  "bombillo": ["light bulb", "LED bulb"],
  "foco": ["light bulb", "LED bulb"],
  "silla": ["chair"],
  "mesa": ["table", "desk"],
  "escritorio": ["desk"],
  "estante": ["shelf", "bookshelf", "rack"],
  "repisa": ["shelf"],
  "espejo": ["mirror"],
  "reloj de pared": ["wall clock"],
  "cuadro": ["painting", "wall art", "picture frame"],
  "aspiradora": ["vacuum", "vacuum cleaner"],
  "robot aspiradora": ["robot vacuum", "roomba"],
  "licuadora": ["blender"],
  "cafetera": ["coffee maker", "coffee machine", "keurig"],
  "olla": ["pot", "cooker", "instant pot"],
  "olla de presion": ["pressure cooker", "instant pot"],
  "sarten": ["pan", "skillet", "frying pan"],
  "sart\xE9n": ["pan", "skillet", "frying pan"],
  "cuchillo": ["knife"],
  "cuchillos": ["knives", "knife set"],
  "platos": ["plates", "dish", "dinnerware"],
  "vasos": ["glasses", "cups", "tumblers"],
  "taza": ["mug", "cup"],
  "tazas": ["mugs", "cups"],
  "cubiertos": ["silverware", "flatware", "utensils"],
  "tabla de picar": ["cutting board"],
  "nevera": ["refrigerator", "fridge", "mini fridge"],
  "refrigerador": ["refrigerator", "fridge"],
  "microondas": ["microwave"],
  "horno": ["oven", "toaster oven"],
  "tostadora": ["toaster"],
  "freidora de aire": ["air fryer"],
  "air fryer": ["air fryer"],
  "batidora": ["mixer", "hand mixer", "stand mixer"],
  "exprimidor": ["juicer"],
  "sandwichera": ["sandwich maker"],
  "waflera": ["waffle maker"],
  "arrocera": ["rice cooker"],
  "plancha": ["iron", "flat iron", "griddle"],
  "lavadora": ["washer", "washing machine"],
  "secadora": ["dryer"],
  "ventilador": ["fan"],
  "aire acondicionado": ["air conditioner", "AC", "portable AC"],
  "calentador": ["heater", "space heater"],
  "humidificador": ["humidifier"],
  "deshumidificador": ["dehumidifier"],
  "purificador": ["purifier", "air purifier"],
  "purificador de aire": ["air purifier"],
  "purificador de agua": ["water filter", "water purifier"],
  "filtro de agua": ["water filter"],
  "organizador": ["organizer", "storage"],
  "canasta": ["basket"],
  "cesta": ["basket"],
  "basura": ["trash can", "garbage"],
  "papelera": ["trash can", "waste basket"],
  "toallas": ["towels"],
  "toalla": ["towel"],
  // ── BEAUTY & PERSONAL CARE ──
  "maquillaje": ["makeup", "cosmetics"],
  "base de maquillaje": ["foundation", "makeup"],
  "labial": ["lipstick", "lip"],
  "rimel": ["mascara"],
  "pesta\xF1as": ["lashes", "eyelashes", "mascara"],
  "delineador": ["eyeliner"],
  "sombra de ojos": ["eyeshadow"],
  "polvo compacto": ["face powder", "compact"],
  "crema": ["cream", "lotion", "moisturizer"],
  "crema corporal": ["body lotion", "body cream"],
  "crema facial": ["face cream", "moisturizer"],
  "protector solar": ["sunscreen", "SPF", "sunblock"],
  "bloqueador solar": ["sunscreen", "sunblock"],
  "perfume hombre": ["men cologne", "men fragrance", "cologne for men"],
  "perfume mujer": ["women perfume", "women fragrance", "perfume for women"],
  "perfume": ["perfume", "cologne", "fragrance"],
  "colonia": ["cologne", "fragrance"],
  "desodorante": ["deodorant"],
  "champu": ["shampoo"],
  "champ\xFA": ["shampoo"],
  "acondicionador": ["conditioner"],
  "jabon": ["soap", "body wash"],
  "jab\xF3n": ["soap", "body wash"],
  "gel de bano": ["body wash", "shower gel"],
  "gel de ba\xF1o": ["body wash", "shower gel"],
  "pasta dental": ["toothpaste"],
  "crema dental": ["toothpaste"],
  "cepillo de dientes": ["toothbrush"],
  "hilo dental": ["dental floss", "floss"],
  "enjuague bucal": ["mouthwash"],
  "afeitadora": ["razor", "shaver"],
  "maquina de afeitar": ["razor", "shaver", "trimmer"],
  "cortadora de pelo": ["hair clipper", "trimmer"],
  "cepillo": ["brush"],
  "cepillo de pelo": ["hair brush"],
  "secador": ["dryer", "hair dryer", "blow dryer"],
  "secador de pelo": ["hair dryer", "blow dryer"],
  "plancha de pelo": ["flat iron", "hair straightener"],
  "rizador": ["curling iron"],
  "unas": ["nails", "nail polish"],
  "u\xF1as": ["nails", "nail polish"],
  "esmalte": ["nail polish"],
  // ── CLEANING & HOUSEHOLD ──
  "papel de bano": ["toilet paper", "bath tissue"],
  "papel de ba\xF1o": ["toilet paper", "bath tissue"],
  "papel higienico": ["toilet paper", "bath tissue"],
  "papel higi\xE9nico": ["toilet paper", "bath tissue"],
  "servilletas": ["napkins", "paper towels"],
  "papel toalla": ["paper towels"],
  "detergente": ["detergent", "laundry"],
  "jabon de ropa": ["laundry detergent"],
  "suavizante": ["fabric softener"],
  "cloro": ["bleach"],
  "desinfectante": ["disinfectant", "sanitizer"],
  "limpiador": ["cleaner", "cleaning"],
  "escoba": ["broom"],
  "trapeador": ["mop"],
  "esponja": ["sponge"],
  "bolsa de basura": ["trash bags", "garbage bags"],
  // ── BABY & KIDS ──
  "ropa de bebe": ["baby clothes", "baby clothing", "infant clothes"],
  "ropa bebe": ["baby clothes", "baby clothing", "infant clothes"],
  "ropa de ni\xF1o": ["boys clothes", "kids clothing"],
  "ropa de ni\xF1a": ["girls clothes", "girls clothing"],
  "ropa ni\xF1o": ["boys clothes", "kids clothing"],
  "ropa ni\xF1a": ["girls clothes", "girls clothing"],
  "ropa": ["clothes", "clothing"],
  "juguete": ["toy"],
  "juguetes": ["toys"],
  "juguetes ni\xF1os": ["kids toys", "children toys"],
  "juguetes ni\xF1as": ["girls toys"],
  "mu\xF1eca": ["doll"],
  "mu\xF1eco": ["action figure", "doll"],
  "lego": ["LEGO", "building blocks"],
  "rompecabezas": ["puzzle", "jigsaw"],
  "pa\xF1ales": ["diapers"],
  "pa\xF1al": ["diaper", "diapers"],
  "toallitas humedas": ["wipes", "baby wipes"],
  "toallitas h\xFAmedas": ["wipes", "baby wipes"],
  "biber\xF3n": ["bottle", "baby bottle"],
  "biberon": ["bottle", "baby bottle"],
  "tetero": ["baby bottle", "bottle"],
  "chupete": ["pacifier"],
  "chupon": ["pacifier"],
  "chup\xF3n": ["pacifier"],
  "coche de bebe": ["stroller"],
  "coche bebe": ["stroller"],
  "cochecito": ["stroller"],
  "silla de bebe": ["car seat", "high chair"],
  "silla de carro": ["car seat"],
  "cuna": ["crib", "bassinet"],
  "columpio": ["swing", "baby swing"],
  "andadera": ["walker", "baby walker"],
  // ── PETS ──
  "comida de perro": ["dog food"],
  "comida perro": ["dog food"],
  "comida de gato": ["cat food"],
  "comida gato": ["cat food"],
  "comida mascota": ["pet food"],
  "correa": ["leash"],
  "collar de perro": ["dog collar"],
  "arena de gato": ["cat litter"],
  "cama de perro": ["dog bed"],
  "pecera": ["fish tank", "aquarium"],
  "acuario": ["aquarium", "fish tank"],
  "juguete perro": ["dog toy"],
  "juguete gato": ["cat toy"],
  // ── SPORTS & FITNESS ──
  "pelota": ["ball"],
  "balon": ["ball"],
  "bal\xF3n": ["ball"],
  "pesas": ["weights", "dumbbells"],
  "mancuernas": ["dumbbells"],
  "bicicleta": ["bicycle", "bike"],
  "bici": ["bicycle", "bike"],
  "caminadora": ["treadmill"],
  "bicicleta estatica": ["exercise bike", "stationary bike"],
  "yoga": ["yoga", "yoga mat"],
  "colchoneta": ["mat", "yoga mat", "exercise mat"],
  "banda elastica": ["resistance band"],
  "liga": ["resistance band"],
  "cuerda de saltar": ["jump rope"],
  "guantes de boxeo": ["boxing gloves"],
  "proteina en polvo": ["protein powder", "whey"],
  "creatina": ["creatine"],
  "termo": ["water bottle", "thermos", "tumbler"],
  "botella": ["bottle", "water bottle"],
  // ── GAMING ──
  "control": ["controller"],
  "mando": ["controller"],
  "consola": ["console"],
  "videojuego": ["video game", "game"],
  "videojuegos": ["video games", "games"],
  "juego": ["game"],
  // ── AUTOMOTIVE ──
  "carro": ["car"],
  "auto": ["car", "auto"],
  "aceite de motor": ["motor oil", "engine oil"],
  "llantas": ["tires"],
  "neumaticos": ["tires"],
  "neum\xE1ticos": ["tires"],
  "limpia parabrisas": ["windshield wiper"],
  "bateria de carro": ["car battery"],
  "luces led carro": ["LED headlight", "car LED"],
  "ambientador carro": ["car air freshener"],
  "camara trasera": ["backup camera", "dash cam"],
  "dash cam": ["dash cam", "dashcam"],
  // ── OFFICE & SCHOOL ──
  "cuaderno": ["notebook", "journal"],
  "lapiz": ["pencil"],
  "l\xE1piz": ["pencil"],
  "boligrafo": ["pen"],
  "bol\xEDgrafo": ["pen"],
  "marcador": ["marker"],
  "resaltador": ["highlighter"],
  "tijeras": ["scissors"],
  "pega": ["glue"],
  "cinta adhesiva": ["tape", "adhesive tape"],
  "engrapadora": ["stapler"],
  "carpeta": ["folder", "binder"],
  "agenda": ["planner", "agenda"],
  "calculadora": ["calculator"],
  // ── TRAVEL & LUGGAGE ──
  "maleta": ["suitcase", "luggage"],
  "equipaje": ["luggage", "baggage"],
  "maleta de viaje": ["travel suitcase", "luggage set"],
  "neceser": ["toiletry bag", "travel bag"],
  "paraguas": ["umbrella"],
  "candado": ["lock", "padlock"],
  "adaptador de viaje": ["travel adapter"],
  "almohada de viaje": ["travel pillow", "neck pillow"],
  // ── HEALTH & MEDICINE ──
  "medicina": ["medicine"],
  "pastillas": ["pills", "tablets"],
  "termometro": ["thermometer"],
  "term\xF3metro": ["thermometer"],
  "tensiometro": ["blood pressure monitor"],
  "tensi\xF3metro": ["blood pressure monitor"],
  "oximetro": ["pulse oximeter"],
  "ox\xEDmetro": ["pulse oximeter"],
  "vendas": ["bandage"],
  "curitas": ["band-aid", "bandage"],
  "alcohol": ["alcohol", "rubbing alcohol"],
  "mascarilla": ["face mask", "mask"],
  "tapabocas": ["face mask", "mask"],
  // ── GARDEN & OUTDOORS ──
  "jardin": ["garden"],
  "jard\xEDn": ["garden"],
  "manguera": ["hose", "garden hose"],
  "maceta": ["pot", "planter", "flower pot"],
  "semillas": ["seeds"],
  "parrilla": ["grill", "BBQ"],
  "hamaca": ["hammock"],
  "tienda de campa\xF1a": ["tent", "camping tent"],
  "carpa": ["tent"],
  "linterna": ["flashlight", "lantern"],
  "silla plegable": ["folding chair", "camping chair"],
  // ── GENERAL MODIFIERS ──
  "hombre": ["men", "mens"],
  "mujer": ["women", "womens"],
  "ni\xF1o": ["kids", "boys", "children"],
  "ni\xF1a": ["girls"],
  "bebe": ["baby", "infant"],
  "beb\xE9": ["baby", "infant"],
  "grande": ["large", "big"],
  "peque\xF1o": ["small", "mini"],
  "barato": ["cheap", "affordable", "budget"],
  "mejor": ["best", "top rated"]
};
function expandSearchQuery(query) {
  const qLower = query.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const qOriginal = query.toLowerCase().trim();
  const patterns = [qOriginal];
  const sortedKeys = Object.keys(SEARCH_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const keyNorm = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (qLower.includes(keyNorm) || qOriginal.includes(key)) {
      for (const synonym of SEARCH_SYNONYMS[key]) {
        if (patterns.length >= 8) break;
        const expanded = qLower.replace(keyNorm, synonym);
        if (!patterns.includes(expanded)) patterns.push(expanded);
        if (!patterns.includes(synonym) && patterns.length < 8) patterns.push(synonym);
      }
      break;
    }
  }
  return patterns;
}
function translateQueryToEnglish(query) {
  const qLower = query.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const qOriginal = query.toLowerCase().trim();
  const sortedKeys = Object.keys(SEARCH_SYNONYMS).sort((a, b) => b.length - a.length);
  let translated = qLower;
  const usedKeys = /* @__PURE__ */ new Set();
  for (const key of sortedKeys) {
    const keyNorm = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (translated.includes(keyNorm) && !usedKeys.has(keyNorm)) {
      const englishTerm = SEARCH_SYNONYMS[key][0];
      translated = translated.replace(keyNorm, englishTerm);
      usedKeys.add(keyNorm);
    }
  }
  translated = translated.replace(/\s+/g, " ").trim();
  return translated || qOriginal;
}
function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function getUserIdFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return sessions.get(token) || null;
}
async function registerRoutes(httpServer2, app2) {
  const imageCache = /* @__PURE__ */ new Map();
  const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1e3;
  app2.get("/api/img", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing url parameter");
    try {
      const parsed = new URL(url);
      const allowedHosts = ["m.media-amazon.com", "images-na.ssl-images-amazon.com", "images-eu.ssl-images-amazon.com", "ecx.images-amazon.com"];
      if (!allowedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
        return res.status(403).send("Dominio no permitido");
      }
    } catch {
      return res.status(400).send("URL inv\xE1lida");
    }
    const cached = imageCache.get(url);
    if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
      res.set({
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "HIT"
      });
      return res.send(cached.data);
    }
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://www.amazon.com/"
        },
        signal: AbortSignal.timeout(15e3),
        redirect: "follow"
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const imageData = {
        data: Buffer.from(arrayBuffer),
        contentType: response.headers.get("content-type") || "image/jpeg"
      };
      if (imageCache.size > 500) {
        const oldest = [...imageCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) imageCache.delete(oldest[0]);
      }
      imageCache.set(url, { ...imageData, timestamp: Date.now() });
      res.set({
        "Content-Type": imageData.contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "MISS"
      });
      res.send(imageData.data);
    } catch (e) {
      const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
      res.set({ "Content-Type": "image/gif", "Cache-Control": "no-cache" });
      res.status(502).send(pixel);
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Este email ya est\xE1 registrado" });
      }
      const user = await storage.createUser(data);
      const token = generateToken();
      sessions.set(token, user.id);
      const { password, ...safe } = user;
      sendWelcomeEmail(user.email, user.name).catch(() => {
      });
      res.json({ user: safe, token });
    } catch (e) {
      res.status(400).json({ message: e.message || "Error en registro" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      const isHashed = user.password.startsWith("$2");
      const passwordMatch = isHashed ? await import_bcryptjs2.default.compare(data.password, user.password) : user.password === data.password;
      if (!passwordMatch) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      const token = generateToken();
      sessions.set(token, user.id);
      const { password, ...safe } = user;
      res.json({ user: safe, token });
    } catch (e) {
      res.status(400).json({ message: e.message || "Error en login" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
    const { password, ...safe } = user;
    res.json(safe);
  });
  app2.patch("/api/auth/profile", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.updateUser(userId, req.body);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const { password, ...safe } = user;
    res.json(safe);
  });
  const autocompleteCache = /* @__PURE__ */ new Map();
  app2.get("/api/autocomplete", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) return res.json([]);
    const cacheKey = q.toLowerCase();
    const cached = autocompleteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 6e4) return res.json(cached.results);
    try {
      if (!(storage instanceof PgStorage)) return res.json([]);
      const db2 = storage.db;
      const { productsTable: productsTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { sql: sqlTag } = await import("drizzle-orm");
      const searchTerms = expandSearchQuery(q);
      const likePatterns = searchTerms.map((t) => "%" + t + "%");
      const qLower = q.toLowerCase();
      const rows = await db2.execute(sqlTag`
        SELECT id, name, slug, image, total_price_usd as "totalPriceUsd", 
               rating, reviews, badge, category
        FROM products
        WHERE is_active = true AND (
          name ILIKE ${likePatterns[0]}
          ${likePatterns.length > 1 ? sqlTag`OR name ILIKE ${likePatterns[1]}` : sqlTag``}
          ${likePatterns.length > 2 ? sqlTag`OR name ILIKE ${likePatterns[2]}` : sqlTag``}
          ${likePatterns.length > 3 ? sqlTag`OR name ILIKE ${likePatterns[3]}` : sqlTag``}
          ${likePatterns.length > 4 ? sqlTag`OR name ILIKE ${likePatterns[4]}` : sqlTag``}
          ${likePatterns.length > 5 ? sqlTag`OR name ILIKE ${likePatterns[5]}` : sqlTag``}
          ${likePatterns.length > 6 ? sqlTag`OR name ILIKE ${likePatterns[6]}` : sqlTag``}
          ${likePatterns.length > 7 ? sqlTag`OR name ILIKE ${likePatterns[7]}` : sqlTag``}
        )
        ORDER BY
          CASE WHEN LOWER(name) LIKE ${qLower + "%"} THEN 100 ELSE 0 END
          + CASE WHEN LOWER(name) LIKE ${"% " + qLower + " %"} THEN 40 ELSE 0 END
          ${searchTerms.length > 1 ? sqlTag`+ CASE WHEN LOWER(name) LIKE ${searchTerms[1] + "%"} THEN 90 ELSE 0 END` : sqlTag``}
          ${searchTerms.length > 1 ? sqlTag`+ CASE WHEN LOWER(name) ILIKE ${"%" + searchTerms[1] + "%"} THEN 15 ELSE 0 END` : sqlTag``}
          + (50.0 / GREATEST(LENGTH(name), 1))
          + similarity(LOWER(name), ${qLower}) * 30
          + LEAST(COALESCE(reviews, 0)::float / 50000.0, 20)
          DESC
        LIMIT 8
      `);
      autocompleteCache.set(cacheKey, { results: rows.rows || rows, timestamp: Date.now() });
      if (autocompleteCache.size > 500) {
        const oldest = [...autocompleteCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) autocompleteCache.delete(oldest[0]);
      }
      res.json(rows.rows || rows);
    } catch (e) {
      console.error("Autocomplete error:", e.message);
      res.json([]);
    }
  });
  app2.get("/api/products", async (req, res) => {
    const { category, search, minPrice, maxPrice, minRating, sort, page, limit } = req.query;
    const searchStr = (search || "").trim();
    const searchVariants = searchStr ? expandSearchQuery(searchStr) : void 0;
    const result = await storage.getProducts({
      category,
      search: searchStr || void 0,
      searchVariants,
      minPrice: minPrice ? +minPrice : void 0,
      maxPrice: maxPrice ? +maxPrice : void 0,
      minRating: minRating ? +minRating : void 0,
      sort,
      page: page ? +page : 1,
      limit: limit ? +limit : 20
    });
    res.json(result);
  });
  app2.get("/api/products/slug/:slug", async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });
  app2.get("/api/products/category/:cat", async (req, res) => {
    const result = await storage.getProducts({ category: req.params.cat });
    res.json(result);
  });
  app2.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(+req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });
  app2.get("/api/categories", async (_req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });
  const searchCache = /* @__PURE__ */ new Map();
  const SEARCH_CACHE_TTL = 4 * 60 * 60 * 1e3;
  const WEIGHT_MAP = {
    tech: 3,
    phones: 0.5,
    gaming: 1.5,
    beauty: 0.5,
    shoes: 2,
    clothing: 1,
    home: 5,
    health: 1.5,
    baby: 3,
    sports: 3,
    pets: 2,
    food: 2,
    auto: 3,
    toys: 2,
    office: 1,
    default: 2
  };
  function estimateWeight(title, category) {
    return estimateWeightByName(title, category || "default");
  }
  function calculateCopikonPrice(amazonPrice, weightLbs) {
    const effectiveWeight = Math.max(weightLbs, 1);
    return +(amazonPrice * 1.15 + effectiveWeight * 5.5).toFixed(2);
  }
  function translateTitle(title) {
    const replacements = [
      // Amazon cleanup - MUST be first
      [/Amazon Basics/gi, "Copikon Basics"],
      [/Amazon Echo/gi, "Echo"],
      [/Amazon Fire/gi, "Fire"],
      [/Amazon Kids/gi, "Kids"],
      [/Amazon Exclusive/gi, "Exclusivo"],
      [/Amazon/gi, ""],
      // Common product descriptors
      [/\bWireless\b/gi, "Inal\xE1mbrico"],
      [/\bPortable\b/gi, "Port\xE1til"],
      [/\bRechargeable\b/gi, "Recargable"],
      [/\bWaterproof\b/gi, "Resistente al agua"],
      [/\bAdjustable\b/gi, "Ajustable"],
      [/\bFoldable\b/gi, "Plegable"],
      [/\bStainless Steel\b/gi, "Acero inoxidable"],
      [/\bNoise Cancell?ing\b/gi, "Cancelaci\xF3n de ruido"],
      // Colors
      [/\bBlack\b/g, "Negro"],
      [/\bWhite\b/g, "Blanco"],
      [/\bBlue\b/g, "Azul"],
      [/\bRed\b/g, "Rojo"],
      [/\bGreen\b/g, "Verde"],
      [/\bPink\b/g, "Rosa"],
      [/\bGold\b/g, "Dorado"],
      [/\bSilver\b/g, "Plateado"],
      [/\bGray\b/g, "Gris"],
      [/\bPurple\b/g, "Morado"],
      [/\bOrange\b/g, "Naranja"],
      [/\bYellow\b/g, "Amarillo"],
      // Prepositions & connectors
      [/\bfor\b/gi, "para"],
      [/\bwith\b/gi, "con"],
      [/\band\b/gi, "y"],
      [/\bPack of (\d+)\b/gi, "Paquete de $1"],
      [/\b(\d+)[- ]?Pack\b/gi, "Paquete de $1"],
      [/\bSet of (\d+)\b/gi, "Set de $1"],
      [/\bCompatible with\b/gi, "Compatible con"],
      // Units
      [/\bInch\b/gi, "Pulgadas"],
      [/\binches\b/gi, "Pulgadas"],
      [/\bPound\b/gi, "Libras"],
      [/\bpounds\b/gi, "Libras"],
      // Product types
      [/\bHeadphones\b/gi, "Aud\xEDfonos"],
      [/\bEarbuds\b/gi, "Auriculares"],
      [/\bSpeaker\b/gi, "Altavoz"],
      [/\bCharger\b/gi, "Cargador"],
      [/\bCase\b/g, "Funda"],
      [/\bCover\b/gi, "Funda"],
      [/\bScreen Protector\b/gi, "Protector de pantalla"],
      [/\bKeyboard\b/gi, "Teclado"],
      [/\bMouse\b/g, "Rat\xF3n"],
      [/\bLaptop\b/gi, "Port\xE1til"],
      [/\bTablet\b/gi, "Tableta"],
      [/\bWatch\b/g, "Reloj"],
      [/\bBattery\b/gi, "Bater\xEDa"],
      [/\bCable\b/gi, "Cable"],
      [/\bAdapter\b/gi, "Adaptador"],
      [/\bHolder\b/gi, "Soporte"],
      [/\bStand\b/g, "Soporte"],
      [/\bBag\b/g, "Bolsa"],
      [/\bBackpack\b/gi, "Mochila"],
      [/\bBottle\b/gi, "Botella"],
      [/\bBlanket\b/gi, "Manta"],
      [/\bPillow\b/gi, "Almohada"],
      [/\bTowel\b/gi, "Toalla"],
      [/\bShoes\b/gi, "Zapatos"],
      [/\bRunning\b/gi, "Correr"],
      [/\bTraining\b/gi, "Entrenamiento"],
      [/\bMen\b/g, "Hombre"],
      [/\bWomen\b/g, "Mujer"],
      [/\bBoys\b/g, "Ni\xF1os"],
      [/\bGirls\b/g, "Ni\xF1as"],
      [/\bKids\b/gi, "Ni\xF1os"],
      [/\bBaby\b/gi, "Beb\xE9"],
      [/\bLight\b/g, "Luz"],
      [/\bLights\b/gi, "Luces"],
      [/\bSmall\b/gi, "Peque\xF1o"],
      [/\bLarge\b/gi, "Grande"],
      [/\bMini\b/gi, "Mini"],
      [/\bHeavy Duty\b/gi, "Resistente"],
      // More product types and descriptors
      [/\bCount\b/gi, "Unidades"],
      [/\bSize\b/g, "Talla"],
      [/\bPiece\b/gi, "Pieza"],
      [/\bPieces\b/gi, "Piezas"],
      [/\bWipes\b/gi, "Toallitas"],
      [/\bScent\b/gi, "Aroma"],
      [/\bScented\b/gi, "Con aroma"],
      [/\bUnscented\b/gi, "Sin aroma"],
      [/\bOrganic\b/gi, "Org\xE1nico"],
      [/\bNatural\b/gi, "Natural"],
      [/\bPremium\b/gi, "Premium"],
      [/\bOriginal\b/gi, "Original"],
      [/\bCompatible\b/gi, "Compatible"],
      [/\bProfessional\b/gi, "Profesional"],
      [/\bHypoallergenic\b/gi, "Hipoalerg\xE9nico"],
      [/\bLightweight\b/gi, "Liviano"],
      [/\bDurable\b/gi, "Duradero"],
      [/\bWorks\b/gi, "Funciona"],
      [/\bSimple\b/gi, "Simple"],
      // Remove Amazon-specific branding phrases
      [/\bAmazon's? Choice\b/gi, ""],
      [/\bBest Seller\b/gi, ""]
    ];
    let result = title;
    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }
    result = result.replace(/\s+/g, " ").trim();
    return result;
  }
  function smartTruncateTitle(title, maxLen = 80) {
    let result = title;
    result = result.replace(/\s*\[[^\]]*\]\s*/g, " ");
    result = result.replace(/\s*\([^)]*\)\s*$/, "");
    result = result.replace(/\s*\|.*$/, "");
    if (result.length > maxLen) {
      const lastComma = result.lastIndexOf(",", maxLen);
      if (lastComma > maxLen * 0.5) {
        result = result.slice(0, lastComma);
      }
    }
    if (result.length > maxLen) {
      result = result.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
    }
    return result.replace(/\s+/g, " ").trim();
  }
  app2.get("/api/search/amazon", async (req, res) => {
    try {
      const query = (req.query.q || "").trim();
      const page = Math.max(1, Math.min(5, +(req.query.page || 1)));
      if (!query || query.length < 2) {
        return res.json({ products: [], pageInfo: {} });
      }
      const cacheKey = `${query.toLowerCase()}:${page}`;
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
        return res.json({ products: cached.results, pageInfo: cached.pageInfo, source: "cache" });
      }
      const englishQuery = translateQueryToEnglish(query);
      console.log(`[Search] "${query}" -> "${englishQuery}"`);
      const { results, pageInfo } = await searchProducts(englishQuery, page);
      const products = results.filter((r) => !r.sponsored).filter((r) => r.price?.value > 0).map((r) => {
        const amazonPrice = r.price?.value || 0;
        const weight = estimateWeight(r.title || "");
        const copikonPrice = calculateCopikonPrice(amazonPrice, weight);
        let title = (r.title || "").trim();
        title = translateTitle(title);
        title = smartTruncateTitle(title);
        return {
          asin: r.asin,
          name: title,
          image: (r.mainImageUrl || "").replace("._AC_UY218_", "._AC_SL1500_").replace("._AC_UL320_", "._AC_SL1500_"),
          amazonPrice,
          totalPriceUsd: copikonPrice,
          weight,
          rating: r.rating || 0,
          reviews: r.ratingsTotal || 0,
          isPrime: r.isPrime || false,
          badge: (r.ratingsTotal || 0) >= 5e4 ? "M\xE1s vendido" : (r.ratingsTotal || 0) >= 1e4 ? "Popular" : null
        };
      }).filter((p) => p.weight <= 150).filter((p) => !isUnsendable(p.name)).filter((p) => checkProductShippability(p.name, p.weight).shippable).filter((p) => checkShippingViability(p.amazonPrice, p.weight, "").viable).filter((p, i, arr) => arr.findIndex((x) => x.asin === p.asin) === i);
      searchCache.set(cacheKey, { results: products, pageInfo, timestamp: Date.now() });
      if (searchCache.size > 200) {
        const oldest = [...searchCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) searchCache.delete(oldest[0]);
      }
      res.json({ products, pageInfo, source: "live" });
    } catch (e) {
      console.error("Amazon search error:", e.message);
      res.status(500).json({ message: "Error buscando productos", error: e.message });
    }
  });
  app2.post("/api/search/import", async (req, res) => {
    try {
      const { asin, name, image, price, amazonPrice, totalPriceUsd: inputTotalPrice, weight: estimatedWeight, rating, reviews, badge } = req.body;
      if (!asin || !name) return res.status(400).json({ message: "Faltan datos" });
      const unsendableReason = isUnsendable(name);
      if (unsendableReason) {
        console.log(`[BLOCKED] Import rejected: "${name.slice(0, 60)}" \u2014 ${unsendableReason}`);
        return res.status(400).json({ message: "Este producto no se puede enviar por avi\xF3n. Es demasiado grande o pesado para nuestro servicio de env\xEDo." });
      }
      const pgStorage = storage;
      const db2 = pgStorage.db;
      const { productsTable: pt } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq3 } = await import("drizzle-orm");
      const existingByAsin = await db2.select().from(pt).where(eq3(pt.amazonAsin, asin)).limit(1);
      if (existingByAsin.length > 0) {
        return res.json({ slug: existingByAsin[0].slug, id: existingByAsin[0].id });
      }
      const nameLower = name.toLowerCase();
      let detectedCategory = "tech";
      const weightData = await getProductWeight(asin);
      const fallbackWeight = estimatedWeight || estimateWeight(name);
      if (/shampoo|conditioner|hair|skin|makeup|beauty|cream|serum|perfum|cologne|lotion|kerastase|olaplex/i.test(nameLower)) detectedCategory = "beauty";
      else if (/shoe|sneaker|boot|sandal|zapato|calzado|nike|adidas|jordan|new balance/i.test(nameLower)) detectedCategory = "shoes";
      else if (/shirt|pants|dress|jacket|hoodie|ropa|clothing|jeans|polo|sweater/i.test(nameLower)) detectedCategory = "clothing";
      else if (/phone|case|iphone|samsung|galaxy|cable|charger|cargador|airpod/i.test(nameLower)) detectedCategory = "phones";
      else if (/laptop|computer|keyboard|mouse|monitor|headphone|speaker|tablet|ipad|macbook|pc|ssd|ram/i.test(nameLower)) detectedCategory = "tech";
      else if (/kitchen|cook|pan|pot|blender|coffee|cocina|hogar|home|furniture|pillow|mattress|towel|lamp/i.test(nameLower)) detectedCategory = "home";
      else if (/vitamin|supplement|protein|creatine|gym|fitness|health|medicine|first aid/i.test(nameLower)) detectedCategory = "health";
      else if (/sport|exercise|yoga|running|basketball|football|soccer|ball|weight|dumbbell/i.test(nameLower)) detectedCategory = "sports";
      else if (/toy|lego|puzzle|doll|game.*board|plush|nerf|barbie|hot wheels/i.test(nameLower)) detectedCategory = "toys";
      else if (/playstation|xbox|nintendo|controller|gaming|ps5|ps4|switch/i.test(nameLower)) detectedCategory = "gaming";
      else if (/baby|toddler|diaper|stroller|pacifier|beb[eé]/i.test(nameLower)) detectedCategory = "baby";
      else if (/dog|cat|pet|mascota|collar|leash|aquarium|fish/i.test(nameLower)) detectedCategory = "pets";
      else if (/car|auto|tool|wrench|drill|garage|motor|tire/i.test(nameLower)) detectedCategory = "auto";
      else if (/office|desk|pen|printer|paper|binder|stapler/i.test(nameLower)) detectedCategory = "office";
      else if (/snack|food|candy|chocolate|coffee|tea|comida|protein.*bar/i.test(nameLower)) detectedCategory = "food";
      else if (/luggage|suitcase|maleta|travel|backpack|bag|mochila/i.test(nameLower)) detectedCategory = "home";
      const realWeight = getBestWeight(weightData.itemWeight, weightData.packageWeight, fallbackWeight, name, detectedCategory);
      const isWeightVerified = !!(weightData.itemWeight || weightData.packageWeight);
      const basePrice = amazonPrice || price || 0;
      const totalPriceUsd = +(basePrice * 1.15 + Math.max(realWeight, 1) * 5.5).toFixed(2);
      const importViability = checkShippingViability(basePrice, realWeight, detectedCategory);
      if (!importViability.viable) {
        console.log(`[BLOCKED] Import rejected shipping-prohibitive: "${name.slice(0, 60)}" \u2014 ratio ${importViability.ratio}x`);
        return res.status(400).json({ message: "Este producto tiene un costo de env\xEDo demasiado alto en relaci\xF3n a su precio. No es viable para env\xEDo a\xE9reo." });
      }
      const baseSlug = name.toLowerCase().replace(/amazon\s*/gi, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().slice(0, 80);
      const slug = `${baseSlug}-${asin.toLowerCase()}`;
      const product = await pgStorage.createProduct({
        name,
        slug,
        category: detectedCategory,
        description: name,
        basePrice,
        weight: realWeight,
        totalPriceUsd,
        image: image || "",
        images: image ? [image] : [],
        rating: rating || 0,
        reviews: reviews || 0,
        badge: badge || "",
        specs: {
          ASIN: asin,
          weightSource: isWeightVerified ? "api" : "estimated",
          rawItemWeight: weightData.rawItem,
          rawPackageWeight: weightData.rawPackage
        },
        isActive: true,
        isManual: false,
        amazonAsin: asin,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log(`Imported ${asin}: weight=${realWeight}lbs (${isWeightVerified ? "VERIFIED" : "estimated"}), price=$${totalPriceUsd}`);
      res.json({ slug: product.slug, id: product.id });
    } catch (e) {
      console.error("Import error:", e.message);
      res.status(500).json({ message: "Error importando producto" });
    }
  });
  const variantCache = /* @__PURE__ */ new Map();
  app2.get("/api/variant/:asin", async (req, res) => {
    const asin = req.params.asin;
    if (!asin) return res.json({});
    const cached = variantCache.get(asin);
    if (cached && cached.data?.price && Date.now() - cached.timestamp < 12 * 60 * 60 * 1e3) {
      return res.json(cached.data);
    }
    try {
      const existing = await storage.getProducts({ search: asin, limit: 1 });
      if (existing.products.length > 0) {
        const p = existing.products[0];
        const result = { price: p.totalPriceUsd, name: p.name, image: p.image, slug: p.slug };
        variantCache.set(asin, { data: result, timestamp: Date.now() });
        return res.json(result);
      }
      const detail = await getFullProductDetail(asin);
      if (detail && detail.price?.value > 0) {
        const amazonPrice = detail.price.value;
        const itemW = parseWeightToLbs(detail.itemWeight);
        const pkgW = parseWeightToLbs(detail.packageWeight);
        const weight = getBestWeight(itemW, pkgW, estimateWeight(detail.title || ""), detail.title || "", "");
        const copikonPrice = calculateCopikonPrice(amazonPrice, weight);
        const result = {
          price: copikonPrice,
          name: detail.title || "",
          image: detail.mainImageUrl || ""
        };
        variantCache.set(asin, { data: result, timestamp: Date.now() });
        if (variantCache.size > 500) {
          const oldest = [...variantCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
          if (oldest) variantCache.delete(oldest[0]);
        }
        return res.json(result);
      }
      res.json({});
    } catch (e) {
      console.error("Variant lookup error:", e.message);
      res.json({});
    }
  });
  const detailCache = /* @__PURE__ */ new Map();
  const DETAIL_CACHE_TTL = 12 * 60 * 60 * 1e3;
  app2.get("/api/products/:id/amazon-detail", async (req, res) => {
    try {
      const product = await storage.getProduct(+req.params.id);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
      const asin = product.amazonAsin || product.specs?.ASIN || "";
      if (!asin) return res.json({ images: [], featureBullets: [], variants: [], descriptionEs: "", featuresEs: [] });
      const cached = detailCache.get(asin);
      if (cached && Date.now() - cached.timestamp < DETAIL_CACHE_TTL) {
        return res.json(cached.data);
      }
      const [detail, dbTranslation] = await Promise.all([
        getFullProductDetail(asin),
        getDbTranslation(product.id)
      ]);
      if (!detail) return res.json({ images: [], featureBullets: [], variants: [], descriptionEs: "", featuresEs: [] });
      const rawBullets = detail.featureBullets || [];
      const rawDescription = product.description || "";
      const needsDescTranslation = rawDescription && rawDescription !== product.name && /[a-zA-Z]/.test(rawDescription);
      let translatedBullets;
      let translatedDescription;
      if (dbTranslation && dbTranslation.descriptionEs && dbTranslation.featuresEs.length > 0) {
        translatedDescription = dbTranslation.descriptionEs;
        translatedBullets = dbTranslation.featuresEs;
      } else {
        [translatedBullets, translatedDescription] = await Promise.all([
          rawBullets.length > 0 ? translateBullets(rawBullets).catch(() => rawBullets) : Promise.resolve(rawBullets),
          needsDescTranslation ? translateDescription(rawDescription).catch(() => rawDescription) : Promise.resolve(rawDescription)
        ]);
        if (translatedDescription || translatedBullets.length > 0) {
          saveDbTranslation(product.id, translatedDescription, translatedBullets).catch(() => {
          });
        }
      }
      const result = {
        images: [detail.mainImageUrl, ...detail.imageUrls || []].filter(Boolean),
        featureBullets: rawBullets,
        translatedDescription,
        descriptionEs: translatedDescription,
        featuresEs: translatedBullets,
        variants: (detail.variants || []).map((v) => ({
          asin: v.asin,
          text: v.text,
          attributes: v.attributes || []
        })),
        brand: (detail.brand || "").replace(/^Amazon$/i, "").replace(/Amazon\s+Basics/gi, "Copikon Basics")
      };
      detailCache.set(asin, { data: result, timestamp: Date.now() });
      if (detailCache.size > 300) {
        const oldest = [...detailCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) detailCache.delete(oldest[0]);
      }
      res.json(result);
    } catch (e) {
      console.error("Amazon detail error:", e.message);
      res.json({ images: [], featureBullets: [], variants: [], descriptionEs: "", featuresEs: [] });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    try {
      const data = insertOrderSchema.parse(req.body);
      const bcvRate = parseFloat(await storage.getSetting("bcv_rate") || "62");
      const shippingPerLb = parseFloat(await storage.getSetting("shipping_per_lb") || "5.50");
      const bsDifferential = parseFloat(await storage.getSetting("bs_differential") || "1.50");
      const order = await storage.createOrder(userId, data, { bcvRate, shippingPerLb, bsDifferential });
      const user = await storage.getUser(userId);
      if (user) {
        const deadline = /* @__PURE__ */ new Date();
        deadline.setHours(deadline.getHours() + 48);
        const productNames = data.items.map((i) => `${i.name} (x${i.quantity})`).join(", ");
        sendOrderConfirmation(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          products: productNames,
          totalUsd: order.totalUsd.toFixed(2),
          totalBs: order.totalBs.toFixed(2),
          paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod,
          estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString("es-VE"),
          branch: order.branch,
          paymentDeadline: deadline.toLocaleDateString("es-VE")
        }).catch(() => {
        });
        sendAdminNewOrderAlert({
          orderNumber: order.orderNumber,
          customerName: user.name,
          totalUsd: order.totalUsd.toFixed(2),
          products: productNames
        }).catch(() => {
        });
      }
      res.json(order);
    } catch (e) {
      res.status(400).json({ message: e.message || "Error creando pedido" });
    }
  });
  app2.get("/api/orders/my", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const orders = await storage.getUserOrders(userId);
    res.json(orders);
  });
  app2.get("/api/orders/:id", async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(order);
  });
  app2.patch("/api/orders/:id/proof", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const { paymentProof } = req.body;
    const order = await storage.updateOrder(req.params.id, { paymentProof });
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    const user = await storage.getUser(userId);
    if (user) {
      sendAdminPaymentReceivedAlert({
        orderNumber: order.orderNumber,
        customerName: user.name,
        totalUsd: order.totalUsd.toFixed(2)
      }).catch(() => {
      });
    }
    res.json(order);
  });
  app2.get("/api/wishlist", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const items = await storage.getWishlist(userId);
    res.json(items);
  });
  app2.post("/api/wishlist", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const { productId } = req.body;
    const item = await storage.addToWishlist(userId, productId);
    res.json(item);
  });
  app2.delete("/api/wishlist/:productId", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    await storage.removeFromWishlist(userId, +req.params.productId);
    res.json({ ok: true });
  });
  app2.get("/api/reviews/:productId", async (req, res) => {
    const reviews = await storage.getProductReviews(+req.params.productId);
    res.json(reviews);
  });
  app2.post("/api/reviews", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    try {
      const user = await storage.getUser(userId);
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(userId, user?.name || "An\xF3nimo", data);
      res.json(review);
    } catch (e) {
      res.status(400).json({ message: e.message || "Error" });
    }
  });
  app2.get("/api/settings/public", async (_req, res) => {
    const bcvRate = await storage.getSetting("bcv_rate") || "62";
    const shippingPerLb = await storage.getSetting("shipping_per_lb") || "5.50";
    const bsDifferential = await storage.getSetting("bs_differential") || "1.50";
    res.json({
      bcvRate: parseFloat(bcvRate),
      shippingPerLb: parseFloat(shippingPerLb),
      bsDifferential: parseFloat(bsDifferential)
    });
  });
  const requireAdmin = async (req, res, next) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Sin permisos" });
    next();
  };
  app2.get("/api/admin/dashboard", requireAdmin, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });
  app2.get("/api/admin/weight-health", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { sql: sqlTag } = await import("drizzle-orm");
    try {
      const weightSourceResult = await db2.execute(sqlTag`
        SELECT 
          COALESCE(specs->>'weightSource', 'sin_datos') as source,
          COUNT(*) as count
        FROM products WHERE is_active = true
        GROUP BY specs->>'weightSource'
        ORDER BY count DESC
      `);
      const ratioResult = await db2.execute(sqlTag`
        SELECT
          CASE
            WHEN base_price <= 0 OR weight <= 0 THEN 'sin_datos'
            WHEN (GREATEST(weight, 1) * 5.50) / base_price > 2.0 THEN 'critico_2x'
            WHEN (GREATEST(weight, 1) * 5.50) / base_price > 1.5 THEN 'alto_1.5x'
            WHEN (GREATEST(weight, 1) * 5.50) / base_price > 1.0 THEN 'moderado_1x'
            WHEN (GREATEST(weight, 1) * 5.50) / base_price > 0.5 THEN 'normal_0.5x'
            ELSE 'bajo'
          END as bracket,
          COUNT(*) as count
        FROM products WHERE is_active = true
        GROUP BY bracket ORDER BY count DESC
      `);
      const worstRatios = await db2.execute(sqlTag`
        SELECT id, name, base_price, weight, category,
          ROUND((GREATEST(weight, 1) * 5.50 / NULLIF(base_price, 0))::numeric, 2) as ratio
        FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
        ORDER BY (GREATEST(weight, 1) * 5.50 / NULLIF(base_price, 0)) DESC
        LIMIT 10
      `);
      const { syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { desc: desc2 } = await import("drizzle-orm");
      const recentLogs = await db2.select().from(syncLogsTable3).orderBy(desc2(syncLogsTable3.id)).limit(5);
      const totalResult = await db2.execute(sqlTag`SELECT COUNT(*) as total FROM products WHERE is_active = true`);
      const totalActive = (totalResult.rows || totalResult)[0]?.total || 0;
      res.json({
        totalActive,
        weightSources: weightSourceResult.rows || weightSourceResult,
        shippingRatios: ratioResult.rows || ratioResult,
        worstRatios: worstRatios.rows || worstRatios,
        recentLogs: recentLogs.map((l) => ({ id: l.id, type: l.type, status: l.status, startedAt: l.startedAt, completedAt: l.completedAt, details: l.details }))
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const { status } = req.query;
    const orders = await storage.getAllOrders({ status });
    res.json(orders);
  });
  app2.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    const user = await storage.getUser(order.userId);
    if (user) {
      const clientStatus = ORDER_STATUS_MAP[status];
      const statusLabel = CLIENT_STATUS_LABELS[clientStatus] || status;
      if (status === "payment_verified") {
        sendPaymentConfirmed(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          totalUsd: order.totalUsd.toFixed(2),
          estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString("es-VE"),
          branch: order.branch
        }).catch(() => {
        });
      } else if (status === "shipped_international") {
        sendOrderShipped(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString("es-VE"),
          branch: order.branch
        }).catch(() => {
        });
      } else if (status === "ready_for_pickup") {
        sendReadyForPickup(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          branch: order.branch,
          pickupDeadlineDays: 15
        }).catch(() => {
        });
      } else if (status === "cancelled") {
        sendOrderCancelled(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          reason: "El pedido fue cancelado por el administrador. Si tienes preguntas, cont\xE1ctanos."
        }).catch(() => {
        });
      } else {
        sendStatusUpdate(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          status,
          statusLabel,
          branch: order.branch
        }).catch(() => {
        });
      }
      if (user.phone) {
        sendWhatsAppOrderUpdate(user.phone, {
          orderNumber: order.orderNumber,
          status,
          customerName: user.name
        }).catch(() => {
        });
      }
    }
    res.json(order);
  });
  app2.post("/api/admin/orders/:id/send-reminder", requireAdmin, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.status !== "pending_payment") {
      return res.status(400).json({ message: "Este pedido no est\xE1 pendiente de pago" });
    }
    const user = await storage.getUser(order.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const deadline = new Date(order.createdAt);
    deadline.setHours(deadline.getHours() + 48);
    const now = /* @__PURE__ */ new Date();
    const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1e3 * 60 * 60)));
    await sendPaymentReminder(user.email, {
      customerName: user.name,
      orderNumber: order.orderNumber,
      totalUsd: order.totalUsd.toFixed(2),
      totalBs: order.totalBs.toFixed(2),
      paymentDeadline: deadline.toLocaleDateString("es-VE"),
      hoursRemaining
    });
    res.json({ sent: true, to: user.email });
  });
  app2.post("/api/admin/orders/send-reminders", requireAdmin, async (_req, res) => {
    const allOrders = await storage.getAllOrders({ status: "pending_payment" });
    const now = /* @__PURE__ */ new Date();
    let sent = 0;
    for (const order of allOrders) {
      const created = new Date(order.createdAt);
      const hoursSince = (now.getTime() - created.getTime()) / (1e3 * 60 * 60);
      if (hoursSince >= 20 && hoursSince <= 48) {
        const user = await storage.getUser(order.userId);
        if (!user) continue;
        const deadline = new Date(created);
        deadline.setHours(deadline.getHours() + 48);
        const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1e3 * 60 * 60)));
        sendPaymentReminder(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          totalUsd: order.totalUsd.toFixed(2),
          totalBs: order.totalBs.toFixed(2),
          paymentDeadline: deadline.toLocaleDateString("es-VE"),
          hoursRemaining
        }).catch(() => {
        });
        sent++;
      }
    }
    res.json({ sent, message: `${sent} recordatorios enviados` });
  });
  app2.post("/api/admin/orders/auto-cancel", requireAdmin, async (_req, res) => {
    const allOrders = await storage.getAllOrders({ status: "pending_payment" });
    const now = /* @__PURE__ */ new Date();
    let cancelled = 0;
    for (const order of allOrders) {
      const created = new Date(order.createdAt);
      const hoursSince = (now.getTime() - created.getTime()) / (1e3 * 60 * 60);
      if (hoursSince > 48) {
        await storage.updateOrderStatus(order.id, "cancelled");
        const user = await storage.getUser(order.userId);
        if (user) {
          sendOrderCancelled(user.email, {
            customerName: user.name,
            orderNumber: order.orderNumber,
            reason: "No se recibi\xF3 comprobante de pago dentro de las 48 horas establecidas."
          }).catch(() => {
          });
        }
        cancelled++;
      }
    }
    res.json({ cancelled, message: `${cancelled} pedidos cancelados por falta de pago` });
  });
  app2.post("/api/admin/orders/:id/generate-cart", requireAdmin, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    const cartParams = order.items.map((item, idx) => {
      const n = idx + 1;
      return `ASIN.${n}=${item.amazonAsin}&Quantity.${n}=${item.quantity}`;
    }).join("&");
    const amazonCartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartParams}`;
    const productLinks = order.items.map((item) => ({
      name: item.name,
      asin: item.amazonAsin,
      quantity: item.quantity,
      priceUsd: item.priceUsd,
      amazonUrl: `https://www.amazon.com/dp/${item.amazonAsin}`
    }));
    let estimatedAmazonCost = 0;
    if (storage instanceof PgStorage) {
      const db2 = storage.db;
      const { productsTable: productsTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq3 } = await import("drizzle-orm");
      for (const item of order.items) {
        const [product] = await db2.select().from(productsTable2).where(eq3(productsTable2.id, item.productId)).limit(1);
        if (product) {
          estimatedAmazonCost += (product.basePrice || 0) * item.quantity;
        }
      }
    }
    const estimatedProfit = order.totalUsd - estimatedAmazonCost - order.shippingUsd;
    const updated = await storage.updateOrder(req.params.id, {
      amazonCartUrl,
      amazonPurchaseStatus: "cart_ready",
      amazonCostUsd: +estimatedAmazonCost.toFixed(2),
      profitUsd: +estimatedProfit.toFixed(2)
    });
    res.json({
      amazonCartUrl,
      productLinks,
      estimatedAmazonCost: +estimatedAmazonCost.toFixed(2),
      estimatedProfit: +estimatedProfit.toFixed(2),
      totalChargedToCustomer: order.totalUsd,
      order: updated
    });
  });
  app2.post("/api/admin/orders/:id/confirm-purchase", requireAdmin, async (req, res) => {
    const { amazonOrderIds, actualCost, notes } = req.body;
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    const cost = parseFloat(actualCost) || order.amazonCostUsd || 0;
    const profit = order.totalUsd - cost - order.shippingUsd;
    const updated = await storage.updateOrder(req.params.id, {
      amazonOrderIds: amazonOrderIds || [],
      amazonPurchaseStatus: "purchased",
      amazonPurchaseNotes: notes || "",
      amazonCostUsd: +cost.toFixed(2),
      profitUsd: +profit.toFixed(2)
    });
    if (order.status === "payment_verified") {
      await storage.updateOrderStatus(req.params.id, "buying_amazon");
      const user = await storage.getUser(order.userId);
      if (user) {
        sendStatusUpdate(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          status: "buying_amazon",
          statusLabel: CLIENT_STATUS_LABELS[ORDER_STATUS_MAP["buying_amazon"]],
          branch: order.branch
        }).catch(() => {
        });
      }
    }
    res.json(updated);
  });
  app2.post("/api/admin/orders/:id/purchase-issue", requireAdmin, async (req, res) => {
    const { issue, affectedItems } = req.body;
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    const updated = await storage.updateOrder(req.params.id, {
      amazonPurchaseStatus: "issue",
      amazonPurchaseNotes: `PROBLEMA: ${issue}${affectedItems ? ` | Items: ${affectedItems.join(", ")}` : ""}`
    });
    res.json(updated);
  });
  app2.post("/api/admin/orders/:id/verify-prices", requireAdmin, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    const verification = [];
    let totalCurrentCost = 0;
    let hasIssues = false;
    for (const item of order.items) {
      try {
        const detail = await getProductByAsin(item.amazonAsin);
        const currentPrice = detail?.price?.value || 0;
        const available = !!(detail && detail.price?.value);
        const originalBase = item.priceUsd / 1.15 - Math.max(item.weight, 1) * 5.5 / 1.15;
        const priceChange = originalBase > 0 ? Math.abs(currentPrice - originalBase) / originalBase : 0;
        if (!available || priceChange > 0.15) hasIssues = true;
        totalCurrentCost += currentPrice * item.quantity;
        verification.push({
          name: item.name,
          asin: item.amazonAsin,
          quantity: item.quantity,
          originalBasePrice: +originalBase.toFixed(2),
          currentPrice: +currentPrice.toFixed(2),
          priceChange: `${(priceChange * 100).toFixed(0)}%`,
          available,
          status: !available ? "NO DISPONIBLE" : priceChange > 0.15 ? "PRECIO CAMBI\xD3" : "OK"
        });
      } catch (e) {
        hasIssues = true;
        verification.push({
          name: item.name,
          asin: item.amazonAsin,
          quantity: item.quantity,
          status: "ERROR",
          error: e.message
        });
      }
    }
    const estimatedProfit = order.totalUsd - totalCurrentCost - order.shippingUsd;
    res.json({
      verification,
      totalCurrentCost: +totalCurrentCost.toFixed(2),
      totalChargedToCustomer: order.totalUsd,
      shippingCost: order.shippingUsd,
      estimatedProfit: +estimatedProfit.toFixed(2),
      hasIssues,
      recommendation: hasIssues ? "REVISAR MANUALMENTE" : "LISTO PARA COMPRAR"
    });
  });
  app2.get("/api/admin/purchases/summary", requireAdmin, async (req, res) => {
    const allOrders = await storage.getAllOrders();
    const purchased = allOrders.filter((o) => o.amazonPurchaseStatus === "purchased");
    const pending = allOrders.filter((o) => o.status === "payment_verified" && o.amazonPurchaseStatus !== "purchased");
    const issues = allOrders.filter((o) => o.amazonPurchaseStatus === "issue");
    const cartReady = allOrders.filter((o) => o.amazonPurchaseStatus === "cart_ready");
    const totalRevenue = purchased.reduce((sum, o) => sum + o.totalUsd, 0);
    const totalCost = purchased.reduce((sum, o) => sum + (o.amazonCostUsd || 0), 0);
    const totalProfit = purchased.reduce((sum, o) => sum + (o.profitUsd || 0), 0);
    res.json({
      pendingPurchase: pending.length,
      cartReady: cartReady.length,
      purchased: purchased.length,
      issues: issues.length,
      totalRevenue: +totalRevenue.toFixed(2),
      totalCost: +totalCost.toFixed(2),
      totalProfit: +totalProfit.toFixed(2),
      marginPct: totalRevenue > 0 ? +(totalProfit / totalRevenue * 100).toFixed(1) : 0,
      pendingOrders: pending.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalUsd: o.totalUsd,
        items: o.items.length,
        createdAt: o.createdAt
      }))
    });
  });
  app2.get("/api/admin/customers", requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    const allOrders = await storage.getAllOrders();
    const result = users.map((u) => {
      const userOrders = allOrders.filter((o) => o.userId === u.id);
      const { password, ...safe } = u;
      return {
        ...safe,
        orderCount: userOrders.length,
        totalSpent: +userOrders.reduce((sum, o) => sum + o.totalUsd, 0).toFixed(2)
      };
    });
    res.json(result);
  });
  app2.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!role || !["admin", "employee", "customer"].includes(role)) {
      return res.status(400).json({ message: "Rol inv\xE1lido" });
    }
    const updated = await storage.updateUser(req.params.id, { role });
    if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
    const { password, ...safe } = updated;
    res.json(safe);
  });
  app2.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const product = await storage.updateProduct(+req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });
  app2.get("/api/admin/products", requireAdmin, async (req, res) => {
    const { page, limit } = req.query;
    const result = await storage.getProducts({
      page: page ? +page : 1,
      limit: limit ? +limit : 200
    });
    res.json(result);
  });
  app2.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    const settings = await storage.getAllSettings();
    res.json(settings);
  });
  app2.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    const updates = req.body;
    for (const { key, value } of updates) {
      await storage.setSetting(key, value);
    }
    const settings = await storage.getAllSettings();
    res.json(settings);
  });
  app2.post("/api/admin/products/search-amazon", requireAdmin, async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ message: "Query requerido" });
      const results = await searchProducts(query);
      res.json(results);
    } catch (e) {
      res.status(500).json({ message: e.message || "Error buscando productos" });
    }
  });
  app2.post("/api/admin/products/import", requireAdmin, async (req, res) => {
    try {
      const { asin, category, weight: manualWeight } = req.body;
      if (!asin || !category) {
        return res.status(400).json({ message: "ASIN y categor\xEDa requeridos" });
      }
      const canopyProduct = await getProductByAsin(asin);
      const unsendableReason = isUnsendable(canopyProduct.title || "");
      if (unsendableReason) {
        console.log(`[ADMIN IMPORT] Blocked: "${(canopyProduct.title || "").slice(0, 60)}" \u2014 ${unsendableReason}`);
        return res.status(400).json({ message: `Producto no enviable por avi\xF3n: ${unsendableReason}. Demasiado grande/pesado.` });
      }
      let finalWeight = manualWeight || 1;
      let weightSource = manualWeight ? "manual" : "estimated";
      if (!manualWeight) {
        try {
          const weightData = await getProductWeight(asin);
          const best = getBestWeight(weightData.itemWeight, weightData.packageWeight, 1, canopyProduct.title || "", category);
          if (weightData.itemWeight || weightData.packageWeight) {
            finalWeight = best;
            weightSource = "api";
          }
        } catch {
        }
      }
      const productData = canopyToProduct(canopyProduct, category, finalWeight);
      productData.specs = { ...productData.specs || {}, weightSource };
      if (storage instanceof PgStorage) {
        const { id: _id, ...data } = productData;
        const saved = await storage.createProduct(data);
        res.json(saved);
      } else {
        res.status(400).json({ message: "Importaci\xF3n solo disponible con base de datos PostgreSQL" });
      }
    } catch (e) {
      res.status(500).json({ message: e.message || "Error importando producto" });
    }
  });
  app2.post("/api/admin/products/seed", requireAdmin, async (req, res) => {
    try {
      if (!(storage instanceof PgStorage)) {
        return res.status(400).json({ message: "Seed solo disponible con PostgreSQL" });
      }
      const products = req.body;
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Se requiere un array de productos" });
      }
      const results = [];
      for (const p of products) {
        try {
          const { id: _id, ...data } = p;
          if (!data.createdAt) data.createdAt = (/* @__PURE__ */ new Date()).toISOString();
          const saved = await storage.createProduct(data);
          results.push({ name: saved.name, id: saved.id, status: "ok" });
        } catch (err) {
          results.push({ name: p.name, status: "error", error: err.message });
        }
      }
      const ok = results.filter((r) => r.status === "ok").length;
      const fail = results.filter((r) => r.status === "error").length;
      res.json({ message: `Seed completado: ${ok} creados, ${fail} errores`, total: ok, errors: fail, details: results });
    } catch (e) {
      res.status(500).json({ message: e.message || "Error en seed" });
    }
  });
  const GROWTH_CATEGORIES = [
    // Electronics & Tech
    { query: "best seller electronics", category: "tech", weight: 1 },
    { query: "bluetooth headphones", category: "tech", weight: 0.5 },
    { query: "phone accessories", category: "phones", weight: 0.3 },
    { query: "smart home devices", category: "tech", weight: 1 },
    { query: "laptop accessories", category: "tech", weight: 0.5 },
    { query: "wireless charger", category: "phones", weight: 0.3 },
    { query: "gaming headset", category: "gaming", weight: 0.8 },
    { query: "PS5 games", category: "gaming", weight: 0.3 },
    { query: "Nintendo Switch games", category: "gaming", weight: 0.3 },
    { query: "portable speaker", category: "tech", weight: 1 },
    // Beauty & Personal Care
    { query: "skincare best sellers", category: "beauty", weight: 0.5 },
    { query: "perfume for women", category: "beauty", weight: 0.5 },
    { query: "cologne for men", category: "beauty", weight: 0.5 },
    { query: "hair care products", category: "beauty", weight: 0.5 },
    { query: "makeup best sellers", category: "beauty", weight: 0.3 },
    { query: "deodorant", category: "beauty", weight: 0.3 },
    { query: "electric toothbrush", category: "beauty", weight: 0.5 },
    // Clothing & Shoes
    { query: "Nike shoes men", category: "shoes", weight: 2 },
    { query: "Nike shoes women", category: "shoes", weight: 2 },
    { query: "Adidas sneakers", category: "shoes", weight: 2 },
    { query: "men casual shirts", category: "clothing", weight: 0.5 },
    { query: "women dresses", category: "clothing", weight: 0.5 },
    { query: "sunglasses", category: "clothing", weight: 0.3 },
    { query: "backpack", category: "clothing", weight: 1 },
    { query: "wallet men", category: "clothing", weight: 0.3 },
    // Home & Kitchen
    { query: "kitchen gadgets best sellers", category: "home", weight: 1 },
    { query: "bedding sheets", category: "home", weight: 2 },
    { query: "air fryer", category: "home", weight: 5 },
    { query: "vacuum cleaner", category: "home", weight: 5 },
    { query: "comforter set", category: "home", weight: 3 },
    { query: "curtains", category: "home", weight: 2 },
    { query: "knife set kitchen", category: "home", weight: 2 },
    { query: "coffee maker", category: "home", weight: 5 },
    // Health & Supplements
    { query: "protein powder", category: "health", weight: 2 },
    { query: "vitamins supplements", category: "health", weight: 0.5 },
    { query: "creatine", category: "health", weight: 1 },
    { query: "pre workout", category: "health", weight: 1 },
    // Baby
    { query: "baby essentials", category: "baby", weight: 1 },
    { query: "diapers", category: "baby", weight: 2 },
    { query: "baby formula", category: "baby", weight: 2 },
    // stroller removed — too heavy/bulky
    // Pets
    { query: "dog food best seller", category: "pets", weight: 5 },
    { query: "cat food", category: "pets", weight: 3 },
    { query: "dog toys", category: "pets", weight: 0.5 },
    // Sports
    { query: "yoga mat", category: "sports", weight: 2 },
    // dumbbells removed — in unsendable filter
    { query: "resistance bands", category: "sports", weight: 0.3 },
    // Food & Snacks
    { query: "snacks variety pack", category: "food", weight: 2 },
    { query: "coffee pods", category: "food", weight: 1 },
    { query: "protein bars", category: "food", weight: 1 },
    // Office
    { query: "desk organizer", category: "office", weight: 1 },
    // office chair removed — in unsendable filter
    // Toys
    { query: "LEGO sets", category: "toys", weight: 1 },
    { query: "action figures", category: "toys", weight: 0.5 },
    { query: "board games", category: "toys", weight: 2 },
    // Automotive
    { query: "car accessories", category: "auto", weight: 1 },
    { query: "dash cam", category: "auto", weight: 0.5 },
    // More Tech
    { query: "wireless earbuds", category: "tech", weight: 0.3 },
    { query: "USB hub", category: "tech", weight: 0.5 },
    { query: "tablet accessories", category: "tech", weight: 0.5 },
    { query: "power bank", category: "tech", weight: 0.5 },
    { query: "smart watch", category: "tech", weight: 0.3 },
    { query: "ring light", category: "tech", weight: 1 },
    { query: "webcam", category: "tech", weight: 0.5 },
    { query: "microphone streaming", category: "tech", weight: 1 },
    { query: "monitor stand", category: "tech", weight: 2 },
    // More Beauty
    { query: "face moisturizer", category: "beauty", weight: 0.5 },
    { query: "nail polish set", category: "beauty", weight: 0.5 },
    { query: "curling iron", category: "beauty", weight: 1 },
    { query: "beard trimmer", category: "beauty", weight: 0.5 },
    { query: "body lotion", category: "beauty", weight: 0.5 },
    // More Clothing
    { query: "Jordan sneakers", category: "shoes", weight: 2 },
    { query: "New Balance shoes", category: "shoes", weight: 2 },
    { query: "Crocs", category: "shoes", weight: 1 },
    { query: "baseball cap", category: "clothing", weight: 0.3 },
    { query: "leggings women", category: "clothing", weight: 0.5 },
    { query: "men shorts", category: "clothing", weight: 0.5 },
    { query: "crossbody bag", category: "clothing", weight: 0.5 },
    // More Home
    { query: "blender", category: "home", weight: 3 },
    { query: "instant pot", category: "home", weight: 8 },
    { query: "LED light strip", category: "home", weight: 0.5 },
    { query: "throw blanket", category: "home", weight: 2 },
    { query: "water filter", category: "home", weight: 1 },
    { query: "candles", category: "home", weight: 1 },
    { query: "bathroom organizer", category: "home", weight: 1 },
    // More Health
    { query: "fish oil omega 3", category: "health", weight: 0.5 },
    { query: "collagen powder", category: "health", weight: 1 },
    { query: "melatonin gummies", category: "health", weight: 0.3 },
    { query: "first aid kit", category: "health", weight: 1 },
    // More Baby
    { query: "baby bottles", category: "baby", weight: 1 },
    { query: "baby monitor", category: "baby", weight: 1 },
    { query: "baby toys", category: "baby", weight: 0.5 },
    // More Pets
    { query: "dog treats", category: "pets", weight: 1 },
    { query: "cat litter", category: "pets", weight: 15 },
    { query: "pet bed", category: "pets", weight: 3 },
    // More Sports
    { query: "running shoes", category: "sports", weight: 2 },
    { query: "sports bra", category: "sports", weight: 0.3 },
    { query: "gym bag", category: "sports", weight: 1 },
    { query: "water bottle", category: "sports", weight: 0.5 },
    // More Food
    { query: "chocolate variety", category: "food", weight: 1 },
    { query: "tea variety pack", category: "food", weight: 0.5 },
    { query: "nut butter", category: "food", weight: 1 },
    // More Office
    { query: "pens markers set", category: "office", weight: 0.5 },
    { query: "laptop stand", category: "office", weight: 1 },
    { query: "planner notebook", category: "office", weight: 0.5 },
    // More Toys
    { query: "hot wheels", category: "toys", weight: 0.5 },
    { query: "Barbie dolls", category: "toys", weight: 0.5 },
    { query: "nerf guns", category: "toys", weight: 1 },
    { query: "play doh", category: "toys", weight: 1 },
    // More Auto
    { query: "car phone mount", category: "auto", weight: 0.3 },
    { query: "car seat covers", category: "auto", weight: 2 },
    { query: "tire pressure gauge", category: "auto", weight: 0.3 }
  ];
  app2.post("/api/admin/sync/grow-catalog", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const pgStorage = storage;
    const db2 = pgStorage.db;
    const { syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    const shuffled = [...GROWTH_CATEGORIES].sort(() => Math.random() - 0.5);
    const todaySearches = shuffled.slice(0, 8);
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "catalog_growth",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "running",
      details: { searches: todaySearches.map((s) => s.query) }
    }).returning();
    res.json({ message: "Crecimiento de cat\xE1logo iniciado", logId: log2.id, searches: todaySearches.map((s) => s.query) });
    (async () => {
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      const details = [];
      const startTime = Date.now();
      for (const search of todaySearches) {
        try {
          const searchResult = await searchProducts(search.query);
          const results = searchResult.results || [];
          for (const item of results.slice(0, 10)) {
            try {
              const asin = item.asin;
              if (!asin) continue;
              const existing = await pgStorage.getProducts({ search: asin, limit: 1 });
              const found = (existing.products || []).find(
                (p) => p.amazonAsin === asin || p.specs?.ASIN === asin
              );
              if (found) {
                skipped++;
                continue;
              }
              const full = await getProductByAsin(asin);
              if (!full || !full.title) {
                skipped++;
                continue;
              }
              const unsendableReason = isUnsendable(full.title);
              if (unsendableReason) {
                console.log(`[CATALOG GROWTH] Blocked unsendable: "${full.title.slice(0, 60)}" \u2014 ${unsendableReason}`);
                skipped++;
                continue;
              }
              let realWeight = search.weight;
              let weightSource = "estimated";
              try {
                const weightData = await getProductWeight(asin);
                const best = getBestWeight(weightData.itemWeight, weightData.packageWeight, search.weight, full.title || "", search.category);
                if (weightData.itemWeight || weightData.packageWeight) {
                  realWeight = best;
                  weightSource = "api";
                }
              } catch {
              }
              const nameWeight = extractWeightFromName(full.title || "");
              if (nameWeight !== null && Math.abs(nameWeight - realWeight) / Math.max(realWeight, 0.1) > 0.3) {
                console.log(`[CATALOG GROWTH] Weight correction from name: "${full.title?.slice(0, 50)}" \u2014 ${realWeight}\u2192${nameWeight} lbs`);
                realWeight = nameWeight;
              }
              const shippability = checkProductShippability(full.title || "", realWeight);
              if (!shippability.shippable) {
                console.log(`[CATALOG GROWTH] Blocked unshippable: "${full.title?.slice(0, 60)}" \u2014 ${shippability.reason}`);
                skipped++;
                continue;
              }
              const baseP = full.price?.value || 0;
              const importViability = checkShippingViability(baseP, realWeight, search.category);
              if (!importViability.viable) {
                console.log(`[CATALOG GROWTH] Blocked shipping-prohibitive: "${full.title?.slice(0, 60)}" \u2014 ratio ${importViability.ratio}x`);
                skipped++;
                continue;
              }
              const productData = canopyToProduct(full, search.category, realWeight);
              productData.name = smartTruncateTitle(translateTitle(productData.name));
              try {
                const rawDesc = full.description || full.title || productData.name;
                productData.description = await translateDescription(rawDesc);
              } catch {
                productData.description = translateTitle(productData.description || productData.name);
              }
              productData.specs = { ...productData.specs || {}, weightSource };
              const { id: _id, ...data } = productData;
              await pgStorage.createProduct(data);
              imported++;
              details.push({ name: productData.name.slice(0, 60), category: search.category });
              await new Promise((r) => setTimeout(r, 500));
            } catch (itemErr) {
              errors++;
            }
          }
          await db2.update(syncLogsTable3).set({
            totalProducts: imported + skipped,
            updated: imported,
            errors,
            details: { searches: todaySearches.map((s) => s.query), imported: details.slice(-20), progress: `${todaySearches.indexOf(search) + 1}/${todaySearches.length}` }
          }).where(eq3(syncLogsTable3.id, log2.id));
          await new Promise((r) => setTimeout(r, 1e3));
        } catch (searchErr) {
          errors++;
          details.push({ error: searchErr.message, query: search.query });
        }
      }
      await db2.update(syncLogsTable3).set({
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        totalProducts: imported + skipped,
        updated: imported,
        errors,
        status: "completed",
        details: {
          searches: todaySearches.map((s) => s.query),
          imported: details,
          skipped,
          runtime: `${Math.round((Date.now() - startTime) / 1e3)}s`
        }
      }).where(eq3(syncLogsTable3.id, log2.id));
      console.log(`[CATALOG GROWTH] Completed: ${imported} new, ${skipped} existing, ${errors} errors in ${Math.round((Date.now() - startTime) / 1e3)}s`);
    })();
  });
  app2.post("/api/admin/sync/prices", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db2 = storage.db;
    const { syncLogsTable: syncLogsTable3, productsTable: productsTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, sql: sqlTag } = await import("drizzle-orm");
    const stuckLogs = await db2.select().from(syncLogsTable3).where(eq3(syncLogsTable3.status, "running"));
    for (const stuck of stuckLogs) {
      const startedAt = new Date(stuck.startedAt).getTime();
      if (Date.now() - startedAt > 30 * 60 * 1e3) {
        await db2.update(syncLogsTable3).set({
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "failed",
          details: { error: "Marcado como fallido: timeout de 30 minutos" }
        }).where(eq3(syncLogsTable3.id, stuck.id));
        console.log(`[SYNC] Marked stuck log #${stuck.id} as failed`);
      }
    }
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "price_sync",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "running"
    }).returning();
    res.json({ message: "Sincronizaci\xF3n iniciada", logId: log2.id });
    (async () => {
      let updated = 0, deactivated = 0, reactivated = 0, priceAlerts = 0, errors = 0;
      let processed = 0;
      const alerts = [];
      const MAX_RUNTIME_MS = 25 * 60 * 1e3;
      const MAX_CONSECUTIVE_ERRORS = 20;
      const startTime = Date.now();
      let consecutiveErrors = 0;
      try {
        const allProducts = await db2.select().from(productsTable2).where(eq3(productsTable2.isActive, true)).orderBy(sqlTag`RANDOM()`).limit(500);
        const batchSize = 3;
        for (let i = 0; i < allProducts.length; i += batchSize) {
          if (Date.now() - startTime > MAX_RUNTIME_MS) {
            console.log(`[SYNC] Time limit reached after ${processed} products`);
            break;
          }
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.log(`[SYNC] Too many consecutive errors (${consecutiveErrors}), stopping`);
            break;
          }
          const batch = allProducts.slice(i, i + batchSize);
          await Promise.all(batch.map(async (product) => {
            try {
              const asin = product.specs?.ASIN || product.amazonAsin;
              if (!asin) return;
              const unsendableReason = isUnsendable(product.name);
              if (unsendableReason) {
                if (product.isActive) {
                  await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
                  deactivated++;
                  alerts.push({
                    type: "unsendable",
                    productId: product.id,
                    name: product.name,
                    reason: `Producto no enviable: ${unsendableReason}`
                  });
                  console.log(`[SYNC] Deactivated unsendable: #${product.id} "${product.name.slice(0, 50)}" \u2014 ${unsendableReason}`);
                }
                processed++;
                return;
              }
              const detail = await getProductByAsin(asin);
              consecutiveErrors = 0;
              processed++;
              if (!detail || !detail.price?.value) {
                if (product.isActive) {
                  await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
                  deactivated++;
                }
                return;
              }
              if (detail.title && isUnsendable(detail.title)) {
                if (product.isActive) {
                  await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
                  deactivated++;
                  alerts.push({
                    type: "unsendable",
                    productId: product.id,
                    name: detail.title,
                    reason: `T\xEDtulo actualizado es no enviable: ${isUnsendable(detail.title)}`
                  });
                }
                return;
              }
              if (!product.isActive) {
                reactivated++;
              }
              const newBasePrice = detail.price.value;
              let weight = product.weight || 1;
              const specs = product.specs;
              let weightUpdated = false;
              let weightSource = specs?.weightSource || "estimated";
              try {
                const weightData = await getProductWeight(asin);
                if (weightData.itemWeight || weightData.packageWeight) {
                  const realWeight = getBestWeight(weightData.itemWeight, weightData.packageWeight, weight, product.name, product.category);
                  const rawApiWeight = weightData.packageWeight || weightData.itemWeight || 0;
                  if (rawApiWeight > 150) {
                    if (product.isActive) {
                      await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
                      deactivated++;
                      alerts.push({
                        type: "overweight",
                        productId: product.id,
                        name: product.name,
                        reason: `Peso real ${rawApiWeight} lbs excede l\xEDmite a\xE9reo de 150 lbs`,
                        rawWeight: rawApiWeight
                      });
                      console.log(`[SYNC] Deactivated overweight: #${product.id} "${product.name.slice(0, 50)}" \u2014 ${rawApiWeight} lbs`);
                    }
                    return;
                  }
                  const oldWeight = product.weight || 1;
                  const weightDiff = Math.abs(realWeight - oldWeight);
                  if (weightDiff > 5 || oldWeight > 0 && realWeight / oldWeight > 3) {
                    alerts.push({
                      type: "weight_correction",
                      productId: product.id,
                      name: product.name,
                      oldWeight,
                      newWeight: realWeight,
                      change: `${oldWeight} \u2192 ${realWeight} lbs`,
                      priceDiff: `$${(Math.abs(realWeight - oldWeight) * 5.5).toFixed(2)} shipping difference`
                    });
                  }
                  weight = realWeight;
                  weightUpdated = true;
                  weightSource = "api";
                }
              } catch {
              }
              const nameExtracted = extractWeightFromName(product.name);
              if (nameExtracted !== null) {
                const diff = Math.abs(nameExtracted - weight) / Math.max(weight, 0.1);
                if (diff > 0.3) {
                  console.log(`[SYNC] Weight correction from name: #${product.id} "${product.name.slice(0, 50)}" \u2014 ${weight}\u2192${nameExtracted} lbs`);
                  weight = nameExtracted;
                  weightUpdated = true;
                  weightSource = "name_extracted";
                }
              }
              const shipCheck = checkProductShippability(product.name, weight);
              if (!shipCheck.shippable) {
                if (product.isActive) {
                  await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
                  deactivated++;
                  alerts.push({
                    type: "unshippable",
                    productId: product.id,
                    name: product.name,
                    weight,
                    reason: shipCheck.reason
                  });
                  console.log(`[SYNC] Deactivated unshippable: #${product.id} "${product.name.slice(0, 50)}" \u2014 ${shipCheck.reason}`);
                }
                return;
              }
              const shippingCost = weight * 5.5;
              if (shippingCost > newBasePrice * 3 && weight > 10) {
                alerts.push({
                  type: "suspicious_weight",
                  productId: product.id,
                  name: product.name,
                  weight,
                  basePrice: newBasePrice,
                  shippingCost,
                  reason: `Env\xEDo ($${shippingCost.toFixed(2)}) es ${(shippingCost / newBasePrice).toFixed(1)}x el precio base ($${newBasePrice.toFixed(2)})`
                });
              }
              const viability = checkShippingViability(newBasePrice, weight, product.category);
              if (!viability.viable) {
                await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
                deactivated++;
                alerts.push({
                  type: "shipping_prohibitive",
                  productId: product.id,
                  name: product.name,
                  weight,
                  basePrice: newBasePrice,
                  shippingCost: viability.shippingCost,
                  ratio: viability.ratio,
                  reason: viability.reason
                });
                console.log(`[SYNC] Deactivated shipping-prohibitive: #${product.id} "${product.name.slice(0, 50)}" \u2014 ratio ${viability.ratio}x`);
                return;
              }
              const newTotalPriceUsd = +(newBasePrice * 1.15 + Math.max(weight, 1) * 5.5).toFixed(2);
              const oldTotalPrice = product.totalPriceUsd;
              const priceChange = oldTotalPrice > 0 ? Math.abs(newTotalPriceUsd - oldTotalPrice) / oldTotalPrice : 0;
              if (priceChange > 0.2) {
                priceAlerts++;
                alerts.push({
                  type: "price_change",
                  productId: product.id,
                  name: product.name,
                  oldPrice: oldTotalPrice,
                  newPrice: newTotalPriceUsd,
                  change: `${(priceChange * 100).toFixed(0)}%`,
                  weightChange: weightUpdated ? `${product.weight} \u2192 ${weight} lbs` : null
                });
              }
              const updates = {
                basePrice: newBasePrice,
                totalPriceUsd: newTotalPriceUsd,
                isActive: true,
                rating: detail.rating || product.rating,
                reviews: detail.ratingsTotal || product.reviews
              };
              if (weightUpdated) {
                updates.weight = weight;
                updates.specs = {
                  ...specs,
                  weightSource,
                  rawItemWeight: specs?.rawItemWeight,
                  rawPackageWeight: specs?.rawPackageWeight,
                  lastWeightCheck: (/* @__PURE__ */ new Date()).toISOString()
                };
              }
              if (detail.mainImageUrl && detail.mainImageUrl !== product.image) {
                updates.image = detail.mainImageUrl;
              }
              const reviews = detail.ratingsTotal || 0;
              const rating = detail.rating || 0;
              updates.badge = reviews >= 5e4 ? "M\xE1s vendido" : reviews >= 1e4 ? "Popular" : reviews >= 5e3 && rating >= 4.5 ? "Popular" : "";
              if (oldTotalPrice !== newTotalPriceUsd) {
                updates.oldPrice = oldTotalPrice;
                updated++;
              }
              await db2.update(productsTable2).set(updates).where(eq3(productsTable2.id, product.id));
            } catch (e) {
              errors++;
              consecutiveErrors++;
            }
          }));
          if (processed % 50 === 0) {
            await db2.update(syncLogsTable3).set({
              totalProducts: processed,
              updated,
              deactivated,
              errors,
              priceAlerts,
              details: { alerts: alerts.slice(-10), progress: `${processed}/${allProducts.length}` }
            }).where(eq3(syncLogsTable3.id, log2.id));
          }
          await new Promise((r) => setTimeout(r, 500));
        }
        await db2.update(syncLogsTable3).set({
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          totalProducts: processed,
          updated,
          deactivated,
          reactivated,
          priceAlerts,
          errors,
          status: "completed",
          details: { alerts, runtime: `${Math.round((Date.now() - startTime) / 1e3)}s` }
        }).where(eq3(syncLogsTable3.id, log2.id));
        console.log(`[SYNC] Completed: ${processed} checked, ${updated} updated, ${deactivated} deactivated, ${reactivated} reactivated, ${priceAlerts} alerts, ${errors} errors in ${Math.round((Date.now() - startTime) / 1e3)}s`);
      } catch (e) {
        await db2.update(syncLogsTable3).set({
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          totalProducts: processed,
          updated,
          errors,
          status: "failed",
          details: { error: e.message, alerts, runtime: `${Math.round((Date.now() - startTime) / 1e3)}s` }
        }).where(eq3(syncLogsTable3.id, log2.id));
        console.error(`[SYNC] Failed after ${processed} products:`, e.message);
      }
    })();
  });
  app2.post("/api/admin/sync/translate", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2, syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, sql: sql2 } = await import("drizzle-orm");
    const allProducts = await db2.select({ id: productsTable2.id, name: productsTable2.name }).from(productsTable2).where(sql2`${productsTable2.name} ~* '( for | with | and | the | inch| pack|black|white|compatible|wireless|portable|charger|headphone|earbuds|battery|speaker)'`);
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "translation",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalProducts: allProducts.length,
      status: "running"
    }).returning();
    res.json({ message: `Traducci\xF3n iniciada para ${allProducts.length} productos`, logId: log2.id });
    (async () => {
      let translated = 0, errors = 0;
      const BATCH = 20;
      for (let i = 0; i < allProducts.length; i += BATCH) {
        const batch = allProducts.slice(i, i + BATCH);
        const titles = batch.map((p) => p.name);
        try {
          for (const product of batch) {
            try {
              const translated_name = smartTruncateTitle(translateTitle(product.name));
              if (translated_name !== product.name) {
                await db2.update(productsTable2).set({ name: translated_name }).where(eq3(productsTable2.id, product.id));
                translated++;
              }
            } catch {
              errors++;
            }
          }
        } catch {
          errors += batch.length;
        }
      }
      await db2.update(syncLogsTable3).set({
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updated: translated,
        errors,
        status: "completed"
      }).where(eq3(syncLogsTable3.id, log2.id));
      console.log(`[TRANSLATE] Done: ${translated} translated, ${errors} errors`);
    })();
  });
  app2.post("/api/admin/sync/translate-descriptions", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2, syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, sql: sql2 } = await import("drizzle-orm");
    const allProducts = await db2.select({
      id: productsTable2.id,
      name: productsTable2.name,
      description: productsTable2.description,
      descriptionEs: productsTable2.descriptionEs
    }).from(productsTable2).where(eq3(productsTable2.isActive, true));
    const untranslatedProducts = allProducts.filter((p) => {
      const desc2 = p.description || "";
      const descEs = p.descriptionEs || "";
      if (desc2.length < 10) return false;
      if (descEs.length > 10) return false;
      return /\b(for|with|and|the|this|that|from|your|our|these|is|are|has|have|can|will|not|all|one|two|get|use|set|new|top|best|made|high|quality|design|pack|size|color|inch|compatible|wireless|portable|bluetooth|waterproof|rechargeable|lightweight|durable|premium|professional|adjustable|stainless|steel)\b/i.test(desc2);
    });
    const batchSize = +(req.query.batch || 50);
    const productsToProcess = untranslatedProducts.slice(0, batchSize);
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "description_translation",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalProducts: productsToProcess.length,
      status: "running"
    }).returning();
    res.json({ message: `Traducci\xF3n de descripciones iniciada para ${productsToProcess.length} de ${untranslatedProducts.length} productos`, logId: log2.id });
    (async () => {
      let translated = 0, errors = 0;
      for (const product of productsToProcess) {
        try {
          const translatedDesc = await translateDescription(product.description || product.name);
          if (translatedDesc && translatedDesc !== product.description) {
            await db2.update(productsTable2).set({ descriptionEs: translatedDesc }).where(eq3(productsTable2.id, product.id));
            translated++;
          }
        } catch {
          errors++;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      await db2.update(syncLogsTable3).set({
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updated: translated,
        errors,
        status: "completed",
        details: { total: untranslatedProducts.length, processed: productsToProcess.length }
      }).where(eq3(syncLogsTable3.id, log2.id));
      console.log(`[TRANSLATE-DESC] Done: ${translated} translated, ${errors} errors`);
    })();
  });
  app2.post("/api/admin/sync/clear-translations", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db2 = storage.db;
    const { sql: sql2 } = await import("drizzle-orm");
    const result = await db2.execute(sql2`UPDATE products SET description_es = NULL, features_es = NULL`);
    res.json({ message: "Traducciones limpiadas", cleared: result.rowCount || 0 });
  });
  app2.get("/api/admin/sync/logs", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.json([]);
    const db2 = storage.db;
    const { syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { desc: desc2 } = await import("drizzle-orm");
    const logs = await db2.select().from(syncLogsTable3).orderBy(desc2(syncLogsTable3.id)).limit(50);
    res.json(logs);
  });
  app2.post("/api/admin/sync/fix-weights", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2, syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, and: and2, sql: sql2, inArray } = await import("drizzle-orm");
    const batchSize = +(req.query.batch || 100);
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "weight_fix",
      status: "running",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      details: { batchSize }
    }).returning();
    res.json({ message: "Weight fix started", logId: log2.id, batchSize });
    (async () => {
      try {
        const DEFAULT_WEIGHTS = [0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 5, 6, 8, 10, 15, 20, 35, 40];
        const candidates = await db2.select({
          id: productsTable2.id,
          name: productsTable2.name,
          weight: productsTable2.weight,
          basePrice: productsTable2.basePrice,
          category: productsTable2.category,
          amazonAsin: productsTable2.amazonAsin,
          specs: productsTable2.specs
        }).from(productsTable2).where(
          and2(
            eq3(productsTable2.isActive, true),
            sql2`${productsTable2.amazonAsin} IS NOT NULL AND ${productsTable2.amazonAsin} != ''`,
            sql2`${productsTable2.weight} IN (${sql2.join(DEFAULT_WEIGHTS.map((w) => sql2`${w}`), sql2`, `)})`
          )
        ).limit(batchSize);
        console.log(`[WEIGHT FIX] Found ${candidates.length} products with estimated weights`);
        let fixed = 0, skipped = 0, errors = 0, deactivated = 0;
        const alerts = [];
        for (const product of candidates) {
          try {
            const unsendableReason = isUnsendable(product.name);
            if (unsendableReason) {
              await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
              deactivated++;
              alerts.push(`Deactivated #${product.id}: ${unsendableReason} - ${product.name.slice(0, 60)}`);
              continue;
            }
            const weightData = await getProductWeight(product.amazonAsin);
            if (!weightData.itemWeight && !weightData.packageWeight) {
              const betterEstimate = estimateWeightByName(product.name, product.category);
              if (Math.abs(betterEstimate - product.weight) > 0.5) {
                const newPrice2 = +(product.basePrice * 1.15 + Math.max(betterEstimate, 1) * 5.5).toFixed(2);
                await db2.update(productsTable2).set({
                  weight: betterEstimate,
                  totalPriceUsd: newPrice2,
                  specs: { ...product.specs || {}, weightSource: "name_estimate" }
                }).where(eq3(productsTable2.id, product.id));
                fixed++;
              } else {
                skipped++;
              }
              await new Promise((r) => setTimeout(r, 200));
              continue;
            }
            const realWeight = getBestWeight(
              weightData.itemWeight,
              weightData.packageWeight,
              estimateWeightByName(product.name, product.category),
              product.name,
              product.category
            );
            if (realWeight > 150) {
              await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
              deactivated++;
              alerts.push(`Deactivated #${product.id}: ${realWeight}lbs exceeds 150lb limit - ${product.name.slice(0, 60)}`);
              continue;
            }
            const weightChange = Math.abs(realWeight - product.weight);
            const weightChangePct = product.weight > 0 ? weightChange / product.weight * 100 : 999;
            const newPrice = +(product.basePrice * 1.15 + Math.max(realWeight, 1) * 5.5).toFixed(2);
            const oldPrice = +(product.basePrice * 1.15 + Math.max(product.weight, 1) * 5.5).toFixed(2);
            await db2.update(productsTable2).set({
              weight: realWeight,
              totalPriceUsd: newPrice,
              specs: {
                ...product.specs || {},
                weightSource: "api",
                rawItemWeight: weightData.rawItem,
                rawPackageWeight: weightData.rawPackage
              }
            }).where(eq3(productsTable2.id, product.id));
            fixed++;
            if (weightChangePct > 100) {
              alerts.push(`#${product.id}: weight ${product.weight}\u2192${realWeight}lbs, price $${oldPrice}\u2192$${newPrice} (${product.name.slice(0, 50)})`);
            }
            await new Promise((r) => setTimeout(r, 350));
          } catch (e) {
            errors++;
            console.error(`[WEIGHT FIX] Error on product ${product.id}:`, e.message);
          }
        }
        await db2.update(syncLogsTable3).set({
          status: "completed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: {
            batchSize,
            processed: candidates.length,
            fixed,
            skipped,
            errors,
            deactivated,
            alerts: alerts.slice(0, 50)
          }
        }).where(eq3(syncLogsTable3.id, log2.id));
        console.log(`[WEIGHT FIX] Done: ${fixed} fixed, ${skipped} skipped, ${deactivated} deactivated, ${errors} errors`);
      } catch (e) {
        console.error("[WEIGHT FIX] Fatal error:", e.message);
        await db2.update(syncLogsTable3).set({
          status: "error",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: { error: e.message }
        }).where(eq3(syncLogsTable3.id, log2.id));
      }
    })();
  });
  app2.post("/api/admin/sync/optimize-weights", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2, syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, sql: sqlTag, count: count2 } = await import("drizzle-orm");
    const batchSize = +(req.query.batch || 200);
    const mode = req.query.mode || "full";
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "weight_optimization",
      status: "running",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      details: { batchSize, mode }
    }).returning();
    res.json({ message: "Weight optimization started", logId: log2.id, batchSize, mode });
    (async () => {
      try {
        let weightFixed = 0, shippingFiltered = 0, errors = 0, skipped = 0;
        const alerts = [];
        const startTime = Date.now();
        if (mode !== "weights-only") {
          console.log(`[OPTIMIZE] Phase 1: Shipping viability filter...`);
          const allActive = await db2.execute(sqlTag`
            SELECT id, name, base_price, weight, category FROM products
            WHERE is_active = true AND base_price > 0 AND weight > 0
          `);
          for (const row of allActive.rows || allActive) {
            const viability = checkShippingViability(Number(row.base_price), Number(row.weight), row.category || "");
            if (!viability.viable) {
              await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, row.id));
              shippingFiltered++;
              if (shippingFiltered <= 50) {
                alerts.push(`[SHIPPING] #${row.id}: $${Number(row.base_price).toFixed(2)} base, ${row.weight}lbs, ratio ${viability.ratio}x - ${(row.name || "").slice(0, 50)}`);
              }
            }
          }
          console.log(`[OPTIMIZE] Phase 1 done: ${shippingFiltered} products deactivated for prohibitive shipping`);
        }
        if (mode !== "filter-only") {
          console.log(`[OPTIMIZE] Phase 2: Fetching real weights from API...`);
          const DEFAULT_WEIGHTS = [0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 35, 40, 50];
          const candidates = await db2.execute(sqlTag`
            SELECT id, name, weight, base_price, category, amazon_asin, specs
            FROM products
            WHERE is_active = true
              AND amazon_asin IS NOT NULL AND amazon_asin != ''
              AND (specs->>'weightSource' IS NULL OR specs->>'weightSource' != 'api')
            ORDER BY RANDOM()
            LIMIT ${batchSize}
          `);
          const rows = candidates.rows || candidates;
          console.log(`[OPTIMIZE] Phase 2: Processing ${rows.length} products...`);
          for (const product of rows) {
            if (Date.now() - startTime > 20 * 60 * 1e3) {
              console.log(`[OPTIMIZE] Time limit reached`);
              break;
            }
            try {
              const weightData = await getProductWeight(product.amazon_asin);
              if (!weightData.itemWeight && !weightData.packageWeight) {
                const estimate = estimateWeightByName(product.name, product.category);
                const currentWeight = Number(product.weight);
                if (Math.abs(estimate - currentWeight) > 0.5) {
                  const newPrice2 = +(Number(product.base_price) * 1.15 + Math.max(estimate, 1) * 5.5).toFixed(2);
                  const v2 = checkShippingViability(Number(product.base_price), estimate, product.category || "");
                  await db2.update(productsTable2).set({
                    weight: estimate,
                    totalPriceUsd: newPrice2,
                    isActive: v2.viable,
                    specs: { ...product.specs || {}, weightSource: "smart_estimate", previousWeight: currentWeight }
                  }).where(eq3(productsTable2.id, product.id));
                  weightFixed++;
                  if (!v2.viable) shippingFiltered++;
                } else {
                  skipped++;
                }
                await new Promise((r) => setTimeout(r, 200));
                continue;
              }
              const realWeight = getBestWeight(
                weightData.itemWeight,
                weightData.packageWeight,
                estimateWeightByName(product.name, product.category),
                product.name,
                product.category
              );
              const oldWeight = Number(product.weight);
              const newPrice = +(Number(product.base_price) * 1.15 + Math.max(realWeight, 1) * 5.5).toFixed(2);
              const v = checkShippingViability(Number(product.base_price), realWeight, product.category || "");
              await db2.update(productsTable2).set({
                weight: realWeight,
                totalPriceUsd: newPrice,
                isActive: v.viable,
                specs: {
                  ...product.specs || {},
                  weightSource: "api",
                  rawItemWeight: weightData.rawItem,
                  rawPackageWeight: weightData.rawPackage,
                  previousWeight: oldWeight
                }
              }).where(eq3(productsTable2.id, product.id));
              weightFixed++;
              if (!v.viable) {
                shippingFiltered++;
                alerts.push(`[WEIGHT+SHIP] #${product.id}: ${oldWeight}\u2192${realWeight}lbs, ratio ${v.ratio}x \u2192 deactivated - ${(product.name || "").slice(0, 50)}`);
              } else if (Math.abs(realWeight - oldWeight) > 2) {
                alerts.push(`[WEIGHT] #${product.id}: ${oldWeight}\u2192${realWeight}lbs, price $${Number(product.base_price).toFixed(0)}\u2192$${newPrice} - ${(product.name || "").slice(0, 50)}`);
              }
              await new Promise((r) => setTimeout(r, 350));
            } catch (e) {
              errors++;
            }
          }
          console.log(`[OPTIMIZE] Phase 2 done: ${weightFixed} weights fixed`);
        }
        const countResult = await db2.select({ count: count2() }).from(productsTable2).where(eq3(productsTable2.isActive, true));
        const totalActive = countResult[0]?.count || 0;
        await db2.update(syncLogsTable3).set({
          status: "completed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: {
            mode,
            weightFixed,
            shippingFiltered,
            skipped,
            errors,
            totalActive,
            runtime: `${Math.round((Date.now() - startTime) / 1e3)}s`,
            alerts: alerts.slice(0, 100)
          }
        }).where(eq3(syncLogsTable3.id, log2.id));
        console.log(`[OPTIMIZE] Completed: ${weightFixed} weights fixed, ${shippingFiltered} shipping-filtered, ${totalActive} active, ${errors} errors in ${Math.round((Date.now() - startTime) / 1e3)}s`);
      } catch (e) {
        console.error("[OPTIMIZE] Fatal error:", e.message);
        const { syncLogsTable: syncLogsTable4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db2.update(syncLogsTable4).set({
          status: "error",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: { error: e.message }
        }).where(eq3(syncLogsTable4.id, log2.id));
      }
    })();
  });
  app2.post("/api/admin/sync/fix-weights-auto", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2, syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, sql: sqlTag } = await import("drizzle-orm");
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "auto_weight_fix",
      status: "running",
      startedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).returning();
    res.json({ message: "Auto weight fix started", logId: log2.id });
    (async () => {
      try {
        let corrected = 0, deactivated = 0, skipped = 0;
        const details = [];
        const allActive = await db2.execute(sqlTag`
          SELECT id, name, weight, base_price, category, specs
          FROM products
          WHERE is_active = true
        `);
        const rows = allActive.rows || allActive;
        console.log(`[AUTO WEIGHT FIX] Processing ${rows.length} active products...`);
        for (const product of rows) {
          const currentWeight = Number(product.weight) || 0;
          const name = product.name || "";
          const nameWeight = extractWeightFromName(name);
          const checkWeight = nameWeight !== null ? nameWeight : currentWeight;
          const shipCheck = checkProductShippability(name, checkWeight);
          if (!shipCheck.shippable) {
            await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
            deactivated++;
            details.push({
              action: "deactivated",
              id: product.id,
              name: name.slice(0, 60),
              weight: checkWeight,
              reason: shipCheck.reason
            });
            continue;
          }
          if (nameWeight !== null && nameWeight > currentWeight * 2) {
            const basePrice = Number(product.base_price) || 0;
            const newPrice = +(basePrice * 1.15 + Math.max(nameWeight, 1) * 5.5).toFixed(2);
            const viability = checkShippingViability(basePrice, nameWeight, product.category || "");
            if (!viability.viable) {
              await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, product.id));
              deactivated++;
              details.push({
                action: "deactivated",
                id: product.id,
                name: name.slice(0, 60),
                oldWeight: currentWeight,
                newWeight: nameWeight,
                reason: `Shipping prohibitive after weight correction: ratio ${viability.ratio}x`
              });
              continue;
            }
            await db2.update(productsTable2).set({
              weight: nameWeight,
              totalPriceUsd: newPrice,
              specs: {
                ...product.specs || {},
                weightSource: "name_auto_fix",
                previousWeight: currentWeight,
                autoFixedAt: (/* @__PURE__ */ new Date()).toISOString()
              }
            }).where(eq3(productsTable2.id, product.id));
            corrected++;
            details.push({
              action: "corrected",
              id: product.id,
              name: name.slice(0, 60),
              oldWeight: currentWeight,
              newWeight: nameWeight,
              oldPrice: +(basePrice * 1.15 + Math.max(currentWeight, 1) * 5.5).toFixed(2),
              newPrice
            });
          } else {
            skipped++;
          }
        }
        await db2.update(syncLogsTable3).set({
          status: "completed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: {
            processed: rows.length,
            corrected,
            deactivated,
            skipped,
            changes: details.slice(0, 200)
          }
        }).where(eq3(syncLogsTable3.id, log2.id));
        console.log(`[AUTO WEIGHT FIX] Done: ${corrected} corrected, ${deactivated} deactivated, ${skipped} skipped out of ${rows.length}`);
      } catch (e) {
        console.error("[AUTO WEIGHT FIX] Fatal error:", e.message);
        await db2.update(syncLogsTable3).set({
          status: "error",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: { error: e.message }
        }).where(eq3(syncLogsTable3.id, log2.id));
      }
    })();
  });
  app2.post("/api/admin/sync/cleanup", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2, syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3, and: and2, sql: sqlTag, count: count2 } = await import("drizzle-orm");
    const [log2] = await db2.insert(syncLogsTable3).values({
      type: "catalog_cleanup",
      status: "running",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      details: {}
    }).returning();
    res.json({ message: "Catalog cleanup started", logId: log2.id });
    (async () => {
      try {
        let deactivated = 0, fixed = 0;
        const alerts = [];
        const dupeRows = await db2.execute(sqlTag`
          SELECT amazon_asin, array_agg(id ORDER BY COALESCE(reviews, 0) DESC) as ids
          FROM products
          WHERE is_active = true AND amazon_asin IS NOT NULL AND amazon_asin != ''
          GROUP BY amazon_asin
          HAVING COUNT(*) > 1
        `);
        for (const row of dupeRows.rows || dupeRows) {
          const ids = row.ids;
          if (ids.length > 1) {
            for (const id of ids.slice(1)) {
              await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, id));
              deactivated++;
            }
            alerts.push(`Dedup ASIN ${row.amazon_asin}: kept #${ids[0]}, removed ${ids.slice(1).join(",")}`);
          }
        }
        const heavyRows = await db2.execute(sqlTag`
          SELECT id, name, weight FROM products
          WHERE is_active = true AND weight > 100
        `);
        for (const row of heavyRows.rows || heavyRows) {
          await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, row.id));
          deactivated++;
          alerts.push(`Too heavy: #${row.id} ${row.weight}lbs - ${(row.name || "").slice(0, 50)}`);
        }
        const badPriceRows = await db2.execute(sqlTag`
          SELECT id, name, total_price_usd FROM products
          WHERE is_active = true AND (total_price_usd IS NULL OR total_price_usd <= 0)
        `);
        for (const row of badPriceRows.rows || badPriceRows) {
          await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, row.id));
          deactivated++;
          alerts.push(`Bad price: #${row.id} $${row.total_price_usd} - ${(row.name || "").slice(0, 50)}`);
        }
        const allActive = await db2.execute(sqlTag`
          SELECT id, name FROM products WHERE is_active = true
        `);
        for (const row of allActive.rows || allActive) {
          const name = row.name || "";
          if ([...name].some((c) => c.codePointAt(0) > 65535)) {
            await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, row.id));
            deactivated++;
            alerts.push(`Spam name: #${row.id} - ${name.slice(0, 50)}`);
          }
        }
        const checkUnsendable = await db2.execute(sqlTag`
          SELECT id, name FROM products WHERE is_active = true
        `);
        for (const row of checkUnsendable.rows || checkUnsendable) {
          const reason = isUnsendable(row.name);
          if (reason) {
            await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, row.id));
            deactivated++;
            alerts.push(`Unsendable [${reason}]: #${row.id} - ${(row.name || "").slice(0, 50)}`);
          }
        }
        const shippingCheckRows = await db2.execute(sqlTag`
          SELECT id, name, base_price, weight, category FROM products
          WHERE is_active = true AND base_price > 0 AND weight > 0
        `);
        for (const row of shippingCheckRows.rows || shippingCheckRows) {
          const viability = checkShippingViability(Number(row.base_price), Number(row.weight), row.category || "");
          if (!viability.viable) {
            await db2.update(productsTable2).set({ isActive: false }).where(eq3(productsTable2.id, row.id));
            deactivated++;
            alerts.push(`Shipping prohibitive [${viability.ratio}x]: #${row.id} - $${Number(row.base_price).toFixed(2)} base, ${row.weight}lbs = $${viability.shippingCost} shipping - ${(row.name || "").slice(0, 50)}`);
          }
        }
        const countResult = await db2.select({ count: count2() }).from(productsTable2).where(eq3(productsTable2.isActive, true));
        const totalActive = countResult[0]?.count || 0;
        await db2.update(syncLogsTable3).set({
          status: "completed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: {
            deactivated,
            fixed,
            totalActive,
            alerts: alerts.slice(0, 100)
          }
        }).where(eq3(syncLogsTable3.id, log2.id));
        console.log(`[CLEANUP] Done: ${deactivated} deactivated, ${totalActive} active products remaining`);
      } catch (e) {
        console.error("[CLEANUP] Fatal error:", e.message);
        const { syncLogsTable: syncLogsTable4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        await db2.update(syncLogsTable4).set({
          status: "error",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          details: { error: e.message }
        }).where(eq3(syncLogsTable4.id, log2.id));
      }
    })();
  });
  app2.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      if (!(storage instanceof PgStorage)) {
        return res.status(400).json({ message: "Solo disponible con PostgreSQL" });
      }
      const data = req.body;
      if (!data.createdAt) data.createdAt = (/* @__PURE__ */ new Date()).toISOString();
      const saved = await storage.createProduct(data);
      res.json(saved);
    } catch (e) {
      res.status(500).json({ message: e.message || "Error creando producto" });
    }
  });
  app2.get("/api/admin/health-check", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { sql: sqlTag } = await import("drizzle-orm");
    const issues = [];
    const warnings = [];
    const fixes = [];
    try {
      const dbCheck = await db2.execute(sqlTag`SELECT 1 as ok`);
      if (!dbCheck) issues.push("Base de datos no responde");
      const catalogStats = await db2.execute(sqlTag`
        SELECT 
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE is_active = false) as inactive,
          COUNT(*) FILTER (WHERE is_active = true AND (base_price IS NULL OR base_price <= 0)) as no_price,
          COUNT(*) FILTER (WHERE is_active = true AND (weight IS NULL OR weight <= 0)) as no_weight,
          COUNT(*) FILTER (WHERE is_active = true AND (total_price_usd IS NULL OR total_price_usd <= 0)) as no_total,
          COUNT(*) FILTER (WHERE is_active = true AND weight > 150) as over_weight,
          COUNT(*) FILTER (WHERE is_active = true AND (image IS NULL OR image = '')) as no_image,
          COUNT(*) FILTER (WHERE is_active = true AND base_price > 0 AND weight > 0 AND (GREATEST(weight, 1) * 5.50 / base_price) > 2.0) as bad_ratio
        FROM products
      `);
      const stats = (catalogStats.rows || catalogStats)[0];
      if (Number(stats.no_price) > 0) issues.push(`${stats.no_price} productos activos sin precio base`);
      if (Number(stats.no_weight) > 0) issues.push(`${stats.no_weight} productos activos sin peso`);
      if (Number(stats.no_total) > 0) issues.push(`${stats.no_total} productos activos sin precio total`);
      if (Number(stats.over_weight) > 0) issues.push(`${stats.over_weight} productos activos pesan m\xE1s de 150 lbs`);
      if (Number(stats.no_image) > 5) warnings.push(`${stats.no_image} productos sin imagen`);
      if (Number(stats.bad_ratio) > 0) warnings.push(`${stats.bad_ratio} productos con ratio env\xEDo/precio > 2x (potencialmente no viables)`);
      if (Number(stats.over_weight) > 0) {
        const fixed = await db2.execute(sqlTag`
          UPDATE products SET is_active = false 
          WHERE is_active = true AND weight > 150
          RETURNING id, name, weight
        `);
        const fixedRows = fixed.rows || fixed;
        fixes.push(`Desactivados ${fixedRows.length} productos > 150 lbs: ${fixedRows.map((r) => `#${r.id} (${r.weight}lbs)`).join(", ")}`);
      }
      if (Number(stats.bad_ratio) > 0) {
        const badProducts = await db2.execute(sqlTag`
          UPDATE products SET is_active = false
          WHERE is_active = true AND base_price > 0 AND weight > 0
            AND (GREATEST(weight, 1) * 5.50 / base_price) > 2.0
            AND category NOT IN ('tech', 'phones', 'gaming')
          RETURNING id, name, ROUND((GREATEST(weight, 1) * 5.50 / base_price)::numeric, 2) as ratio
        `);
        const badRows = badProducts.rows || badProducts;
        if (badRows.length > 0) {
          fixes.push(`Desactivados ${badRows.length} productos con ratio env\xEDo excesivo: ${badRows.slice(0, 5).map((r) => `#${r.id} (${r.ratio}x)`).join(", ")}${badRows.length > 5 ? "..." : ""}`);
        }
      }
      const priceCheck = await db2.execute(sqlTag`
        SELECT id, name, base_price, weight, total_price_usd,
          ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2) as expected_price
        FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
          AND ABS(total_price_usd - (base_price * 1.15 + GREATEST(weight, 1) * 5.50)) > 1.00
        LIMIT 100
      `);
      const mismatchedPrices = priceCheck.rows || priceCheck;
      if (mismatchedPrices.length > 0) {
        const updated = await db2.execute(sqlTag`
          UPDATE products
          SET total_price_usd = ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)
          WHERE is_active = true AND base_price > 0 AND weight > 0
            AND ABS(total_price_usd - (base_price * 1.15 + GREATEST(weight, 1) * 5.50)) > 1.00
        `);
        fixes.push(`Corregidos ${mismatchedPrices.length} precios desincronizados (diferencia > $1 de la f\xF3rmula)`);
      }
      const dupeCheck = await db2.execute(sqlTag`
        WITH dupes AS (
          SELECT amazon_asin, array_agg(id ORDER BY id DESC) as ids, COUNT(*) as cnt
          FROM products WHERE is_active = true AND amazon_asin IS NOT NULL AND amazon_asin != ''
          GROUP BY amazon_asin HAVING COUNT(*) > 1
        )
        SELECT * FROM dupes LIMIT 50
      `);
      const dupeRows = dupeCheck.rows || dupeCheck;
      if (dupeRows.length > 0) {
        let totalDeduped = 0;
        for (const dupe of dupeRows) {
          let ids = [];
          if (Array.isArray(dupe.ids)) {
            ids = dupe.ids.map(Number);
          } else if (typeof dupe.ids === "string") {
            ids = dupe.ids.replace(/[{}]/g, "").split(",").map(Number).filter((n) => !isNaN(n));
          }
          const idsToDeactivate = ids.slice(1);
          if (idsToDeactivate.length > 0) {
            for (const id of idsToDeactivate) {
              await db2.execute(sqlTag`UPDATE products SET is_active = false WHERE id = ${id}`);
            }
            totalDeduped += idsToDeactivate.length;
          }
        }
        if (totalDeduped > 0) fixes.push(`Desactivados ${totalDeduped} productos duplicados (mismo ASIN, se mantuvo el m\xE1s reciente)`);
      }
      const orderCheck = await db2.execute(sqlTag`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'pending' AND created_at::timestamptz < NOW() - INTERVAL '48 hours') as stale_pending,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_awaiting,
          COUNT(*) FILTER (WHERE status = 'purchased') as purchased
        FROM orders
      `);
      const orders = (orderCheck.rows || orderCheck)[0];
      if (Number(orders.stale_pending) > 0) warnings.push(`${orders.stale_pending} pedidos pendientes de hace m\xE1s de 48h`);
      let searchOk = false;
      try {
        const testResult = await searchProducts("test", 1);
        searchOk = testResult && testResult.results && testResult.results.length > 0;
      } catch {
        searchOk = false;
      }
      if (!searchOk) issues.push("API de b\xFAsqueda (Canopy) no responde");
      const { syncLogsTable: syncLogsTable3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { desc: desc2 } = await import("drizzle-orm");
      const recentLogs = await db2.select().from(syncLogsTable3).orderBy(desc2(syncLogsTable3.id)).limit(10);
      const failedLogs = recentLogs.filter((l) => l.status === "error");
      if (failedLogs.length > 0) {
        warnings.push(`${failedLogs.length} sync logs recientes con errores: ${failedLogs.map((l) => `${l.type} (${l.startedAt})`).join(", ")}`);
      }
      const healthStatus = issues.length > 0 ? "critical" : warnings.length > 0 ? "warning" : "healthy";
      res.json({
        status: healthStatus,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        catalog: {
          active: Number(stats.active),
          inactive: Number(stats.inactive)
        },
        orders: {
          pending: Number(orders.pending),
          stalePending: Number(orders.stale_pending),
          paidAwaiting: Number(orders.paid_awaiting),
          purchased: Number(orders.purchased)
        },
        searchApiOnline: searchOk,
        issues,
        warnings,
        autoFixes: fixes,
        recentSyncLogs: recentLogs.slice(0, 5).map((l) => ({ type: l.type, status: l.status, startedAt: l.startedAt }))
      });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });
  app2.post("/api/admin/sync/recalculate-prices", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db2 = storage.db;
    const { sql: sqlTag } = await import("drizzle-orm");
    try {
      const { getPool: getPool3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const pool2 = getPool3();
      const countRes = await pool2.query(`
        SELECT COUNT(*) as cnt FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
        AND ABS(total_price_usd - ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)) > 0.01
      `);
      const willUpdate = parseInt(countRes.rows[0]?.cnt || "0");
      const examplesRes = await pool2.query(`
        SELECT id, name, weight, total_price_usd as old_price,
          ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2) as new_price
        FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
        AND ABS(total_price_usd - ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)) > 0.01
        LIMIT 10
      `);
      await pool2.query(`
        UPDATE products
        SET total_price_usd = ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)
        WHERE is_active = true AND base_price > 0 AND weight > 0
      `);
      res.json({
        message: `Precios recalculados para ${willUpdate} productos con m\xEDnimo 1 lb`,
        updated: willUpdate,
        examples: examplesRes.rows.slice(0, 10).map((e) => ({
          id: e.id,
          name: (e.name || "").slice(0, 60),
          weight: parseFloat(e.weight),
          oldPrice: parseFloat(e.old_price),
          newPrice: parseFloat(e.new_price)
        }))
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
  app2.get("/api/admin/audit/weights", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    try {
      const allActive = await db2.select().from(productsTable2).where(eq3(productsTable2.isActive, true));
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const categoryWeights = {};
      for (const p of allActive) {
        if (p.weight > 0.02) {
          if (!categoryWeights[p.category]) categoryWeights[p.category] = [];
          categoryWeights[p.category].push(p.weight);
        }
      }
      const categoryAvg = {};
      for (const [cat, weights] of Object.entries(categoryWeights)) {
        categoryAvg[cat] = weights.reduce((a, b) => a + b, 0) / weights.length;
      }
      const findings = [];
      for (const p of allActive) {
        const reasons = [];
        let severity = "low";
        const nameLower = (p.name || "").toLowerCase();
        if (p.weight === 0.01 || p.weight === 0.02) {
          reasons.push("placeholder_weight");
          severity = "critical";
        }
        if (p.weight === 0 || p.weight == null) {
          reasons.push("zero_weight");
          severity = "critical";
        }
        if (p.category === "baby") {
          if (/diaper|diapers|pañal|pañales/i.test(nameLower) && p.weight < 2) {
            reasons.push("baby_diaper_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/wipes|toallitas/i.test(nameLower) && /\d{2,}.*ct|\d{2,}.*count|\d{3,}/.test(nameLower) && p.weight < 1) {
            reasons.push("baby_wipes_bulk_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/formula|fórmula/i.test(nameLower) && p.weight < 0.5) {
            reasons.push("baby_formula_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "food") {
          if (/k-cup|keurig|pods/i.test(nameLower) && p.weight < 0.5) {
            reasons.push("food_kcups_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/pack|count|ct\b/i.test(nameLower)) {
            const numMatch = nameLower.match(/(\d+)/);
            if (numMatch && parseInt(numMatch[1]) >= 20 && p.weight < 0.5) {
              reasons.push("food_bulk_too_light");
              if (severityOrder[severity] > severityOrder["high"]) severity = "high";
            }
          }
        }
        if (p.category === "tech") {
          if (/alarm clock|clock|lamp|light|hatch/i.test(nameLower) && p.weight < 0.1) {
            reasons.push("tech_device_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/headphones|auriculares|audífonos/i.test(nameLower) && p.weight > 5) {
            reasons.push("tech_headphones_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (p.weight > 15) {
            reasons.push("tech_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "gaming") {
          if (/gift card|digital code|digital/i.test(nameLower) && p.weight > 0.1) {
            reasons.push("gaming_digital_has_weight");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/nintendo switch|ps5|xbox/i.test(nameLower) && p.weight < 1) {
            reasons.push("gaming_console_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (p.weight > 20) {
            reasons.push("gaming_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "beauty") {
          if (/perfume|cologne|fragrance|eau de/i.test(nameLower) && p.weight > 3) {
            reasons.push("beauty_fragrance_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "phones") {
          if (/cable|charger|cargador|adapter/i.test(nameLower) && p.weight > 3) {
            reasons.push("phones_cable_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/screen protector|protector de pantalla|tempered glass/i.test(nameLower) && p.weight > 1) {
            reasons.push("phones_protector_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "home") {
          if (p.weight > 25) {
            reasons.push("home_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "clothing" || p.category === "shoes") {
          if (p.weight < 0.05) {
            reasons.push("clothing_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (p.weight > 5) {
            reasons.push("clothing_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "pets") {
          if (/food|treats|litter|comida/i.test(nameLower) && p.weight < 0.1) {
            reasons.push("pets_food_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        const multipackMatch = nameLower.match(/(\d+)\s*-?\s*(pack|count|ct|sheets|wipes|pods|capsules)/);
        if (multipackMatch && parseInt(multipackMatch[1]) >= 50 && p.weight < 0.5) {
          reasons.push("multipack_weight_mismatch");
          if (severityOrder[severity] > severityOrder["medium"]) severity = "medium";
        }
        const avg = categoryAvg[p.category];
        if (avg && p.weight > 0.02) {
          if (p.weight > avg * 3) {
            reasons.push("statistical_outlier_heavy");
          }
          if (p.weight < avg / 10) {
            reasons.push("statistical_outlier_light");
          }
        }
        if (reasons.length > 0) {
          findings.push({
            id: p.id,
            name: p.name,
            category: p.category,
            weight: p.weight,
            basePrice: p.basePrice,
            amazonAsin: p.amazonAsin || "",
            severity,
            reasons,
            suggestedWeight: null
          });
        }
      }
      findings.sort((a, b) => {
        const sd = severityOrder[a.severity] - severityOrder[b.severity];
        if (sd !== 0) return sd;
        return a.category.localeCompare(b.category);
      });
      const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
      const byCategory = {};
      for (const f of findings) {
        bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
        byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      }
      res.json({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        totalActive: allActive.length,
        totalSuspicious: findings.length,
        bySeverity,
        byCategory,
        products: findings
      });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });
  app2.post("/api/admin/audit/weights/auto-fix", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db2 = storage.db;
    const { productsTable: productsTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq3 } = await import("drizzle-orm");
    try {
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
      const allActive = await db2.select().from(productsTable2).where(eq3(productsTable2.isActive, true));
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const findings = [];
      for (const p of allActive) {
        const reasons = [];
        let severity = "low";
        const nameLower = (p.name || "").toLowerCase();
        if (p.weight === 0.01 || p.weight === 0.02) {
          reasons.push("placeholder_weight");
          severity = "critical";
        }
        if (p.weight === 0 || p.weight == null) {
          reasons.push("zero_weight");
          severity = "critical";
        }
        if (p.category === "baby") {
          if (/diaper|diapers|pañal|pañales/i.test(nameLower) && p.weight < 2) {
            reasons.push("baby_diaper_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/wipes|toallitas/i.test(nameLower) && /\d{2,}.*ct|\d{2,}.*count|\d{3,}/.test(nameLower) && p.weight < 1) {
            reasons.push("baby_wipes_bulk_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/formula|fórmula/i.test(nameLower) && p.weight < 0.5) {
            reasons.push("baby_formula_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "food") {
          if (/k-cup|keurig|pods/i.test(nameLower) && p.weight < 0.5) {
            reasons.push("food_kcups_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/pack|count|ct\b/i.test(nameLower)) {
            const numMatch = nameLower.match(/(\d+)/);
            if (numMatch && parseInt(numMatch[1]) >= 20 && p.weight < 0.5) {
              reasons.push("food_bulk_too_light");
              if (severityOrder[severity] > severityOrder["high"]) severity = "high";
            }
          }
        }
        if (p.category === "tech") {
          if (/alarm clock|clock|lamp|light|hatch/i.test(nameLower) && p.weight < 0.1) {
            reasons.push("tech_device_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/headphones|auriculares|audífonos/i.test(nameLower) && p.weight > 5) {
            reasons.push("tech_headphones_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (p.weight > 15) {
            reasons.push("tech_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "gaming") {
          if (/gift card|digital code|digital/i.test(nameLower) && p.weight > 0.1) {
            reasons.push("gaming_digital_has_weight");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/nintendo switch|ps5|xbox/i.test(nameLower) && p.weight < 1) {
            reasons.push("gaming_console_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (p.weight > 20) {
            reasons.push("gaming_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "beauty") {
          if (/perfume|cologne|fragrance|eau de/i.test(nameLower) && p.weight > 3) {
            reasons.push("beauty_fragrance_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "phones") {
          if (/cable|charger|cargador|adapter/i.test(nameLower) && p.weight > 3) {
            reasons.push("phones_cable_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/screen protector|protector de pantalla|tempered glass/i.test(nameLower) && p.weight > 1) {
            reasons.push("phones_protector_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "home") {
          if (p.weight > 25) {
            reasons.push("home_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "clothing" || p.category === "shoes") {
          if (p.weight < 0.05) {
            reasons.push("clothing_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (p.weight > 5) {
            reasons.push("clothing_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (p.category === "pets") {
          if (/food|treats|litter|comida/i.test(nameLower) && p.weight < 0.1) {
            reasons.push("pets_food_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }
        if (reasons.length > 0 && (severity === "critical" || severity === "high")) {
          findings.push({
            id: p.id,
            name: p.name,
            category: p.category,
            weight: p.weight,
            basePrice: p.basePrice,
            amazonAsin: p.amazonAsin || "",
            severity,
            reasons
          });
        }
      }
      findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      const toProcess = findings.slice(0, limit);
      const fixes = [];
      const skippedProducts = [];
      for (const product of toProcess) {
        const nameLower = (product.name || "").toLowerCase();
        if (/gift\s*card|digital\s*code|\bdigital\b|\[digital/i.test(nameLower)) {
          skippedProducts.push({ id: product.id, name: product.name, reason: "digital_product" });
          continue;
        }
        let newWeight = null;
        let source = "";
        if (product.amazonAsin) {
          try {
            const { itemWeight, packageWeight } = await getProductWeight(product.amazonAsin);
            const fallbackEstimate = estimateWeightByName(product.name, product.category);
            const canopyWeight = getBestWeight(itemWeight, packageWeight, fallbackEstimate, product.name, product.category);
            if (itemWeight && itemWeight > 0 || packageWeight && packageWeight > 0) {
              if (canopyWeight !== product.weight) {
                newWeight = canopyWeight;
                source = "canopy_api";
              }
            }
          } catch {
          }
          await new Promise((r) => setTimeout(r, 500));
        }
        if (newWeight === null) {
          const estimated = estimateWeightByName(product.name, product.category);
          const isPlaceholder = product.weight === 0.01 || product.weight === 0.02 || product.weight === 0;
          if (isPlaceholder) {
            newWeight = estimated;
            source = "name_estimate";
          } else if (Math.abs(estimated - product.weight) / product.weight > 0.5) {
            newWeight = estimated;
            source = "name_estimate";
          }
        }
        if (newWeight === null || newWeight === product.weight) {
          skippedProducts.push({ id: product.id, name: product.name, reason: "no_weight_available" });
          continue;
        }
        const newPrice = +(product.basePrice * 1.15 + Math.max(newWeight, 1) * 5.5).toFixed(2);
        await db2.update(productsTable2).set({ weight: newWeight, totalPriceUsd: newPrice }).where(eq3(productsTable2.id, product.id));
        fixes.push({
          id: product.id,
          name: product.name,
          category: product.category,
          oldWeight: product.weight,
          newWeight,
          source,
          oldPrice: +(product.basePrice * 1.15 + Math.max(product.weight, 1) * 5.5).toFixed(2),
          newPrice,
          reasons: product.reasons
        });
      }
      res.json({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        processed: toProcess.length,
        fixed: fixes.length,
        skipped: skippedProducts.length,
        fixes,
        skippedProducts
      });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });
  return httpServer2;
}

// server/seo.ts
var DOMAIN = "https://copikonusa.com";
var CATEGORY_SEO = {
  tech: {
    title: "Tecnolog\xEDa \u2014 Laptops, Aud\xEDfonos, Accesorios | CopikonUSA",
    description: "Compra laptops, aud\xEDfonos, tablets, c\xE1maras y accesorios tecnol\xF3gicos de Estados Unidos con env\xEDo a Venezuela. Precios en bol\xEDvares.",
    h1: "Tecnolog\xEDa y Electr\xF3nica de Estados Unidos"
  },
  phones: {
    title: "Tel\xE9fonos y Accesorios para Celulares | CopikonUSA",
    description: "Fundas, cargadores, protectores de pantalla, aud\xEDfonos y accesorios para celular desde USA. Env\xEDo a\xE9reo a Venezuela, pago en bol\xEDvares.",
    h1: "Tel\xE9fonos y Accesorios"
  },
  gaming: {
    title: "Gaming \u2014 Controles, Sillas, Teclados, Aud\xEDfonos | CopikonUSA",
    description: "Compra controles, sillas gaming, teclados mec\xE1nicos, aud\xEDfonos y accesorios gamer de USA. Env\xEDo a Venezuela con pago en bol\xEDvares.",
    h1: "Gaming y Videojuegos"
  },
  beauty: {
    title: "Belleza \u2014 Maquillaje, Skincare, Perfumes | CopikonUSA",
    description: "Productos de belleza americanos: maquillaje, skincare, perfumes, tratamientos capilares. Compra desde Venezuela, pago en Bs.",
    h1: "Belleza y Cuidado Personal"
  },
  shoes: {
    title: "Calzado \u2014 Nike, Adidas, New Balance desde USA | CopikonUSA",
    description: "Zapatos, tenis, botas y sandalias originales de Estados Unidos. Las mejores marcas con env\xEDo a\xE9reo a Venezuela.",
    h1: "Calzado desde Estados Unidos"
  },
  clothing: {
    title: "Ropa y Moda \u2014 Ropa Americana de Marca | CopikonUSA",
    description: "Camisetas, pantalones, chaquetas, vestidos y m\xE1s ropa de marca desde USA. Env\xEDo a\xE9reo a Venezuela, precios en bol\xEDvares.",
    h1: "Ropa y Moda Americana"
  },
  home: {
    title: "Hogar y Cocina \u2014 Electrodom\xE9sticos y Decoraci\xF3n | CopikonUSA",
    description: "Electrodom\xE9sticos, utensilios de cocina, decoraci\xF3n y organizaci\xF3n del hogar desde USA. Env\xEDo a Venezuela.",
    h1: "Hogar y Cocina"
  },
  health: {
    title: "Salud \u2014 Vitaminas, Suplementos, Cuidado Personal | CopikonUSA",
    description: "Vitaminas, suplementos, equipos de salud y cuidado personal desde Estados Unidos. Env\xEDo a Venezuela con pago en bol\xEDvares.",
    h1: "Salud y Bienestar"
  },
  baby: {
    title: "Beb\xE9s y Ni\xF1os \u2014 Coches, Sillas, Juguetes | CopikonUSA",
    description: "Productos para beb\xE9s y ni\xF1os desde USA: coches, sillas de auto, juguetes educativos, ropa infantil. Env\xEDo a Venezuela.",
    h1: "Beb\xE9s y Ni\xF1os"
  },
  sports: {
    title: "Deportes \u2014 Pesas, Yoga, Fitness desde USA | CopikonUSA",
    description: "Equipos deportivos, pesas, mats de yoga, ropa deportiva y accesorios fitness desde Estados Unidos. Env\xEDo a Venezuela.",
    h1: "Deportes y Fitness"
  },
  pets: {
    title: "Mascotas \u2014 Comida, Juguetes, Accesorios | CopikonUSA",
    description: "Comida premium, juguetes, accesorios y cuidado para mascotas desde USA. Las mejores marcas americanas con env\xEDo a Venezuela.",
    h1: "Mascotas"
  },
  food: {
    title: "Comestibles \u2014 Snacks, Dulces, Productos Americanos | CopikonUSA",
    description: "Snacks, dulces, cereales, salsas y productos comestibles americanos. Compra desde Venezuela con pago en bol\xEDvares.",
    h1: "Comestibles Americanos"
  },
  toys: {
    title: "Juguetes \u2014 LEGO, Hot Wheels, Mu\xF1ecas, Juegos | CopikonUSA",
    description: "Juguetes de las mejores marcas americanas: LEGO, Hot Wheels, Barbie, juegos de mesa. Env\xEDo a\xE9reo USA a Venezuela.",
    h1: "Juguetes"
  },
  auto: {
    title: "Autos y Herramientas \u2014 Accesorios y Repuestos | CopikonUSA",
    description: "Accesorios para autos, herramientas y repuestos desde Estados Unidos. Env\xEDo a\xE9reo a Venezuela con pago en bol\xEDvares.",
    h1: "Autos y Herramientas"
  },
  office: {
    title: "Oficina \u2014 Escritorios, Sillas, Organizadores | CopikonUSA",
    description: "Muebles de oficina, organizadores, impresoras y suministros desde USA. Compra con env\xEDo a Venezuela.",
    h1: "Oficina y Papeler\xEDa"
  }
};
function registerSEORoutes(app2) {
  app2.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /checkout
Disallow: /carrito
Disallow: /mis-pedidos
Disallow: /pedido/
Disallow: /perfil
Disallow: /login
Disallow: /registro

Sitemap: ${DOMAIN}/sitemap.xml

# CopikonUSA - Tu Tienda Americana en Venezuela
# https://copikonusa.com
`);
  });
  app2.get("/sitemap.xml", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      let totalProducts = 0;
      try {
        const result = await storage.getProducts({ limit: 1, page: 1 });
        totalProducts = result.total || 0;
      } catch {
        totalProducts = 0;
      }
      const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${DOMAIN}/catalogo</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/metodos-de-pago</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/sobre-nosotros</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/terminos</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${DOMAIN}/devoluciones</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Categories -->
`;
      for (const cat of categories) {
        xml += `  <url>
    <loc>${DOMAIN}/catalogo?category=${cat.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
      const PAGE_SIZE = 100;
      const pages = Math.ceil(totalProducts / PAGE_SIZE);
      for (let p = 1; p <= Math.min(pages, 100); p++) {
        const result = await storage.getProducts({ limit: PAGE_SIZE, page: p });
        const products = result.products || [];
        for (const prod of products) {
          if (!prod.isActive) continue;
          const imgUrl = prod.image?.startsWith("http") ? `${DOMAIN}/api/img?url=${encodeURIComponent(prod.image)}` : prod.image;
          xml += `  <url>
    <loc>${DOMAIN}/producto/${prod.slug}</loc>
    <lastmod>${prod.createdAt ? prod.createdAt.split("T")[0] : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imgUrl ? `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(prod.name)}</image:title>
    </image:image>` : ""}
  </url>
`;
        }
      }
      xml += `</urlset>`;
      res.type("application/xml").send(xml);
    } catch (err) {
      console.error("[SEO] Sitemap error:", err);
      res.status(500).type("text/plain").send("Error generating sitemap");
    }
  });
  app2.get("/p/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.redirect("/catalogo");
      const priceUsd = product.totalPriceUsd.toFixed(2);
      const imgUrl = product.image?.startsWith("http") ? `${DOMAIN}/api/img?url=${encodeURIComponent(product.image)}` : `${DOMAIN}${product.image}`;
      const catSeo = CATEGORY_SEO[product.category];
      const catName = catSeo?.h1 || product.category;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `Compra ${product.name} en CopikonUSA con env\xEDo a\xE9reo a Venezuela. Pago en bol\xEDvares.`,
        "image": imgUrl,
        "brand": {
          "@type": "Brand",
          "name": "CopikonUSA"
        },
        "offers": {
          "@type": "Offer",
          "url": `${DOMAIN}/producto/${product.slug}`,
          "priceCurrency": "USD",
          "price": priceUsd,
          "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "CopikonUSA"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "VE"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": { "@type": "QuantitativeValue", "minValue": 7, "maxValue": 15, "unitCode": "DAY" },
              "transitTime": { "@type": "QuantitativeValue", "minValue": 7, "maxValue": 15, "unitCode": "DAY" }
            }
          }
        },
        ...product.rating && product.reviews ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating.toFixed(1),
            "reviewCount": product.reviews
          }
        } : {},
        "category": catName
      };
      res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(product.name)} \u2014 CopikonUSA</title>
  <meta name="description" content="Compra ${escapeHtml(product.name)} por $${priceUsd} USD con env\xEDo a\xE9reo desde USA a Venezuela. Pago en bol\xEDvares. ${catName} en CopikonUSA.">
  <meta property="og:title" content="${escapeHtml(product.name)} \u2014 CopikonUSA">
  <meta property="og:description" content="$${priceUsd} USD \u2014 Env\xEDo a\xE9reo USA a Venezuela. Pago en bol\xEDvares.">
  <meta property="og:image" content="${imgUrl}">
  <meta property="og:url" content="${DOMAIN}/producto/${product.slug}">
  <meta property="og:type" content="product">
  <meta property="product:price:amount" content="${priceUsd}">
  <meta property="product:price:currency" content="USD">
  <link rel="canonical" href="${DOMAIN}/producto/${product.slug}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${escapeHtml(product.name)}</h1>
  <p>Precio: $${priceUsd} USD</p>
  <p>${escapeHtml(product.description || "")}</p>
  <p>Categor\xEDa: ${escapeHtml(catName)}</p>
  <a href="${DOMAIN}/producto/${product.slug}">Ver producto en CopikonUSA</a>
  <script>window.location.href = "${DOMAIN}/producto/${product.slug}";</script>
</body>
</html>`);
    } catch (err) {
      console.error("[SEO] Product page error:", err);
      res.redirect("/");
    }
  });
  app2.get("/c/:category", async (req, res) => {
    try {
      const cat = req.params.category;
      const seo = CATEGORY_SEO[cat];
      if (!seo) return res.redirect("/catalogo");
      const result = await storage.getProducts({ category: cat, limit: 50, page: 1 });
      const products = result.products || [];
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": seo.h1,
        "description": seo.description,
        "url": `${DOMAIN}/catalogo?category=${cat}`,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": result.total || products.length,
          "itemListElement": products.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `${DOMAIN}/producto/${p.slug}`,
            "name": p.name
          }))
        }
      };
      const productListHtml = products.slice(0, 20).map(
        (p) => `<li><a href="${DOMAIN}/producto/${p.slug}">${escapeHtml(p.name)} \u2014 $${p.totalPriceUsd?.toFixed(2)} USD</a></li>`
      ).join("\n      ");
      res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}">
  <meta property="og:title" content="${seo.title}">
  <meta property="og:description" content="${seo.description}">
  <meta property="og:url" content="${DOMAIN}/catalogo?category=${cat}">
  <meta property="og:type" content="website">
  <link rel="canonical" href="${DOMAIN}/catalogo?category=${cat}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${seo.h1}</h1>
  <p>${seo.description}</p>
  <ul>
      ${productListHtml}
  </ul>
  <a href="${DOMAIN}/catalogo?category=${cat}">Ver todos los productos</a>
  <script>window.location.href = "${DOMAIN}/catalogo?category=${cat}";</script>
</body>
</html>`);
    } catch (err) {
      console.error("[SEO] Category page error:", err);
      res.redirect("/");
    }
  });
  app2.get("/seo/schema", (_req, res) => {
    const schema = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CopikonUSA",
        "url": DOMAIN,
        "logo": `${DOMAIN}/favicon.png`,
        "description": "En CopikonUSA consigues cualquier producto de Estados Unidos al mejor precio del mercado, con env\xEDo incluido y pago en bol\xEDvares.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-786-969-5464",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        },
        "sameAs": [],
        "areaServed": {
          "@type": "Country",
          "name": "Venezuela"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CopikonUSA",
        "url": DOMAIN,
        "description": "Tu Tienda Americana en Venezuela \u2014 Compra productos de USA con env\xEDo a\xE9reo y pago en bol\xEDvares",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${DOMAIN}/catalogo?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ];
    res.json(schema);
  });
  console.log("[SEO] Routes registered: robots.txt, sitemap.xml, /p/:slug, /c/:category, /seo/schema");
}
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// server/static.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function serveStatic(app2) {
  const distPath = import_path.default.resolve(__dirname, "public");
  if (!import_fs.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express.default.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(import_path.default.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var import_http = require("http");
init_db();
var app = (0, import_express2.default)();
var httpServer = (0, import_http.createServer)(app);
app.use(
  import_express2.default.json({
    limit: "5mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express2.default.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
async function runAutoMigrations() {
  try {
    getDb();
    const pool2 = getPool();
    if (!pool2) return;
    await pool2.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS description_es TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS features_es JSONB DEFAULT '[]';
    `);
    console.log("[MIGRATION] Auto-migration complete: description_es, features_es columns ensured");
  } catch (e) {
    console.error("[MIGRATION] Auto-migration error:", e.message);
  }
}
(async () => {
  await runAutoMigrations();
  await registerRoutes(httpServer, app);
  registerWhatsAppRoutes(app);
  registerSEORoutes(app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(httpServer, app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
