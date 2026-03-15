import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertOrderSchema, insertReviewSchema, PAYMENT_METHOD_LABELS, CLIENT_STATUS_LABELS, ORDER_STATUS_MAP, type OrderStatus } from "@shared/schema";
import bcrypt from "bcryptjs";
import { searchProducts as canopySearch, getProductByAsin, canopyToProduct, getFullProductDetail } from "./canopy";
import { sendWelcomeEmail, sendOrderConfirmation, sendPaymentConfirmed, sendStatusUpdate, sendOrderShipped, sendReadyForPickup, sendOrderCancelled, sendPaymentReminder, sendAdminNewOrderAlert, sendAdminPaymentReceivedAlert } from "./email";
import { sendWhatsAppOrderUpdate } from "./whatsapp";
import { PgStorage } from "./pg-storage";

// Simple in-memory sessions: token -> userId
const sessions = new Map<string, string>();

// ===== SEARCH SYNONYM EXPANSION =====
// Maps common Spanish search terms to their English equivalents found in product names.
// This allows Venezuelan users to search in Spanish and find products with English names.
// Also handles common misspellings and accent-free variants.
const SEARCH_SYNONYMS: Record<string, string[]> = {
  // ── ELECTRONICS & TECH ──
  "disco duro": ["hard drive", "external hard drive", "HDD", "SSD"],
  "audifonos": ["headphones", "earbuds", "earphones", "headset"],
  "audífonos": ["headphones", "earbuds", "earphones", "headset"],
  "auriculares": ["headphones", "earbuds", "earphones"],
  "pantalla": ["monitor", "screen", "display"],
  "monitor": ["monitor", "display"],
  "teclado": ["keyboard"],
  "raton": ["mouse"],
  "ratón": ["mouse"],
  "mouse": ["mouse"],
  "cargador": ["charger", "charging"],
  "bateria": ["battery", "power bank"],
  "batería": ["battery", "power bank"],
  "bocina": ["speaker", "bluetooth speaker"],
  "parlante": ["speaker", "bluetooth speaker"],
  "altavoz": ["speaker"],
  "corneta": ["speaker"],
  "impresora": ["printer"],
  "camara": ["camera"],
  "cámara": ["camera"],
  "camara web": ["webcam"],
  "webcam": ["webcam"],
  "reloj": ["watch", "clock"],
  "reloj inteligente": ["smartwatch", "smart watch"],
  "smartwatch": ["smartwatch", "smart watch"],
  "computadora": ["computer", "laptop", "PC"],
  "computador": ["computer", "laptop", "PC"],
  "portatil": ["laptop", "notebook"],
  "portátil": ["laptop", "notebook"],
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
  "televisión": ["TV", "smart TV", "television"],
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
  "trípode": ["tripod"],
  "soporte": ["stand", "mount", "holder"],
  // ── FOOD & GROCERY ──
  "proteina": ["protein", "whey protein"],
  "proteína": ["protein", "whey protein"],
  "suplemento": ["supplement"],
  "suplementos": ["supplements"],
  "vitamina": ["vitamin", "vitamins"],
  "vitaminas": ["vitamin", "vitamins"],
  "cafe": ["coffee"],
  "café": ["coffee"],
  "te": ["tea"],
  "té": ["tea"],
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
  "azúcar": ["sugar"],
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
  "atún": ["tuna"],
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
  "pantalón": ["pants", "jeans"],
  "pantalones": ["pants", "jeans"],
  "short": ["shorts"],
  "bermuda": ["shorts"],
  "vestido": ["dress"],
  "falda": ["skirt"],
  "chaqueta": ["jacket"],
  "sudadera": ["hoodie", "sweatshirt"],
  "sueter": ["sweater"],
  "suéter": ["sweater"],
  "abrigo": ["coat", "jacket"],
  "gorra": ["cap", "hat"],
  "sombrero": ["hat"],
  "mochila": ["backpack"],
  "bolso": ["bag", "handbag", "tote"],
  "cartera": ["wallet", "purse"],
  "billetera": ["wallet"],
  "lentes": ["glasses", "sunglasses"],
  "gafas": ["glasses", "sunglasses"],
  "lentes de sol": ["sunglasses"],
  "cinturon": ["belt"],
  "cinturón": ["belt"],
  "corbata": ["tie", "necktie"],
  "bufanda": ["scarf"],
  "guantes": ["gloves"],
  "medias": ["socks", "stockings"],
  "calcetines": ["socks"],
  "ropa interior": ["underwear", "boxer", "briefs"],
  "brassier": ["bra"],
  "brasier": ["bra"],
  "sostén": ["bra"],
  "traje de bano": ["swimsuit", "swimwear", "bikini"],
  "traje de baño": ["swimsuit", "swimwear", "bikini"],
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
  "joyería": ["jewelry"],
  "reloj hombre": ["men watch", "mens watch"],
  "reloj mujer": ["women watch", "womens watch"],
  // ── HOME & KITCHEN ──
  "almohada": ["pillow"],
  "sabanas": ["sheets", "bedding", "bed sheet"],
  "sábanas": ["sheets", "bedding", "bed sheet"],
  "colchon": ["mattress"],
  "colchón": ["mattress"],
  "cobija": ["blanket", "throw"],
  "manta": ["blanket", "throw"],
  "frazada": ["blanket"],
  "edredon": ["comforter", "duvet"],
  "edredón": ["comforter", "duvet"],
  "cortina": ["curtain", "curtains", "drape"],
  "cortinas": ["curtains", "drapes"],
  "alfombra": ["rug", "carpet", "mat"],
  "tapete": ["rug", "carpet", "mat"],
  "lampara": ["lamp", "light"],
  "lámpara": ["lamp", "light"],
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
  "sartén": ["pan", "skillet", "frying pan"],
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
  "pestañas": ["lashes", "eyelashes", "mascara"],
  "delineador": ["eyeliner"],
  "sombra de ojos": ["eyeshadow"],
  "polvo compacto": ["face powder", "compact"],
  "crema": ["cream", "lotion", "moisturizer"],
  "crema corporal": ["body lotion", "body cream"],
  "crema facial": ["face cream", "moisturizer"],
  "protector solar": ["sunscreen", "SPF", "sunblock"],
  "bloqueador solar": ["sunscreen", "sunblock"],
  "perfume": ["perfume", "cologne", "fragrance"],
  "colonia": ["cologne", "fragrance"],
  "desodorante": ["deodorant"],
  "champu": ["shampoo"],
  "champú": ["shampoo"],
  "acondicionador": ["conditioner"],
  "jabon": ["soap", "body wash"],
  "jabón": ["soap", "body wash"],
  "gel de bano": ["body wash", "shower gel"],
  "gel de baño": ["body wash", "shower gel"],
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
  "uñas": ["nails", "nail polish"],
  "esmalte": ["nail polish"],
  // ── CLEANING & HOUSEHOLD ──
  "papel de bano": ["toilet paper", "bath tissue"],
  "papel de baño": ["toilet paper", "bath tissue"],
  "papel higienico": ["toilet paper", "bath tissue"],
  "papel higiénico": ["toilet paper", "bath tissue"],
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
  "juguete": ["toy"],
  "juguetes": ["toys"],
  "muñeca": ["doll"],
  "muñeco": ["action figure", "doll"],
  "lego": ["LEGO", "building blocks"],
  "rompecabezas": ["puzzle", "jigsaw"],
  "pañales": ["diapers"],
  "pañal": ["diaper", "diapers"],
  "toallitas humedas": ["wipes", "baby wipes"],
  "toallitas húmedas": ["wipes", "baby wipes"],
  "biberón": ["bottle", "baby bottle"],
  "biberon": ["bottle", "baby bottle"],
  "tetero": ["baby bottle", "bottle"],
  "chupete": ["pacifier"],
  "chupon": ["pacifier"],
  "chupón": ["pacifier"],
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
  "balón": ["ball"],
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
  "neumáticos": ["tires"],
  "limpia parabrisas": ["windshield wiper"],
  "bateria de carro": ["car battery"],
  "luces led carro": ["LED headlight", "car LED"],
  "ambientador carro": ["car air freshener"],
  "camara trasera": ["backup camera", "dash cam"],
  "dash cam": ["dash cam", "dashcam"],
  // ── OFFICE & SCHOOL ──
  "cuaderno": ["notebook", "journal"],
  "lapiz": ["pencil"],
  "lápiz": ["pencil"],
  "boligrafo": ["pen"],
  "bolígrafo": ["pen"],
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
  "termómetro": ["thermometer"],
  "tensiometro": ["blood pressure monitor"],
  "tensiómetro": ["blood pressure monitor"],
  "oximetro": ["pulse oximeter"],
  "oxímetro": ["pulse oximeter"],
  "vendas": ["bandage"],
  "curitas": ["band-aid", "bandage"],
  "alcohol": ["alcohol", "rubbing alcohol"],
  "mascarilla": ["face mask", "mask"],
  "tapabocas": ["face mask", "mask"],
  // ── GARDEN & OUTDOORS ──
  "jardin": ["garden"],
  "jardín": ["garden"],
  "manguera": ["hose", "garden hose"],
  "maceta": ["pot", "planter", "flower pot"],
  "semillas": ["seeds"],
  "parrilla": ["grill", "BBQ"],
  "hamaca": ["hammock"],
  "tienda de campaña": ["tent", "camping tent"],
  "carpa": ["tent"],
  "linterna": ["flashlight", "lantern"],
  "silla plegable": ["folding chair", "camping chair"],
};

