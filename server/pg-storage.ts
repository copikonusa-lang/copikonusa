import {
  type User, type Product, type Order, type WishlistItem,
  type Review, type Setting, type InsertUser, type InsertOrder,
  type InsertReview, type OrderItem, type OrderStatus,
  usersTable, productsTable, ordersTable, wishlistTable,
  reviewsTable, settingsTable,
} from "@shared/schema";
import { eq, ilike, and, or, gte, lte, desc, asc, sql, count } from "drizzle-orm";
import { getDb } from "./db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { IStorage } from "./storage";

function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CK-${num}`;
}

function calculateEstimatedDelivery(): string {
  const now = new Date();
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

function buildAmazonCartUrl(items: OrderItem[]): string {
  let url = "https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=copikonusa-20";
  items.forEach((item, i) => {
    if (item.amazonAsin) {
      url += `&ASIN.${i + 1}=${item.amazonAsin}&Quantity.${i + 1}=${item.quantity}`;
    }
  });
  return url;
}

export class PgStorage implements IStorage {
  private db;

  constructor() {
    this.db = getDb()!;
    this.seed();
  }

  private async seed() {
    // Check if admin exists
    const existing = await this.db.select().from(usersTable).where(eq(usersTable.email, "admin@copikonusa.com")).limit(1);
    if (existing.length === 0) {
      const hashedPw = await bcrypt.hash("admin123", 10);
      await this.db.insert(usersTable).values({
        id: randomUUID(),
        name: "Admin CopikonUSA",
        email: "admin@copikonusa.com",
        password: hashedPw,
        phone: "+584120000000",
        whatsapp: "+584120000000",
        city: "Caracas",
        address: "",
        branch: "Caracas",
        role: "admin",
        createdAt: new Date().toISOString(),
      });
    }

    // Seed default settings
    const defaultSettings: Record<string, string> = {
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
      delivery_maracay: "6",
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      const exists = await this.db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
      if (exists.length === 0) {
        await this.db.insert(settingsTable).values({ key, value });
      }
    }
  }

  // ===== USERS =====
  async getUser(id: string): Promise<User | undefined> {
    const rows = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return rows[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db.select().from(usersTable).where(ilike(usersTable.email, email)).limit(1);
    return rows[0] as User | undefined;
  }

  async createUser(data: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPw = await bcrypt.hash(data.password, 10);
    const user: typeof usersTable.$inferInsert = {
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
      createdAt: new Date().toISOString(),
    };
    await this.db.insert(usersTable).values(user);
    return user as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const { id: _id, ...updateData } = data as any;
    const rows = await this.db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
    return rows[0] as User | undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const rows = await this.db.select().from(usersTable).where(eq(usersTable.role, "customer"));
    return rows as User[];
  }

  // ===== PRODUCTS =====
  async getProducts(filters?: any): Promise<{ products: Product[]; total: number }> {
    const conditions: any[] = [eq(productsTable.isActive, true)];

    if (filters?.category) {
      conditions.push(eq(productsTable.category, filters.category));
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(productsTable.name, q),
          ilike(productsTable.description, q),
          ilike(productsTable.category, q),
        )
      );
    }
    if (filters?.minPrice !== undefined) {
      conditions.push(gte(productsTable.totalPriceUsd, filters.minPrice));
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(productsTable.totalPriceUsd, filters.maxPrice));
    }
    if (filters?.minRating !== undefined) {
      conditions.push(gte(productsTable.rating, filters.minRating));
    }

    const where = and(...conditions);

    // Count
    const countResult = await this.db.select({ count: count() }).from(productsTable).where(where);
    const total = countResult[0]?.count || 0;

    // Sort
    let orderBy;
    if (filters?.sort === "price_asc") orderBy = asc(productsTable.totalPriceUsd);
    else if (filters?.sort === "price_desc") orderBy = desc(productsTable.totalPriceUsd);
    else if (filters?.sort === "rating") orderBy = desc(productsTable.rating);
    else if (filters?.sort === "name") orderBy = asc(productsTable.name);
    else orderBy = desc(productsTable.reviews);

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const rows = await this.db.select().from(productsTable)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { products: rows as Product[], total };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const rows = await this.db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    return rows[0] as Product | undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const rows = await this.db.select().from(productsTable).where(eq(productsTable.slug, slug)).limit(1);
    return rows[0] as Product | undefined;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined> {
    const { id: _id, ...updateData } = data as any;
    if (data.basePrice !== undefined || data.weight !== undefined) {
      const current = await this.getProduct(id);
      if (current) {
        const bp = data.basePrice ?? current.basePrice;
        const w = data.weight ?? current.weight;
        const shippingPerLb = parseFloat(await this.getSetting("shipping_per_lb") || "5.50");
        updateData.totalPriceUsd = +(bp * 1.15 + w * shippingPerLb).toFixed(2);
      }
    }
    const rows = await this.db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    return rows[0] as Product | undefined;
  }

  async getCategories(): Promise<{ id: string; name: string; count: number }[]> {
    const rows = await this.db
      .select({ category: productsTable.category, count: count() })
      .from(productsTable)
      .where(eq(productsTable.isActive, true))
      .groupBy(productsTable.category);

    const catNames: Record<string, string> = {
      tech: "Tecnología", phones: "Teléfonos", gaming: "Gaming",
      beauty: "Belleza", shoes: "Calzado", clothing: "Ropa y Moda",
      home: "Hogar y Cocina", health: "Salud", baby: "Bebés y Niños",
      sports: "Deportes", pets: "Mascotas", food: "Comestibles",
      auto: "Autos y Herramientas", toys: "Juguetes", office: "Oficina",
    };

    return rows
      .map((r) => ({
        id: r.category,
        name: catNames[r.category] || r.category,
        count: r.count,
      }))
      .sort((a, b) => b.count - a.count);
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
    const totalUsd = +subtotalUsd.toFixed(2);
    const totalBs = +(totalUsd * settings.bsDifferential * settings.bcvRate).toFixed(2);

    const order: typeof ordersTable.$inferInsert = {
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

    await this.db.insert(ordersTable).values(order);
    return order as unknown as Order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const rows = await this.db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    return rows[0] as Order | undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const rows = await this.db.select().from(ordersTable).where(eq(ordersTable.orderNumber, orderNumber)).limit(1);
    return rows[0] as Order | undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const rows = await this.db.select().from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));
    return rows as Order[];
  }

  async getAllOrders(filters?: { status?: string }): Promise<Order[]> {
    const conditions: any[] = [];
    if (filters?.status) {
      conditions.push(eq(ordersTable.status, filters.status));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await this.db.select().from(ordersTable)
      .where(where)
      .orderBy(desc(ordersTable.createdAt));
    return rows as Order[];
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const rows = await this.db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    return rows[0] as Order | undefined;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const { id: _id, ...updateData } = data as any;
    const rows = await this.db.update(ordersTable).set(updateData).where(eq(ordersTable.id, id)).returning();
    return rows[0] as Order | undefined;
  }

  // ===== WISHLIST =====
  async getWishlist(userId: string): Promise<(WishlistItem & { product?: Product })[]> {
    const items = await this.db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
    const result: (WishlistItem & { product?: Product })[] = [];
    for (const w of items) {
      const prodRows = await this.db.select().from(productsTable).where(eq(productsTable.id, w.productId)).limit(1);
      result.push({ ...w as WishlistItem, product: prodRows[0] as Product | undefined });
    }
    return result;
  }

  async addToWishlist(userId: string, productId: number): Promise<WishlistItem> {
    const existing = await this.db.select().from(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)))
      .limit(1);
    if (existing.length > 0) return existing[0] as WishlistItem;

    const id = randomUUID();
    const item = { id, userId, productId };
    await this.db.insert(wishlistTable).values(item);
    return item;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await this.db.delete(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  }

  // ===== REVIEWS =====
  async getProductReviews(productId: number): Promise<Review[]> {
    const rows = await this.db.select().from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.createdAt));
    return rows as Review[];
  }

  async createReview(userId: string, userName: string, data: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: typeof reviewsTable.$inferInsert = {
      id,
      userId,
      userName,
      productId: data.productId,
      orderId: data.orderId || "",
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    await this.db.insert(reviewsTable).values(review);
    return review as Review;
  }

  // ===== SETTINGS =====
  async getSetting(key: string): Promise<string | undefined> {
    const rows = await this.db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    return rows[0]?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const exists = await this.db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    if (exists.length > 0) {
      await this.db.update(settingsTable).set({ value }).where(eq(settingsTable.key, key));
    } else {
      await this.db.insert(settingsTable).values({ key, value });
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    const rows = await this.db.select().from(settingsTable);
    return rows as Setting[];
  }

  // ===== DASHBOARD =====
  async getDashboardStats(): Promise<any> {
    const orders = await this.db.select().from(ordersTable);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const allOrders = orders as Order[];

    const todaySales = allOrders
      .filter(o => o.createdAt.startsWith(today) && o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const weekSales = allOrders
      .filter(o => new Date(o.createdAt) >= weekAgo && o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const monthSales = allOrders
      .filter(o => new Date(o.createdAt) >= monthAgo && o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const totalRevenue = allOrders
      .filter(o => o.status !== "pending_payment")
      .reduce((sum, o) => sum + o.totalUsd, 0);

    const pendingOrders = allOrders.filter(o => o.status === "pending_payment").length;

    const customerCount = await this.db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "customer"));
    const totalCustomers = customerCount[0]?.count || 0;

    const productCount = await this.db.select({ count: count() }).from(productsTable);
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
      recentOrders: allOrders.slice(0, 10),
    };
  }

  // ===== PRODUCT CREATION (for Canopy import) =====
  async createProduct(data: Omit<Product, "id">): Promise<Product> {
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
      createdAt: data.createdAt,
    }).returning();
    return rows[0] as Product;
  }
}
