import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertOrderSchema, insertReviewSchema, PAYMENT_METHOD_LABELS, CLIENT_STATUS_LABELS, ORDER_STATUS_MAP, type OrderStatus } from "@shared/schema";
import bcrypt from "bcryptjs";
import { searchProducts as canopySearch, getProductByAsin, canopyToProduct } from "./canopy";
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
    const result = await storage.getProducts({ limit: 200 });
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
