import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertOrderSchema, insertReviewSchema, PAYMENT_METHOD_LABELS, CLIENT_STATUS_LABELS, ORDER_STATUS_MAP, type OrderStatus } from "@shared/schema";
import bcrypt from "bcryptjs";
import { searchProducts as canopySearch, getProductByAsin, canopyToProduct, getFullProductDetail } from "./canopy";
import { sendWelcomeEmail, sendOrderConfirmation, sendPaymentConfirmed, sendStatusUpdate } from "./email";
import { PgStorage } from "./pg-storage";

// Simple in-memory sessions: token -> userId
const sessions = new Map<string, string>();

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getUserIdFromToken(req: any): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return sessions.get(token) || null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== IMAGE PROXY =====
  // Proxy images from Amazon CDN to avoid hotlinking blocks
  const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
  const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  app.get("/api/img", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("Missing url parameter");

    // Only allow Amazon image URLs
    try {
      const parsed = new URL(url);
      const allowedHosts = ["m.media-amazon.com", "images-na.ssl-images-amazon.com", "images-eu.ssl-images-amazon.com", "ecx.images-amazon.com"];
      if (!allowedHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
        return res.status(403).send("Dominio no permitido");
      }
    } catch {
      return res.status(400).send("URL inválida");
    }

    // Check cache
    const cached = imageCache.get(url);
    if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
      res.set({
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "HIT",
      });
      return res.send(cached.data);
    }

    // Fetch from source using global fetch (Node 18+)
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://www.amazon.com/",
        },
        signal: AbortSignal.timeout(15000),
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const imageData = {
        data: Buffer.from(arrayBuffer),
        contentType: response.headers.get("content-type") || "image/jpeg",
      };

      // Store in cache (limit cache size to 500 entries)
      if (imageCache.size > 500) {
        const oldest = [...imageCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) imageCache.delete(oldest[0]);
      }
      imageCache.set(url, { ...imageData, timestamp: Date.now() });

      res.set({
        "Content-Type": imageData.contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Cache": "MISS",
      });
      res.send(imageData.data);
    } catch (e: any) {
      // Return a 1x1 transparent pixel as fallback
      const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
      res.set({ "Content-Type": "image/gif", "Cache-Control": "no-cache" });
      res.status(502).send(pixel);
    }
  });

  // ===== AUTH =====
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Este email ya está registrado" });
      }
      const user = await storage.createUser(data);
      const token = generateToken();
      sessions.set(token, user.id);
      const { password, ...safe } = user;

      // Fire-and-forget welcome email
      sendWelcomeEmail(user.email, user.name).catch(() => {});

      res.json({ user: safe, token });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Error en registro" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Support both hashed (PgStorage) and plain text (MemStorage) passwords
      const isHashed = user.password.startsWith("$2");
      const passwordMatch = isHashed
        ? await bcrypt.compare(data.password, user.password)
        : user.password === data.password;

      if (!passwordMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = generateToken();
      sessions.set(token, user.id);
      const { password, ...safe } = user;
      res.json({ user: safe, token });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Error en login" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
    const { password, ...safe } = user;
    res.json(safe);
  });

  app.patch("/api/auth/profile", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.updateUser(userId, req.body);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const { password, ...safe } = user;
    res.json(safe);
  });

  // ===== FAST AUTOCOMPLETE =====
  const autocompleteCache = new Map<string, { results: any[]; timestamp: number }>();
  
  app.get("/api/autocomplete", async (req, res) => {
    const q = ((req.query.q as string) || "").trim();
    if (!q || q.length < 2) return res.json([]);
    
    const cacheKey = q.toLowerCase();
    const cached = autocompleteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) return res.json(cached.results);
    
    try {
      if (!(storage instanceof PgStorage)) return res.json([]);
      const db = (storage as PgStorage).db;
      const { productsTable } = await import("@shared/schema");
      const { ilike, eq: eqOp, and: andOp, desc: descOp } = await import("drizzle-orm");
      
      const pattern = `%${q}%`;
      const rows = await db.select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        image: productsTable.image,
        totalPriceUsd: productsTable.totalPriceUsd,
        rating: productsTable.rating,
        reviews: productsTable.reviews,
        badge: productsTable.badge,
        category: productsTable.category,
      })
      .from(productsTable)
      .where(andOp(eqOp(productsTable.isActive, true), ilike(productsTable.name, pattern)))
      .orderBy(descOp(productsTable.reviews))
      .limit(8);
      
      autocompleteCache.set(cacheKey, { results: rows, timestamp: Date.now() });
      if (autocompleteCache.size > 500) {
        const oldest = [...autocompleteCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) autocompleteCache.delete(oldest[0]);
      }
      
      res.json(rows);
    } catch (e: any) {
      console.error('Autocomplete error:', e.message);
      res.json([]);
    }
  });

  // ===== PRODUCTS =====
  app.get("/api/products", async (req, res) => {
    const { category, search, minPrice, maxPrice, minRating, sort, page, limit } = req.query;
    const result = await storage.getProducts({
      category: category as string,
      search: search as string,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      minRating: minRating ? +minRating : undefined,
      sort: sort as string,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
    res.json(result);
  });

  app.get("/api/products/slug/:slug", async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });

  app.get("/api/products/category/:cat", async (req, res) => {
    const result = await storage.getProducts({ category: req.params.cat });
    res.json(result);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(+req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });

  app.get("/api/categories", async (_req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  // ===== REAL-TIME AMAZON SEARCH =====
  // Search cache: query -> { results, timestamp }
  const searchCache = new Map<string, { results: any[]; pageInfo: any; timestamp: number }>();
  const SEARCH_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

  // Weight estimates by detected category
  const WEIGHT_MAP: Record<string, number> = {
    tech: 3.0, phones: 0.5, gaming: 1.5, beauty: 0.5, shoes: 2.0,
    clothing: 1.0, home: 5.0, health: 1.5, baby: 3.0, sports: 3.0,
    pets: 2.0, food: 2.0, auto: 3.0, toys: 2.0, office: 1.0, default: 2.0
  };

  function estimateWeight(title: string): number {
    const t = title.toLowerCase();
    if (/laptop|monitor|tv|television/i.test(t)) return 6.0;
    if (/phone|case|earbuds|airpods|charger/i.test(t)) return 0.5;
    if (/headphone|speaker|camera/i.test(t)) return 1.5;
    if (/shoes|sneaker|boot/i.test(t)) return 2.0;
    if (/shirt|jacket|dress|pants/i.test(t)) return 1.0;
    if (/vitamin|supplement|cream|serum/i.test(t)) return 0.5;
    if (/stroller|car seat/i.test(t)) return 15.0;
    if (/dumbbell|weight|bench/i.test(t)) return 20.0;
    if (/vacuum|blender|mixer/i.test(t)) return 8.0;
    if (/toy|lego|game/i.test(t)) return 2.0;
    return 2.0;
  }

  function calculateCopikonPrice(amazonPrice: number, weightLbs: number) {
    return +(amazonPrice * 1.15 + weightLbs * 5.50).toFixed(2);
  }

  // Title translation: English -> Spanish for product names
  function translateTitle(title: string): string {
    const replacements: [RegExp, string][] = [
      // Amazon cleanup - MUST be first
      [/Amazon Basics/gi, "Copikon Basics"],
      [/Amazon Echo/gi, "Echo"],
      [/Amazon Fire/gi, "Fire"],
      [/Amazon Kids/gi, "Kids"],
      [/Amazon Exclusive/gi, "Exclusivo"],
      [/Amazon/gi, ""],
      // Common product descriptors
      [/\bWireless\b/gi, "Inalámbrico"],
      [/\bPortable\b/gi, "Portátil"],
      [/\bRechargeable\b/gi, "Recargable"],
      [/\bWaterproof\b/gi, "Resistente al agua"],
      [/\bAdjustable\b/gi, "Ajustable"],
      [/\bFoldable\b/gi, "Plegable"],
      [/\bStainless Steel\b/gi, "Acero inoxidable"],
      [/\bNoise Cancell?ing\b/gi, "Cancelación de ruido"],
      // Colors
      [/\bBlack\b/g, "Negro"], [/\bWhite\b/g, "Blanco"], [/\bBlue\b/g, "Azul"],
      [/\bRed\b/g, "Rojo"], [/\bGreen\b/g, "Verde"], [/\bPink\b/g, "Rosa"],
      [/\bGold\b/g, "Dorado"], [/\bSilver\b/g, "Plateado"], [/\bGray\b/g, "Gris"],
      [/\bPurple\b/g, "Morado"], [/\bOrange\b/g, "Naranja"], [/\bYellow\b/g, "Amarillo"],
      // Prepositions & connectors
      [/\bfor\b/gi, "para"], [/\bwith\b/gi, "con"], [/\band\b/gi, "y"],
      [/\bPack of (\d+)\b/gi, "Paquete de $1"], [/\b(\d+)[- ]?Pack\b/gi, "Paquete de $1"],
      [/\bSet of (\d+)\b/gi, "Set de $1"],
      [/\bCompatible with\b/gi, "Compatible con"],
      // Units
      [/\bInch\b/gi, "Pulgadas"], [/\binches\b/gi, "Pulgadas"],
      [/\bPound\b/gi, "Libras"], [/\bpounds\b/gi, "Libras"],
      // Product types
      [/\bHeadphones\b/gi, "Audífonos"], [/\bEarbuds\b/gi, "Auriculares"],
      [/\bSpeaker\b/gi, "Altavoz"], [/\bCharger\b/gi, "Cargador"],
      [/\bCase\b/g, "Funda"], [/\bCover\b/gi, "Funda"],
      [/\bScreen Protector\b/gi, "Protector de pantalla"],
      [/\bKeyboard\b/gi, "Teclado"], [/\bMouse\b/g, "Ratón"],
      [/\bLaptop\b/gi, "Portátil"], [/\bTablet\b/gi, "Tableta"],
      [/\bWatch\b/g, "Reloj"], [/\bBattery\b/gi, "Batería"],
      [/\bCable\b/gi, "Cable"], [/\bAdapter\b/gi, "Adaptador"],
      [/\bHolder\b/gi, "Soporte"], [/\bStand\b/g, "Soporte"],
      [/\bBag\b/g, "Bolsa"], [/\bBackpack\b/gi, "Mochila"],
      [/\bBottle\b/gi, "Botella"], [/\bBlanket\b/gi, "Manta"],
      [/\bPillow\b/gi, "Almohada"], [/\bTowel\b/gi, "Toalla"],
      [/\bShoes\b/gi, "Zapatos"], [/\bRunning\b/gi, "Correr"],
      [/\bTraining\b/gi, "Entrenamiento"],
      [/\bMen\b/g, "Hombre"], [/\bWomen\b/g, "Mujer"],
      [/\bBoys\b/g, "Niños"], [/\bGirls\b/g, "Niñas"],
      [/\bKids\b/gi, "Niños"], [/\bBaby\b/gi, "Bebé"],
      [/\bLight\b/g, "Luz"], [/\bLights\b/gi, "Luces"],
      [/\bSmall\b/gi, "Pequeño"], [/\bLarge\b/gi, "Grande"],
      [/\bMini\b/gi, "Mini"], [/\bHeavy Duty\b/gi, "Resistente"],
      // Remove Amazon-specific branding phrases
      [/\bAmazon's? Choice\b/gi, ""],
      [/\bBest Seller\b/gi, ""],
    ];
    let result = title;
    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }
    // Clean up extra spaces
    result = result.replace(/\s+/g, " ").trim();
    return result;
  }

  app.get("/api/search/amazon", async (req, res) => {
    try {
      const query = (req.query.q as string || "").trim();
      const page = Math.max(1, Math.min(5, +(req.query.page || 1)));
      if (!query || query.length < 2) {
        return res.json({ products: [], pageInfo: {} });
      }

      const cacheKey = `${query.toLowerCase()}:${page}`;
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
        return res.json({ products: cached.results, pageInfo: cached.pageInfo, source: "cache" });
      }

      // Search via Canopy
      const { results, pageInfo } = await canopySearch(query, page);

      // Transform to CopikonUSA products
      const products = results
        .filter((r: any) => !r.sponsored) // Skip sponsored
        .filter((r: any) => r.price?.value > 0) // Must have price
        .map((r: any) => {
          const amazonPrice = r.price?.value || 0;
          const weight = estimateWeight(r.title || "");
          const copikonPrice = calculateCopikonPrice(amazonPrice, weight);
          let title = (r.title || "").trim();
          if (title.length > 120) title = title.slice(0, 117) + "...";

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
            badge: (r.ratingsTotal || 0) >= 50000 ? "Más vendido" : (r.ratingsTotal || 0) >= 10000 ? "Popular" : null,
          };
        })
        .filter((p: any) => p.weight <= 150); // Filter <= 150 lbs

      // Cache results
      searchCache.set(cacheKey, { results: products, pageInfo, timestamp: Date.now() });
      // Limit cache size
      if (searchCache.size > 200) {
        const oldest = [...searchCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) searchCache.delete(oldest[0]);
      }

      res.json({ products, pageInfo, source: "live" });
    } catch (e: any) {
      console.error("Amazon search error:", e.message);
      res.status(500).json({ message: "Error buscando productos", error: e.message });
    }
  });

  // ===== IMPORT SEARCH RESULT AS PRODUCT =====
  app.post("/api/search/import", async (req, res) => {
    try {
      const { asin, name, image, price, weight, rating, reviews } = req.body;
      if (!asin || !name) return res.status(400).json({ message: "Faltan datos" });

      // Check if product already exists by ASIN
      const existing = await storage.getProducts({ search: asin, limit: 1 });
      const found = (existing.products || []).find((p: any) => {
        const specs = p.specs as any;
        return p.amazonAsin === asin || specs?.ASIN === asin;
      });

      if (found) {
        return res.json({ slug: found.slug, id: found.id });
      }

      // Create new product from search result
      const basePrice = price || 0;
      const w = weight || 1;
      const shippingPerLb = 5.50;
      const totalPriceUsd = +(basePrice * 1.15 + w * shippingPerLb).toFixed(2);

      const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().slice(0, 100);

      const product = await storage.createProduct({
        name,
        slug,
        category: "tech", // default category, admin can change
        description: name,
        basePrice,
        weight: w,
        totalPriceUsd,
        image: image || "",
        images: image ? [image] : [],
        rating: rating || 0,
        reviews: reviews || 0,
        badge: "",
        specs: { ASIN: asin },
        isActive: true,
        isManual: false,
        amazonAsin: asin,
      } as any);

      res.json({ slug: product.slug, id: product.id });
    } catch (e: any) {
      console.error("Import error:", e.message);
      res.status(500).json({ message: "Error importando producto" });
    }
  });

  // ===== PRODUCT DETAIL (Amazon enrichment) =====
  const detailCache = new Map<string, { data: any; timestamp: number }>();
  const DETAIL_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

  app.get("/api/products/:id/amazon-detail", async (req, res) => {
    try {
      const product = await storage.getProduct(+req.params.id);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
      // Try amazonAsin field first, then specs.ASIN
      const asin = product.amazonAsin || (product.specs as any)?.ASIN || "";
      if (!asin) return res.json({ images: [], featureBullets: [], variants: [] });

      // Check cache
      const cached = detailCache.get(asin);
      if (cached && Date.now() - cached.timestamp < DETAIL_CACHE_TTL) {
        return res.json(cached.data);
      }

      const detail = await getFullProductDetail(asin);
      if (!detail) return res.json({ images: [], featureBullets: [], variants: [] });

      const result = {
        images: [detail.mainImageUrl, ...(detail.imageUrls || [])].filter(Boolean),
        featureBullets: detail.featureBullets || [],
        variants: (detail.variants || []).map(v => ({
          asin: v.asin,
          text: v.text,
          attributes: v.attributes || [],
        })),
        brand: detail.brand || "",
      };

      // Cache
      detailCache.set(asin, { data: result, timestamp: Date.now() });
      if (detailCache.size > 300) {
        const oldest = [...detailCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) detailCache.delete(oldest[0]);
      }

      res.json(result);
    } catch (e: any) {
      console.error("Amazon detail error:", e.message);
      res.json({ images: [], featureBullets: [], variants: [] });
    }
  });

  // ===== ORDERS =====
  app.post("/api/orders", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    try {
      const data = insertOrderSchema.parse(req.body);
      const bcvRate = parseFloat(await storage.getSetting("bcv_rate") || "62");
      const shippingPerLb = parseFloat(await storage.getSetting("shipping_per_lb") || "5.50");
      const bsDifferential = parseFloat(await storage.getSetting("bs_differential") || "1.50");
      const order = await storage.createOrder(userId, data, { bcvRate, shippingPerLb, bsDifferential });

      // Fire-and-forget order confirmation email
      const user = await storage.getUser(userId);
      if (user) {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 48);
        const productNames = data.items.map(i => `${i.name} (x${i.quantity})`).join(", ");
        sendOrderConfirmation(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          products: productNames,
          totalUsd: order.totalUsd.toFixed(2),
          totalBs: order.totalBs.toFixed(2),
          paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod,
          estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString("es-VE"),
          branch: order.branch,
          paymentDeadline: deadline.toLocaleDateString("es-VE"),
        }).catch(() => {});
      }

      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Error creando pedido" });
    }
  });

  app.get("/api/orders/my", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const orders = await storage.getUserOrders(userId);
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(order);
  });

  app.patch("/api/orders/:id/proof", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const { paymentProof } = req.body;
    const order = await storage.updateOrder(req.params.id, { paymentProof });
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(order);
  });

  // ===== WISHLIST =====
  app.get("/api/wishlist", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const items = await storage.getWishlist(userId);
    res.json(items);
  });

  app.post("/api/wishlist", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const { productId } = req.body;
    const item = await storage.addToWishlist(userId, productId);
    res.json(item);
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    await storage.removeFromWishlist(userId, +req.params.productId);
    res.json({ ok: true });
  });

  // ===== REVIEWS =====
  app.get("/api/reviews/:productId", async (req, res) => {
    const reviews = await storage.getProductReviews(+req.params.productId);
    res.json(reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    try {
      const user = await storage.getUser(userId);
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(userId, user?.name || "Anónimo", data);
      res.json(review);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Error" });
    }
  });

  // ===== SETTINGS (public read) =====
  app.get("/api/settings/public", async (_req, res) => {
    const bcvRate = await storage.getSetting("bcv_rate") || "62";
    const shippingPerLb = await storage.getSetting("shipping_per_lb") || "5.50";
    const bsDifferential = await storage.getSetting("bs_differential") || "1.50";
    res.json({
      bcvRate: parseFloat(bcvRate),
      shippingPerLb: parseFloat(shippingPerLb),
      bsDifferential: parseFloat(bsDifferential),
    });
  });

  // ===== ADMIN =====
  const requireAdmin = async (req: any, res: any, next: any) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "No autenticado" });
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Sin permisos" });
    next();
  };

  app.get("/api/admin/dashboard", requireAdmin, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const { status } = req.query;
    const orders = await storage.getAllOrders({ status: status as string });
    res.json(orders);
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    // Fire-and-forget status update email
    const user = await storage.getUser(order.userId);
    if (user) {
      const clientStatus = ORDER_STATUS_MAP[status as OrderStatus];
      const statusLabel = CLIENT_STATUS_LABELS[clientStatus] || status;

      if (status === "payment_verified") {
        sendPaymentConfirmed(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          totalUsd: order.totalUsd.toFixed(2),
          estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString("es-VE"),
          branch: order.branch,
        }).catch(() => {});
      } else {
        sendStatusUpdate(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          status,
          statusLabel,
          branch: order.branch,
        }).catch(() => {});
      }
    }

    res.json(order);
  });

  app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    // Get order counts per user
    const allOrders = await storage.getAllOrders();
    const result = users.map(u => {
      const userOrders = allOrders.filter(o => o.userId === u.id);
      const { password, ...safe } = u;
      return {
        ...safe,
        orderCount: userOrders.length,
        totalSpent: +userOrders.reduce((sum, o) => sum + o.totalUsd, 0).toFixed(2),
      };
    });
    res.json(result);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const product = await storage.updateProduct(+req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });

  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    const { page, limit } = req.query;
    const result = await storage.getProducts({ 
      page: page ? +page : 1, 
      limit: limit ? +limit : 200 
    });
    res.json(result);
  });

  app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    const settings = await storage.getAllSettings();
    res.json(settings);
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    const updates = req.body as { key: string; value: string }[];
    for (const { key, value } of updates) {
      await storage.setSetting(key, value);
    }
    const settings = await storage.getAllSettings();
    res.json(settings);
  });

  // ===== ADMIN: CANOPY API (Amazon product import) =====
  app.post("/api/admin/products/search-amazon", requireAdmin, async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ message: "Query requerido" });
      const results = await canopySearch(query);
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Error buscando productos" });
    }
  });

  app.post("/api/admin/products/import", requireAdmin, async (req, res) => {
    try {
      const { asin, category, weight } = req.body;
      if (!asin || !category) {
        return res.status(400).json({ message: "ASIN y categoría requeridos" });
      }

      const canopyProduct = await getProductByAsin(asin);
      const productData = canopyToProduct(canopyProduct, category, weight || 1);

      // Only PgStorage has createProduct
      if (storage instanceof PgStorage) {
        const { id: _id, ...data } = productData;
        const saved = await (storage as PgStorage).createProduct(data);
        res.json(saved);
      } else {
        res.status(400).json({ message: "Importación solo disponible con base de datos PostgreSQL" });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Error importando producto" });
    }
  });

  // Bulk seed products endpoint (admin only)
  app.post("/api/admin/products/seed", requireAdmin, async (req, res) => {
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
          if (!data.createdAt) data.createdAt = new Date().toISOString();
          const saved = await (storage as PgStorage).createProduct(data);
          results.push({ name: saved.name, id: saved.id, status: "ok" });
        } catch (err: any) {
          results.push({ name: p.name, status: "error", error: err.message });
        }
      }
      const ok = results.filter(r => r.status === "ok").length;
      const fail = results.filter(r => r.status === "error").length;
      res.json({ message: `Seed completado: ${ok} creados, ${fail} errores`, total: ok, errors: fail, details: results });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Error en seed" });
    }
  });

  // Admin: Create single product manually
  // ===== CRON: PRICE & AVAILABILITY SYNC =====
  app.post("/api/admin/sync/prices", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { syncLogsTable, productsTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    // Create sync log
    const [log] = await db.insert(syncLogsTable).values({
      type: "price_sync",
      startedAt: new Date().toISOString(),
      status: "running",
    }).returning();

    res.json({ message: "Sincronización iniciada", logId: log.id });

    // Run sync in background
    (async () => {
      let updated = 0, deactivated = 0, reactivated = 0, priceAlerts = 0, errors = 0;
      const alerts: any[] = [];
      try {
        const allProducts = await db.select().from(productsTable);
        const batchSize = 5; // Process 5 at a time to avoid rate limits
        
        for (let i = 0; i < allProducts.length; i += batchSize) {
          const batch = allProducts.slice(i, i + batchSize);
          await Promise.all(batch.map(async (product) => {
            try {
              const asin = (product.specs as any)?.ASIN || product.amazonAsin;
              if (!asin) return;

              const detail = await getProductByAsin(asin);
              if (!detail || !detail.price?.value) {
                // Product unavailable
                if (product.isActive) {
                  await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                  deactivated++;
                }
                return;
              }

              // Reactivate if was inactive
              if (!product.isActive) {
                reactivated++;
              }

              const newBasePrice = detail.price.value;
              const weight = product.weight || 1;
              const newTotalPriceUsd = +(newBasePrice * 1.15 + weight * 5.50).toFixed(2);
              const oldTotalPrice = product.totalPriceUsd;
              
              // Check for large price change (>20%)
              const priceChange = oldTotalPrice > 0 ? Math.abs(newTotalPriceUsd - oldTotalPrice) / oldTotalPrice : 0;
              if (priceChange > 0.20) {
                priceAlerts++;
                alerts.push({
                  productId: product.id,
                  name: product.name,
                  oldPrice: oldTotalPrice,
                  newPrice: newTotalPriceUsd,
                  change: `${(priceChange * 100).toFixed(0)}%`,
                });
              }

              const updates: any = {
                basePrice: newBasePrice,
                totalPriceUsd: newTotalPriceUsd,
                isActive: true,
                rating: detail.rating || product.rating,
                reviews: detail.ratingsTotal || product.reviews,
              };

              // Update image if changed
              if (detail.mainImageUrl && detail.mainImageUrl !== product.image) {
                updates.image = detail.mainImageUrl;
              }

              // Update badge
              const reviews = detail.ratingsTotal || 0;
              const rating = detail.rating || 0;
              updates.badge = reviews >= 50000 ? "Más vendido" : reviews >= 10000 ? "Popular" : (reviews >= 5000 && rating >= 4.5) ? "Popular" : "";

              // Save old price for "was $X" display
              if (oldTotalPrice !== newTotalPriceUsd) {
                updates.oldPrice = oldTotalPrice;
                updated++;
              }

              await db.update(productsTable).set(updates).where(eq(productsTable.id, product.id));
            } catch (e: any) {
              errors++;
            }
          }));
          // Rate limit: wait between batches
          await new Promise(r => setTimeout(r, 200));
        }

        await db.update(syncLogsTable).set({
          completedAt: new Date().toISOString(),
          totalProducts: allProducts.length,
          updated,
          deactivated,
          reactivated,
          priceAlerts,
          errors,
          status: "completed",
          details: { alerts },
        }).where(eq(syncLogsTable.id, log.id));

        console.log(`[SYNC] Completed: ${updated} updated, ${deactivated} deactivated, ${reactivated} reactivated, ${priceAlerts} alerts, ${errors} errors`);
      } catch (e: any) {
        await db.update(syncLogsTable).set({
          completedAt: new Date().toISOString(),
          status: "failed",
          details: { error: e.message },
        }).where(eq(syncLogsTable.id, log.id));
        console.error(`[SYNC] Failed:`, e.message);
      }
    })();
  });

  // ===== CRON: TRANSLATE TITLES =====
  app.post("/api/admin/sync/translate", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable, syncLogsTable } = await import("@shared/schema");
    const { eq, sql } = await import("drizzle-orm");

    // Find products with English titles (simple heuristic: contains common English words)
    const allProducts = await db.select({ id: productsTable.id, name: productsTable.name })
      .from(productsTable)
      .where(sql`${productsTable.name} ~* '( for | with | and | the | inch| pack|black|white|compatible|wireless|portable|charger|headphone|earbuds|battery|speaker)'`);

    const [log] = await db.insert(syncLogsTable).values({
      type: "translation",
      startedAt: new Date().toISOString(),
      totalProducts: allProducts.length,
      status: "running",
    }).returning();

    res.json({ message: `Traducción iniciada para ${allProducts.length} productos`, logId: log.id });

    // Background translation
    (async () => {
      let translated = 0, errors = 0;
      const BATCH = 20;
      for (let i = 0; i < allProducts.length; i += BATCH) {
        const batch = allProducts.slice(i, i + BATCH);
        const titles = batch.map(p => p.name);
        try {
          // Use a simple translation approach: key English->Spanish word replacements
          for (const product of batch) {
            try {
              const translated_name = translateTitle(product.name);
              if (translated_name !== product.name) {
                await db.update(productsTable)
                  .set({ name: translated_name })
                  .where(eq(productsTable.id, product.id));
                translated++;
              }
            } catch { errors++; }
          }
        } catch { errors += batch.length; }
      }

      await db.update(syncLogsTable).set({
        completedAt: new Date().toISOString(),
        updated: translated,
        errors,
        status: "completed",
      }).where(eq(syncLogsTable.id, log.id));
      console.log(`[TRANSLATE] Done: ${translated} translated, ${errors} errors`);
    })();
  });

  // ===== GET SYNC LOGS =====
  app.get("/api/admin/sync/logs", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.json([]);
    const db = (storage as PgStorage).db;
    const { syncLogsTable } = await import("@shared/schema");
    const { desc } = await import("drizzle-orm");
    const logs = await db.select().from(syncLogsTable).orderBy(desc(syncLogsTable.id)).limit(50);
    res.json(logs);
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      if (!(storage instanceof PgStorage)) {
        return res.status(400).json({ message: "Solo disponible con PostgreSQL" });
      }
      const data = req.body;
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      const saved = await (storage as PgStorage).createProduct(data);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Error creando producto" });
    }
  });

  return httpServer;
}