/**
 * Expands a search query with English synonyms.
 * Returns an array of search patterns for SQL OR conditions.
 * Capped at 8 patterns to keep queries fast.
 */
function expandSearchQuery(query: string): string[] {
  const qLower = query.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents for matching
  const qOriginal = query.toLowerCase().trim();
  const patterns = [qOriginal];
  
  // Check for exact synonym matches (longest match first)
  const sortedKeys = Object.keys(SEARCH_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    // Also normalize the key for accent-insensitive matching
    const keyNorm = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (qLower.includes(keyNorm) || qOriginal.includes(key)) {
      for (const synonym of SEARCH_SYNONYMS[key]) {
        if (patterns.length >= 8) break; // keep queries fast
        // Replace the Spanish term with the English synonym
        const expanded = qLower.replace(keyNorm, synonym);
        if (!patterns.includes(expanded)) patterns.push(expanded);
        // Also add just the synonym in case the query is exactly the key
        if (!patterns.includes(synonym) && patterns.length < 8) patterns.push(synonym);
      }
      break; // use first (longest) match only to avoid ambiguity
    }
  }
  
  return patterns;
}

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
      const { sql: sqlTag } = await import("drizzle-orm");
      
      // Expand query with Spanish-English synonyms
      const searchTerms = expandSearchQuery(q);
      
      // Build ILIKE patterns for all search term variants
      const likePatterns = searchTerms.map(t => '%' + t + '%');
      
      // Relevance-ranked search with synonym expansion
      const qLower = q.toLowerCase();
      const rows = await db.execute(sqlTag`
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
          CASE WHEN LOWER(name) LIKE ${qLower + '%'} THEN 100 ELSE 0 END
          + CASE WHEN LOWER(name) LIKE ${'% ' + qLower + ' %'} THEN 40 ELSE 0 END
          ${searchTerms.length > 1 ? sqlTag`+ CASE WHEN LOWER(name) LIKE ${searchTerms[1] + '%'} THEN 90 ELSE 0 END` : sqlTag``}
          ${searchTerms.length > 1 ? sqlTag`+ CASE WHEN LOWER(name) ILIKE ${'%' + searchTerms[1] + '%'} THEN 15 ELSE 0 END` : sqlTag``}
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
    } catch (e: any) {
      console.error('Autocomplete error:', e.message);
      res.json([]);
    }
  });

  // ===== PRODUCTS =====
  app.get("/api/products", async (req, res) => {
    const { category, search, minPrice, maxPrice, minRating, sort, page, limit } = req.query;
    const searchStr = (search as string || "").trim();
    // Expand search with Spanish-English synonyms
    const searchVariants = searchStr ? expandSearchQuery(searchStr) : undefined;
    const result = await storage.getProducts({
      category: category as string,
      search: searchStr || undefined,
      searchVariants,
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

  // ===== VARIANT PRICE LOOKUP =====
  const variantCache = new Map<string, { data: any; timestamp: number }>();
  
  app.get("/api/variant/:asin", async (req, res) => {
    const asin = req.params.asin;
    if (!asin) return res.json({});
    
    // Check cache
    const cached = variantCache.get(asin);
    if (cached && Date.now() - cached.timestamp < 12 * 60 * 60 * 1000) {
      return res.json(cached.data);
    }
    
    try {
      // First check if variant is already in our DB
      const existing = await storage.getProducts({ search: asin, limit: 1 });
      if (existing.products.length > 0) {
        const p = existing.products[0];
        const result = { price: p.totalPriceUsd, name: p.name, image: p.image, slug: p.slug };
        variantCache.set(asin, { data: result, timestamp: Date.now() });
        return res.json(result);
      }
      
      // Fetch from Canopy API
      const detail = await getFullProductDetail(asin);
      if (detail && detail.price?.value > 0) {
        const amazonPrice = detail.price.value;
        const weight = parseFloat(String(detail.weight || '0.5')) || 0.5;
        const copikonPrice = calculateCopikonPrice(amazonPrice, weight);
        const result = {
          price: copikonPrice,
          name: detail.title || "",
          image: detail.mainImageUrl || "",
        };
        variantCache.set(asin, { data: result, timestamp: Date.now() });
        if (variantCache.size > 500) {
          const oldest = [...variantCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
          if (oldest) variantCache.delete(oldest[0]);
        }
        return res.json(result);
      }
      
      res.json({});
    } catch (e: any) {
      console.error('Variant lookup error:', e.message);
      res.json({});
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

        // Admin alert: new order received
        sendAdminNewOrderAlert({
          orderNumber: order.orderNumber,
          customerName: user.name,
          totalUsd: order.totalUsd.toFixed(2),
          products: productNames,
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

    // Notify admin that payment proof was uploaded
    const user = await storage.getUser(userId);
    if (user) {
      sendAdminPaymentReceivedAlert({
        orderNumber: order.orderNumber,
        customerName: user.name,
        totalUsd: order.totalUsd.toFixed(2),
      }).catch(() => {});
    }

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
      } else if (status === "shipped_international") {
        sendOrderShipped(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString("es-VE"),
          branch: order.branch,
        }).catch(() => {});
      } else if (status === "ready_for_pickup") {
        sendReadyForPickup(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          branch: order.branch,
          pickupDeadlineDays: 15,
        }).catch(() => {});
      } else if (status === "cancelled") {
        sendOrderCancelled(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          reason: "El pedido fue cancelado por el administrador. Si tienes preguntas, contáctanos.",
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

      // Also send WhatsApp notification if user has phone
      if (user.phone) {
        sendWhatsAppOrderUpdate(user.phone, {
          orderNumber: order.orderNumber,
          status,
          customerName: user.name,
        }).catch(() => {});
      }
    }

    res.json(order);
  });

  // ===== ADMIN: PAYMENT REMINDERS =====

  // Send payment reminder for pending orders (can be called manually or via cron)
  app.post("/api/admin/orders/:id/send-reminder", requireAdmin, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.status !== "pending_payment") {
      return res.status(400).json({ message: "Este pedido no está pendiente de pago" });
    }
    const user = await storage.getUser(order.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const deadline = new Date(order.createdAt);
    deadline.setHours(deadline.getHours() + 48);
    const now = new Date();
    const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));

    await sendPaymentReminder(user.email, {
      customerName: user.name,
      orderNumber: order.orderNumber,
      totalUsd: order.totalUsd.toFixed(2),
      totalBs: order.totalBs.toFixed(2),
      paymentDeadline: deadline.toLocaleDateString("es-VE"),
      hoursRemaining,
    });
    res.json({ sent: true, to: user.email });
  });

  // Auto-send reminders for all overdue pending orders
  app.post("/api/admin/orders/send-reminders", requireAdmin, async (_req, res) => {
    const allOrders = await (storage as PgStorage).getOrders();
    const now = new Date();
    let sent = 0;
    for (const order of allOrders) {
      if (order.status !== "pending_payment") continue;
      const created = new Date(order.createdAt);
      const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      // Send reminder if between 20-48 hours old
      if (hoursSince >= 20 && hoursSince <= 48) {
        const user = await storage.getUser(order.userId);
        if (!user) continue;
        const deadline = new Date(created);
        deadline.setHours(deadline.getHours() + 48);
        const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
        sendPaymentReminder(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          totalUsd: order.totalUsd.toFixed(2),
          totalBs: order.totalBs.toFixed(2),
          paymentDeadline: deadline.toLocaleDateString("es-VE"),
          hoursRemaining,
        }).catch(() => {});
        sent++;
      }
    }
    res.json({ sent, message: `${sent} recordatorios enviados` });
  });

  // Auto-cancel orders that haven't paid within 48h
  app.post("/api/admin/orders/auto-cancel", requireAdmin, async (_req, res) => {
    const allOrders = await (storage as PgStorage).getOrders();
    const now = new Date();
    let cancelled = 0;
    for (const order of allOrders) {
      if (order.status !== "pending_payment") continue;
      const created = new Date(order.createdAt);
      const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 48) {
        await storage.updateOrderStatus(order.id, "cancelled");
        const user = await storage.getUser(order.userId);
        if (user) {
          sendOrderCancelled(user.email, {
            customerName: user.name,
            orderNumber: order.orderNumber,
            reason: "No se recibió comprobante de pago dentro de las 48 horas establecidas.",
          }).catch(() => {});
        }
        cancelled++;
      }
    }
    res.json({ cancelled, message: `${cancelled} pedidos cancelados por falta de pago` });
  });

  // ===== ADMIN: AMAZON PURCHASE AUTOMATION =====

  // Generate Amazon cart URL for an order (admin clicks after payment verified)
  app.post("/api/admin/orders/:id/generate-cart", requireAdmin, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    // Build Amazon "Add to Cart" URL
    // Amazon supports adding multiple items via URL: amazon.com/gp/aws/cart/add.html?ASIN.1=X&Quantity.1=Y
    const cartParams = order.items.map((item, idx) => {
      const n = idx + 1;
      return `ASIN.${n}=${item.amazonAsin}&Quantity.${n}=${item.quantity}`;
    }).join("&");
    const amazonCartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartParams}`;

    // Also generate individual product links for manual fallback
    const productLinks = order.items.map(item => ({
      name: item.name,
      asin: item.amazonAsin,
      quantity: item.quantity,
      priceUsd: item.priceUsd,
      amazonUrl: `https://www.amazon.com/dp/${item.amazonAsin}`,
    }));

    // Calculate estimated Amazon cost (base prices without our markup)
    let estimatedAmazonCost = 0;
    if (storage instanceof PgStorage) {
      const db = (storage as PgStorage).db;
      const { productsTable } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      for (const item of order.items) {
        const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
        if (product) {
          estimatedAmazonCost += (product.basePrice || 0) * item.quantity;
        }
      }
    }

    const estimatedProfit = order.totalUsd - estimatedAmazonCost - order.shippingUsd;

    // Update order with cart URL and status
    const updated = await storage.updateOrder(req.params.id, {
      amazonCartUrl,
      amazonPurchaseStatus: "cart_ready",
      amazonCostUsd: +estimatedAmazonCost.toFixed(2),
      profitUsd: +estimatedProfit.toFixed(2),
    });

    res.json({
      amazonCartUrl,
      productLinks,
      estimatedAmazonCost: +estimatedAmazonCost.toFixed(2),
      estimatedProfit: +estimatedProfit.toFixed(2),
      totalChargedToCustomer: order.totalUsd,
      order: updated,
    });
  });

  // Confirm Amazon purchase completed (admin enters Amazon order IDs)
  app.post("/api/admin/orders/:id/confirm-purchase", requireAdmin, async (req, res) => {
    const { amazonOrderIds, actualCost, notes } = req.body;
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    const cost = parseFloat(actualCost) || order.amazonCostUsd || 0;
    const profit = order.totalUsd - cost - order.shippingUsd;

    // Update order
    const updated = await storage.updateOrder(req.params.id, {
      amazonOrderIds: amazonOrderIds || [],
      amazonPurchaseStatus: "purchased",
      amazonPurchaseNotes: notes || "",
      amazonCostUsd: +cost.toFixed(2),
      profitUsd: +profit.toFixed(2),
    });

    // Auto-advance status to buying_amazon
    if (order.status === "payment_verified") {
      await storage.updateOrderStatus(req.params.id, "buying_amazon");
      // Send status update email
      const user = await storage.getUser(order.userId);
      if (user) {
        sendStatusUpdate(user.email, {
          customerName: user.name,
          orderNumber: order.orderNumber,
          status: "buying_amazon",
          statusLabel: CLIENT_STATUS_LABELS[ORDER_STATUS_MAP["buying_amazon"]],
          branch: order.branch,
        }).catch(() => {});
      }
    }

    res.json(updated);
  });

  // Mark purchase issue (item unavailable, price changed drastically, etc)
  app.post("/api/admin/orders/:id/purchase-issue", requireAdmin, async (req, res) => {
    const { issue, affectedItems } = req.body;
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    const updated = await storage.updateOrder(req.params.id, {
      amazonPurchaseStatus: "issue",
      amazonPurchaseNotes: `PROBLEMA: ${issue}${affectedItems ? ` | Items: ${affectedItems.join(", ")}` : ""}`,
    });

    res.json(updated);
  });

  // Verify current Amazon prices for an order before purchasing
  app.post("/api/admin/orders/:id/verify-prices", requireAdmin, async (req, res) => {
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
        const originalBase = item.priceUsd / 1.15 - (item.weight * 5.50 / 1.15); // Reverse-calc base price
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
          status: !available ? "NO DISPONIBLE" : priceChange > 0.15 ? "PRECIO CAMBIÓ" : "OK",
        });
      } catch (e: any) {
        hasIssues = true;
        verification.push({
          name: item.name,
          asin: item.amazonAsin,
          quantity: item.quantity,
          status: "ERROR",
          error: e.message,
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
      recommendation: hasIssues ? "REVISAR MANUALMENTE" : "LISTO PARA COMPRAR",
    });
  });

  // Get purchase summary dashboard data
  app.get("/api/admin/purchases/summary", requireAdmin, async (req, res) => {
    const allOrders = await storage.getAllOrders();
    const purchased = allOrders.filter(o => o.amazonPurchaseStatus === "purchased");
    const pending = allOrders.filter(o => o.status === "payment_verified" && o.amazonPurchaseStatus !== "purchased");
    const issues = allOrders.filter(o => o.amazonPurchaseStatus === "issue");
    const cartReady = allOrders.filter(o => o.amazonPurchaseStatus === "cart_ready");

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
      marginPct: totalRevenue > 0 ? +((totalProfit / totalRevenue) * 100).toFixed(1) : 0,
      pendingOrders: pending.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalUsd: o.totalUsd,
        items: o.items.length,
        createdAt: o.createdAt,
      })),
    });
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

  // ===== CRON: PRODUCT CATALOG GROWTH =====
  // Automatically imports new products from popular search categories
  const GROWTH_CATEGORIES: { query: string; category: string; weight: number }[] = [
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
    { query: "stroller", category: "baby", weight: 10 },
    // Pets
    { query: "dog food best seller", category: "pets", weight: 5 },
    { query: "cat food", category: "pets", weight: 3 },
    { query: "dog toys", category: "pets", weight: 0.5 },
    // Sports
    { query: "yoga mat", category: "sports", weight: 2 },
    { query: "dumbbells", category: "sports", weight: 5 },
    { query: "resistance bands", category: "sports", weight: 0.3 },
    // Food & Snacks
    { query: "snacks variety pack", category: "food", weight: 2 },
    { query: "coffee pods", category: "food", weight: 1 },
    { query: "protein bars", category: "food", weight: 1 },
    // Office
    { query: "desk organizer", category: "office", weight: 1 },
    { query: "office chair", category: "office", weight: 15 },
    // Toys
    { query: "LEGO sets", category: "toys", weight: 1 },
    { query: "action figures", category: "toys", weight: 0.5 },
    { query: "board games", category: "toys", weight: 2 },
    // Automotive
    { query: "car accessories", category: "auto", weight: 1 },
    { query: "dash cam", category: "auto", weight: 0.5 },
  ];

  app.post("/api/admin/sync/grow-catalog", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const pgStorage = storage as PgStorage;
    const db = pgStorage.db;
    const { syncLogsTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    // Pick 5 random categories to search today
    const shuffled = [...GROWTH_CATEGORIES].sort(() => Math.random() - 0.5);
    const todaySearches = shuffled.slice(0, 5);

    // Create sync log
    const [log] = await db.insert(syncLogsTable).values({
      type: "catalog_growth",
      startedAt: new Date().toISOString(),
      status: "running",
      details: { searches: todaySearches.map(s => s.query) },
    }).returning();

    // Respond immediately
    res.json({ message: "Crecimiento de catálogo iniciado", logId: log.id, searches: todaySearches.map(s => s.query) });

    // Process in background
    (async () => {
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      const details: any[] = [];
      const startTime = Date.now();

      for (const search of todaySearches) {
        try {
          const searchResult = await canopySearch(search.query);
          const results = searchResult.results || [];
          
          for (const item of results.slice(0, 10)) {
            try {
              const asin = item.asin;
              if (!asin) continue;
              
              // Check if already in DB by ASIN directly
              const existing = await pgStorage.getProducts({ search: asin, limit: 1 });
              const found = (existing.products || []).find((p: any) => 
                p.amazonAsin === asin || (p.specs as any)?.ASIN === asin
              );
              
              if (found) {
                skipped++;
                continue;
              }
              
              const full = await getProductByAsin(asin);
              if (!full || !full.title) { skipped++; continue; }
              
              const productData = canopyToProduct(full, search.category, search.weight);
              productData.name = translateTitle(productData.name);
              productData.description = translateTitle(productData.description || productData.name);
              
              const { id: _id, ...data } = productData;
              await pgStorage.createProduct(data);
              imported++;
              details.push({ name: productData.name.slice(0, 60), category: search.category });
              
              await new Promise(r => setTimeout(r, 500));
            } catch (itemErr: any) {
              errors++;
            }
          }
          
          // Update progress after each search
          await db.update(syncLogsTable).set({
            totalProducts: imported + skipped,
            updated: imported,
            errors,
            details: { searches: todaySearches.map(s => s.query), imported: details.slice(-20), progress: `${todaySearches.indexOf(search) + 1}/${todaySearches.length}` },
          }).where(eq(syncLogsTable.id, log.id));

          await new Promise(r => setTimeout(r, 1000));
        } catch (searchErr: any) {
          errors++;
          details.push({ error: searchErr.message, query: search.query });
        }
      }

      await db.update(syncLogsTable).set({
        completedAt: new Date().toISOString(),
        totalProducts: imported + skipped,
        updated: imported,
        errors,
        status: "completed",
        details: { 
          searches: todaySearches.map(s => s.query), 
          imported: details, 
          skipped,
          runtime: `${Math.round((Date.now() - startTime) / 1000)}s` 
        },
      }).where(eq(syncLogsTable.id, log.id));

      console.log(`[CATALOG GROWTH] Completed: ${imported} new, ${skipped} existing, ${errors} errors in ${Math.round((Date.now() - startTime) / 1000)}s`);
    })();
  });

  // ===== CRON: PRICE & AVAILABILITY SYNC =====
  app.post("/api/admin/sync/prices", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { syncLogsTable, productsTable } = await import("@shared/schema");
    const { eq, sql: sqlTag } = await import("drizzle-orm");
    
    // Mark any stuck "running" syncs as failed before starting a new one
    const stuckLogs = await db.select().from(syncLogsTable).where(eq(syncLogsTable.status, "running"));
    for (const stuck of stuckLogs) {
      const startedAt = new Date(stuck.startedAt).getTime();
      if (Date.now() - startedAt > 30 * 60 * 1000) { // >30 min = stuck
        await db.update(syncLogsTable).set({
          completedAt: new Date().toISOString(),
          status: "failed",
          details: { error: "Marcado como fallido: timeout de 30 minutos" },
        }).where(eq(syncLogsTable.id, stuck.id));
        console.log(`[SYNC] Marked stuck log #${stuck.id} as failed`);
      }
    }

    // Create sync log
    const [log] = await db.insert(syncLogsTable).values({
      type: "price_sync",
      startedAt: new Date().toISOString(),
      status: "running",
    }).returning();

    res.json({ message: "Sincronización iniciada", logId: log.id });

    // Run sync in background with safety limits
    (async () => {
      let updated = 0, deactivated = 0, reactivated = 0, priceAlerts = 0, errors = 0;
      let processed = 0;
      const alerts: any[] = [];
      const MAX_RUNTIME_MS = 25 * 60 * 1000; // 25 minute hard limit
      const MAX_CONSECUTIVE_ERRORS = 20; // Stop if API is consistently failing
      const startTime = Date.now();
      let consecutiveErrors = 0;

      try {
        // Only sync active products with ASINs, random sample of 500 per run
        // This ensures every product gets synced within ~20 runs (10 days at 2x/day)
        const allProducts = await db.select().from(productsTable)
          .where(eq(productsTable.isActive, true))
          .orderBy(sqlTag`RANDOM()`)
          .limit(500);

        const batchSize = 3; // Smaller batches for reliability
        
        for (let i = 0; i < allProducts.length; i += batchSize) {
          // Check time limit
          if (Date.now() - startTime > MAX_RUNTIME_MS) {
            console.log(`[SYNC] Time limit reached after ${processed} products`);
            break;
          }
          // Check consecutive error limit
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.log(`[SYNC] Too many consecutive errors (${consecutiveErrors}), stopping`);
            break;
          }

          const batch = allProducts.slice(i, i + batchSize);
          await Promise.all(batch.map(async (product) => {
            try {
              const asin = (product.specs as any)?.ASIN || product.amazonAsin;
              if (!asin) return;

              const detail = await getProductByAsin(asin);
              consecutiveErrors = 0; // Reset on success
              processed++;

              if (!detail || !detail.price?.value) {
                if (product.isActive) {
                  await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                  deactivated++;
                }
                return;
              }

              if (!product.isActive) {
                reactivated++;
              }

              const newBasePrice = detail.price.value;
              const weight = product.weight || 1;
              const newTotalPriceUsd = +(newBasePrice * 1.15 + weight * 5.50).toFixed(2);
              const oldTotalPrice = product.totalPriceUsd;
              
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

              if (detail.mainImageUrl && detail.mainImageUrl !== product.image) {
                updates.image = detail.mainImageUrl;
              }

              const reviews = detail.ratingsTotal || 0;
              const rating = detail.rating || 0;
              updates.badge = reviews >= 50000 ? "Más vendido" : reviews >= 10000 ? "Popular" : (reviews >= 5000 && rating >= 4.5) ? "Popular" : "";

              if (oldTotalPrice !== newTotalPriceUsd) {
                updates.oldPrice = oldTotalPrice;
                updated++;
              }

              await db.update(productsTable).set(updates).where(eq(productsTable.id, product.id));
            } catch (e: any) {
              errors++;
              consecutiveErrors++;
            }
          }));

          // Update progress every 50 products
          if (processed % 50 === 0) {
            await db.update(syncLogsTable).set({
              totalProducts: processed,
              updated,
              deactivated,
              errors,
              priceAlerts,
              details: { alerts: alerts.slice(-10), progress: `${processed}/${allProducts.length}` },
            }).where(eq(syncLogsTable.id, log.id));
          }

          // Rate limit: wait between batches (longer for reliability)
          await new Promise(r => setTimeout(r, 500));
        }

        await db.update(syncLogsTable).set({
          completedAt: new Date().toISOString(),
          totalProducts: processed,
          updated,
          deactivated,
          reactivated,
          priceAlerts,
          errors,
          status: "completed",
          details: { alerts, runtime: `${Math.round((Date.now() - startTime) / 1000)}s` },
        }).where(eq(syncLogsTable.id, log.id));

        console.log(`[SYNC] Completed: ${processed} checked, ${updated} updated, ${deactivated} deactivated, ${reactivated} reactivated, ${priceAlerts} alerts, ${errors} errors in ${Math.round((Date.now() - startTime) / 1000)}s`);
      } catch (e: any) {
        await db.update(syncLogsTable).set({
          completedAt: new Date().toISOString(),
          totalProducts: processed,
          updated,
          errors,
          status: "failed",
          details: { error: e.message, alerts, runtime: `${Math.round((Date.now() - startTime) / 1000)}s` },
        }).where(eq(syncLogsTable.id, log.id));
        console.error(`[SYNC] Failed after ${processed} products:`, e.message);
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
