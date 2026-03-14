import { z } from "zod";
import { pgTable, text, integer, boolean, real, jsonb, serial } from "drizzle-orm/pg-core";

// ============ DRIZZLE TABLES ============

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").default(""),
  city: text("city").notNull(),
  address: text("address").default(""),
  branch: text("branch").notNull(),
  role: text("role").notNull().default("customer"),
  createdAt: text("created_at").notNull(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  basePrice: real("base_price").notNull(),
  weight: real("weight").notNull(),
  totalPriceUsd: real("total_price_usd").notNull(),
  image: text("image").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  rating: real("rating").default(0),
  reviews: integer("reviews").default(0),
  badge: text("badge").default(""),
  specs: jsonb("specs").$type<Record<string, string>>().default({}),
  isActive: boolean("is_active").default(true),
  isManual: boolean("is_manual").default(false),
  amazonAsin: text("amazon_asin").default(""),
  oldPrice: real("old_price"),
  createdAt: text("created_at").notNull(),
});

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotalUsd: real("subtotal_usd").notNull(),
  shippingUsd: real("shipping_usd").notNull(),
  totalUsd: real("total_usd").notNull(),
  totalBs: real("total_bs").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentProof: text("payment_proof").default(""),
  status: text("status").notNull().default("pending_payment"),
  branch: text("branch").notNull(),
  deliveryType: text("delivery_type").notNull(),
  deliveryAddress: text("delivery_address").default(""),
  estimatedDelivery: text("estimated_delivery").notNull(),
  amazonCartUrl: text("amazon_cart_url").default(""),
  notes: text("notes").default(""),
  createdAt: text("created_at").notNull(),
});

export const wishlistTable = pgTable("wishlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: integer("product_id").notNull(),
});

export const reviewsTable = pgTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  productId: integer("product_id").notNull(),
  orderId: text("order_id").default(""),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: text("created_at").notNull(),
});

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const syncLogsTable = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'price_sync' | 'translation' | 'availability'
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  totalProducts: integer("total_products").default(0),
  updated: integer("updated").default(0),
  deactivated: integer("deactivated").default(0),
  reactivated: integer("reactivated").default(0),
  priceAlerts: integer("price_alerts").default(0),
  errors: integer("errors").default(0),
  status: text("status").notNull().default("running"), // 'running' | 'completed' | 'failed'
  details: jsonb("details").$type<any>().default({}),
});

// ============ TYPES ============

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  branch: string;
  role: "admin" | "employee" | "customer";
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  weight: number;
  totalPriceUsd: number;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  badge: string;
  specs: Record<string, string>;
  isActive: boolean;
  isManual: boolean;
  amazonAsin: string;
  oldPrice?: number;
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  image: string;
  quantity: number;
  priceUsd: number;
  weight: number;
  amazonAsin: string;
}

export type OrderStatus =
  | "pending_payment"
  | "payment_verified"
  | "buying_amazon"
  | "en_route_miami"
  | "in_warehouse"
  | "in_air"
  | "in_venezuela"
  | "at_branch"
  | "delivered";

export type ClientOrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "in_preparation"
  | "in_transit"
  | "ready_pickup"
  | "delivered";

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalUsd: number;
  shippingUsd: number;
  totalUsd: number;
  totalBs: number;
  paymentMethod: "zelle" | "binance" | "bank_vzla";
  paymentProof: string;
  status: OrderStatus;
  branch: string;
  deliveryType: "pickup" | "delivery";
  deliveryAddress: string;
  estimatedDelivery: string;
  amazonCartUrl: string;
  notes: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: number;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

// ============ INSERT SCHEMAS ============

export const insertUserSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  phone: z.string().min(7, "Teléfono requerido"),
  whatsapp: z.string().optional().default(""),
  city: z.string().min(2, "Ciudad requerida"),
  address: z.string().optional().default(""),
  branch: z.string().min(1, "Sucursal requerida"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const insertOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    image: z.string(),
    quantity: z.number().min(1).max(5),
    priceUsd: z.number(),
    weight: z.number(),
    amazonAsin: z.string(),
  })),
  paymentMethod: z.enum(["zelle", "binance", "bank_vzla"]),
  branch: z.string(),
  deliveryType: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export const insertReviewSchema = z.object({
  productId: z.number(),
  orderId: z.string().optional().default(""),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, "Escribe un comentario"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// ============ CONSTANTS ============

export const BRANCHES = ["Caracas", "Barquisimeto", "Valencia", "Maracay"];

export const ORDER_STATUS_MAP: Record<OrderStatus, ClientOrderStatus> = {
  pending_payment: "pending_payment",
  payment_verified: "payment_confirmed",
  buying_amazon: "in_preparation",
  en_route_miami: "in_preparation",
  in_warehouse: "in_preparation",
  in_air: "in_transit",
  in_venezuela: "in_transit",
  at_branch: "ready_pickup",
  delivered: "delivered",
};

export const CLIENT_STATUS_LABELS: Record<ClientOrderStatus, string> = {
  pending_payment: "Pago pendiente",
  payment_confirmed: "Pago confirmado",
  in_preparation: "En preparación",
  in_transit: "En camino",
  ready_pickup: "Listo para retiro",
  delivered: "Entregado",
};

export const ADMIN_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pendiente de pago",
  payment_verified: "Pago verificado",
  buying_amazon: "Comprando en Amazon",
  en_route_miami: "En camino a Miami",
  in_warehouse: "En warehouse (2BC)",
  in_air: "En aéreo",
  in_venezuela: "En Venezuela",
  at_branch: "En sucursal",
  delivered: "Entregado",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  zelle: "Zelle",
  binance: "Binance (USDT)",
  bank_vzla: "Transferencia/Pago Móvil",
};

export const CATEGORIES: Category[] = [
  { id: "tech", name: "Tecnología", icon: "💻" },
  { id: "phones", name: "Teléfonos", icon: "📱" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "beauty", name: "Belleza y Cuidado Personal", icon: "💄" },
  { id: "shoes", name: "Calzado", icon: "👟" },
  { id: "clothing", name: "Ropa y Moda", icon: "👕" },
  { id: "home", name: "Hogar y Cocina", icon: "🏠" },
  { id: "health", name: "Salud y Bienestar", icon: "💊" },
  { id: "baby", name: "Bebés y Niños", icon: "👶" },
  { id: "sports", name: "Deportes y Fitness", icon: "🏋️" },
  { id: "pets", name: "Mascotas", icon: "🐕" },
  { id: "food", name: "Comestibles y Snacks", icon: "🍎" },
  { id: "auto", name: "Autos y Herramientas", icon: "🔧" },
  { id: "toys", name: "Juguetes", icon: "🧸" },
  { id: "office", name: "Oficina y Escolar", icon: "📚" },
];
