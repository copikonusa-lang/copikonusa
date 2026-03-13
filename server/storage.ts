import {
  type User, type Product, type Order, type WishlistItem,
  type Review, type Setting, type InsertUser, type InsertOrder,
  type InsertReview, type OrderItem, type OrderStatus,
} from "@shared/schema";
import { randomUUID } from "crypto";
import productsData from "./products-data.json";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Products
  getProducts(filters?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; minRating?: number; sort?: string; page?: number; limit?: number }): Promise<{ products: Product[]; total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined>;
  getCategories(): Promise<{ id: string; name: string; count: number }[]>;

  // Orders
  createOrder(userId: string, data: InsertOrder, settings: { bcvRate: number; shippingPerLb: number; bsDifferential: number }): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(filters?: { status?: string }): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;

  // Wishlist
  getWishlist(userId: string): Promise<(WishlistItem & { product?: Product })[]>;
  addToWishlist(userId: string, productId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;

  // Reviews
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(userId: string, userName: string, data: InsertReview): Promise<Review>;

  // Settings
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
  getAllSettings(): Promise<Setting[]>;

  // Dashboard
  getDashboardStats(): Promise<any>;
}

function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CK-${num}`;
}

function calculateEstimatedDelivery(): string {
  const now = new Date();
  // Amazon to Miami: +3 days
  const arrivesMiami = new Date(now);
  arrivesMiami.setDate(arrivesMiami.getDate() + 3);

  // If before Thursday (0=Sun, 4=Thu), ships this Friday
  // If Friday or after, ships next Friday
  let shipDate = new Date(arrivesMiami);
  const day = arrivesMiami.getDay();

  if (day <= 4) {
    // Ships this Friday
    shipDate.setDate(arrivesMiami.getDate() + (5 - day));
  } else {
    // Ships next Friday
    shipDate.setDate(arrivesMiami.getDate() + (12 - day));
  }

  // Friday → Tuesday (+4 days)
  const arriveVzla = new Date(shipDate);
  arriveVzla.setDate(shipDate.getDate() + 4);

  // Tuesday → Wednesday (+1 day)
  const available = new Date(arriveVzla);
  available.setDate(arriveVzla.getDate() + 1);

  return available.toISOString();
}

function buildAmazonCartUrl(items: OrderItem[]): string {
  let url = "https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=copikonusa-20";
  items.forEach((item, i) => {
    if (item.amazonAsin) {
      url += `&ASIN.${i + 1}=${item.amazonAsin}&Quantity.${i + 1}=${item.quantity}`;
    }
  });
  return url;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<number, Product>;
  private orders: Map<string, Order>;
  private wishlist: Map<string, WishlistItem>;
  private reviews: Map<string, Review>;
  private settings: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.wishlist = new Map();
    this.reviews = new Map();
    this.settings = new Map();
    this.seed();
  }

  private seed() {
    // Admin user
    const adminId = randomUUID();
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
      createdAt: new Date().toISOString(),
    });

    // Products from catalog
    for (const p of productsData as any[]) {
      this.products.set(p.id, p as Product);
    }

    // Default settings
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
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(data: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
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
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data, id };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "customer");
  }

  // ===== PRODUCTS =====
  async getProducts(filters?: any): Promise<{ products: Product[]; total: number }> {
    let prods = Array.from(this.products.values()).filter(p => p.isActive);

    if (filters?.category) {
      prods = prods.filter(p => p.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (filters?.minPrice !== undefined) {
      prods = prods.filter(p => p.totalPriceUsd >= filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      prods = prods.filter(p => p.totalPriceUsd <= filters.maxPrice);
    }
    if (filters?.minRating !== undefined) {
      prods = prods.filter(p => p.rating >= filters.minRating);
    }

    const total = prods.length;

    // Sort
    if (filters?.sort === "price_asc") prods.sort((a, b) => a.totalPriceUsd - b.totalPriceUsd);
    else if (filters?.sort === "price_desc") prods.sort((a, b) => b.totalPriceUsd - a.totalPriceUsd);
    else if (filters?.sort === "rating") prods.sort((a, b) => b.rating - a.rating);
    else if (filters?.sort === "name") prods.sort((a, b) => a.name.localeCompare(b.name));
    else prods.sort((a, b) => b.reviews - a.reviews); // Default: popularity

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    prods = prods.slice(start, start + limit);

    return { products: prods, total };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.slug === slug);
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...data, id };
    if (data.basePrice !== undefined || data.weight !== undefined) {
      const bp = data.basePrice ?? product.basePrice;
      const w = data.weight ?? product.weight;
      const shippingPerLb = parseFloat(await this.getSetting("shipping_per_lb") || "5.50");
      updated.totalPriceUsd = +(bp * 1.15 + w * shippingPerLb).toFixed(2);
    }
    this.products.set(id, updated);
    return updated;
  }

  async getCategories(): Promise<{ id: string; name: string; count: number }[]> {
    const counts: Record<string, number> = {};
    for (const p of this.products.values()) {
      if (p.isActive) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    const catNames: Record<string, string> = {
      tech: "Tecnología", phones: "Teléfonos", gaming: "Gaming",
      beauty: "Belleza", shoes: "Calzado", clothing: "Ropa y Moda",
      home: "Hogar y Cocina", health: "Salud", baby: "Bebés y Niños",
      sports: "Deportes", pets: "Mascotas", food: "Comestibles",
      auto: "Autos y Herramientas", toys: "Juguetes", office: "Oficina",
    };
    return Object.entries(counts).map(([id, count]) => ({
      id, name: catNames[id] || id, count,
    })).sort((a, b) => b.count - a.count);
  }

  // ===== ORDERS =====
  async createOrder(userId: string, data: InsertOrder, settings: { bcvRate: number; shippingPerLb: number; bsDifferential: number }): Promise<Order> {
    const id = randomUUID();
    let subtotalUsd = 0;
    let totalWeight = 0;

    for (const item of data.items) {
      subtotalUsd += item.priceUsd * item.quantity;
      totalWeight += item.weight * item.quantity;
    }

    const shippingUsd = +(totalWeight * settings.shippingPerLb).toFixed(2);
    const totalUsd = +(subtotalUsd).toFixed(2);
    const totalBs = +(totalUsd * settings.bsDifferential * settings.bcvRate).toFixed(2);

    const order: Order = {
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
      createdAt: new Date().toISOString(),
    };

    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(o => o.orderNumber === orderNumber);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllOrders(filters?: { status?: string }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, ...data, id };
    this.orders.set(id, updated);
    return updated;
  }

  // ===== WISHLIST =====
  async getWishlist(userId: string): Promise<(WishlistItem & { product?: Product })[]> {
    const items = Array.from(this.wishlist.values()).filter(w => w.userId === userId);
    return items.map(w => ({
      ...w,
      product: this.products.get(w.productId),
    }));
  }

  async addToWishlist(userId: string, productId: number): Promise<WishlistItem> {
    const existing = Array.from(this.wishlist.values()).find(
      w => w.userId === userId && w.productId === productId
    );
    if (existing) return existing;

    const id = randomUUID();
    const item: WishlistItem = { id, userId, productId };
    this.wishlist.set(id, item);
    return item;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    for (const [key, item] of this.wishlist.entries()) {
      if (item.userId === userId && item.productId === productId) {
        this.wishlist.delete(key);
        break;
      }
    }
  }

  // ===== REVIEWS =====
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReview(userId: string, userName: string, data: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      id,
      userId,
      userName,
      productId: data.productId,
      orderId: data.orderId || "",
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // ===== SETTINGS =====
  async getSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.settings.set(key, value);
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.entries()).map(([key, value]) => ({ key, value }));
  }

  // ===== DASHBOARD =====
  async getDashboardStats(): Promise<any> {
    const orders = Array.from(this.orders.values());
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const todaySales = orders
      .filter(o => o.createdAt.startsWith(today) && o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const weekSales = orders
      .filter(o => new Date(o.createdAt) >= weekAgo && o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const monthSales = orders
      .filter(o => new Date(o.createdAt) >= monthAgo && o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const totalRevenue = orders
      .filter(o => o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const pendingOrders = orders.filter(o => o.status === "pending_payment").length;
    const totalCustomers = Array.from(this.users.values()).filter(u => u.role === "customer").length;

    return {
      todaySales: +todaySales.toFixed(2),
      weekSales: +weekSales.toFixed(2),
      monthSales: +monthSales.toFixed(2),
      totalRevenue: +totalRevenue.toFixed(2),
      pendingOrders,
      totalCustomers,
      totalOrders: orders.length,
      totalProducts: this.products.size,
      recentOrders: orders.slice(0, 10),
    };
  }
}

import { PgStorage } from "./pg-storage";

export const storage: IStorage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();
