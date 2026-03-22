import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertOrderSchema, insertReviewSchema, PAYMENT_METHOD_LABELS, CLIENT_STATUS_LABELS, ORDER_STATUS_MAP, type OrderStatus } from "@shared/schema";
import bcrypt from "bcryptjs";
import { searchProducts as canopySearch, getProductByAsin, canopyToProduct, getFullProductDetail, getProductWeight, getBestWeight, parseWeightToLbs, isUnsendable, estimateWeightByName, checkShippingViability, extractWeightFromName, checkProductShippability } from "./canopy";
import { sendWelcomeEmail, sendOrderConfirmation, sendPaymentConfirmed, sendStatusUpdate, sendOrderShipped, sendReadyForPickup, sendOrderCancelled, sendPaymentReminder, sendAdminNewOrderAlert, sendAdminPaymentReceivedAlert } from "./email";
import { sendWhatsAppOrderUpdate } from "./whatsapp";
import { PgStorage } from "./pg-storage";
import { translateDescription, translateBullets, getDbTranslation, saveDbTranslation } from "./translate";

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
  "perfume hombre": ["men cologne", "men fragrance", "cologne for men"],
  "perfume mujer": ["women perfume", "women fragrance", "perfume for women"],
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
  "ropa de bebe": ["baby clothes", "baby clothing", "infant clothes"],
  "ropa bebe": ["baby clothes", "baby clothing", "infant clothes"],
  "ropa de niño": ["boys clothes", "kids clothing"],
  "ropa de niña": ["girls clothes", "girls clothing"],
  "ropa niño": ["boys clothes", "kids clothing"],
  "ropa niña": ["girls clothes", "girls clothing"],
  "ropa": ["clothes", "clothing"],
  "juguete": ["toy"],
  "juguetes": ["toys"],
  "juguetes niños": ["kids toys", "children toys"],
  "juguetes niñas": ["girls toys"],
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
  // ── GENERAL MODIFIERS ──
  "hombre": ["men", "mens"],
  "mujer": ["women", "womens"],
  "niño": ["kids", "boys", "children"],
  "niña": ["girls"],
  "bebe": ["baby", "infant"],
  "bebé": ["baby", "infant"],
  "grande": ["large", "big"],
  "pequeño": ["small", "mini"],
  "barato": ["cheap", "affordable", "budget"],
  "mejor": ["best", "top rated"],
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

/**
 * Translates a Spanish search query to English for the live Amazon/Canopy API.
 * Returns the best English translation of the query.
 * Unlike expandSearchQuery (which returns multiple patterns for SQL), this returns
 * a single optimized English query string for the Amazon search API.
 */
function translateQueryToEnglish(query: string): string {
  const qLower = query.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const qOriginal = query.toLowerCase().trim();
  
  // Try to translate each word/phrase from Spanish to English
  // Process longest keys first to match multi-word phrases before individual words
  const sortedKeys = Object.keys(SEARCH_SYNONYMS).sort((a, b) => b.length - a.length);
  let translated = qLower;
  const usedKeys = new Set<string>();
  
  for (const key of sortedKeys) {
    const keyNorm = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (translated.includes(keyNorm) && !usedKeys.has(keyNorm)) {
      // Use the first (most common) English synonym
      const englishTerm = SEARCH_SYNONYMS[key][0];
      translated = translated.replace(keyNorm, englishTerm);
      usedKeys.add(keyNorm);
    }
  }
  
  // Clean up extra spaces
  translated = translated.replace(/\s+/g, " ").trim();
  
  // If nothing was translated (query is already in English or unknown), return original
  return translated || qOriginal;
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

  // Use the comprehensive estimator from canopy.ts for all weight estimates
  function estimateWeight(title: string, category?: string): number {
    return estimateWeightByName(title, category || "default");
  }

  function calculateCopikonPrice(amazonPrice: number, weightLbs: number) {
    const effectiveWeight = Math.max(weightLbs, 1);
    return +(amazonPrice * 1.15 + effectiveWeight * 5.50).toFixed(2);
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
      // More product types and descriptors
      [/\bCount\b/gi, "Unidades"],
      [/\bSize\b/g, "Talla"],
      [/\bPiece\b/gi, "Pieza"],
      [/\bPieces\b/gi, "Piezas"],
      [/\bWipes\b/gi, "Toallitas"],
      [/\bScent\b/gi, "Aroma"],
      [/\bScented\b/gi, "Con aroma"],
      [/\bUnscented\b/gi, "Sin aroma"],
      [/\bOrganic\b/gi, "Orgánico"],
      [/\bNatural\b/gi, "Natural"],
      [/\bPremium\b/gi, "Premium"],
      [/\bOriginal\b/gi, "Original"],
      [/\bCompatible\b/gi, "Compatible"],
      [/\bProfessional\b/gi, "Profesional"],
      [/\bHypoallergenic\b/gi, "Hipoalergénico"],
      [/\bLightweight\b/gi, "Liviano"],
      [/\bDurable\b/gi, "Duradero"],
      [/\bWorks\b/gi, "Funciona"],
      [/\bSimple\b/gi, "Simple"],
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

  function smartTruncateTitle(title: string, maxLen = 80): string {
    let result = title;
    // Remove bracketed notes like [Not for iPhone 16 Pro...]
    result = result.replace(/\s*\[[^\]]*\]\s*/g, ' ');
    // Remove trailing parenthetical notes
    result = result.replace(/\s*\([^)]*\)\s*$/, '');
    // Remove trailing pipe-separated descriptions
    result = result.replace(/\s*\|.*$/, '');
    // Remove trailing comma-separated descriptors if still too long
    if (result.length > maxLen) {
      const lastComma = result.lastIndexOf(',', maxLen);
      if (lastComma > maxLen * 0.5) {
        result = result.slice(0, lastComma);
      }
    }
    // Hard truncate at word boundary
    if (result.length > maxLen) {
      result = result.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
    }
    return result.replace(/\s+/g, ' ').trim();
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

      // Translate Spanish query to English for better Amazon results
      // e.g. "ropa bebe" -> "baby clothes", "aspiradora" -> "vacuum"
      const englishQuery = translateQueryToEnglish(query);
      console.log(`[Search] "${query}" -> "${englishQuery}"`);

      // Search via Canopy with the English-translated query
      const { results, pageInfo } = await canopySearch(englishQuery, page);

      // Transform to CopikonUSA products
      const products = results
        .filter((r: any) => !r.sponsored) // Skip sponsored
        .filter((r: any) => r.price?.value > 0) // Must have price
        .map((r: any) => {
          const amazonPrice = r.price?.value || 0;
          const weight = estimateWeight(r.title || "");
          const copikonPrice = calculateCopikonPrice(amazonPrice, weight);
          let title = (r.title || "").trim();
          // Translate title: replace Amazon branding, translate common words to Spanish
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
            badge: (r.ratingsTotal || 0) >= 50000 ? "Más vendido" : (r.ratingsTotal || 0) >= 10000 ? "Popular" : null,
          };
        })
        .filter((p: any) => p.weight <= 150) // Filter <= 150 lbs
        .filter((p: any) => !isUnsendable(p.name)) // Block unsendable products
        .filter((p: any) => checkProductShippability(p.name, p.weight).shippable) // Block unshippable furniture/equipment
        .filter((p: any) => checkShippingViability(p.amazonPrice, p.weight, '').viable) // Block shipping-prohibitive
        .filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.asin === p.asin) === i); // Deduplicate by ASIN

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
      const { asin, name, image, price, amazonPrice, totalPriceUsd: inputTotalPrice, weight: estimatedWeight, rating, reviews, badge } = req.body;
      if (!asin || !name) return res.status(400).json({ message: "Faltan datos" });

      // Block unsendable products from being imported
      const unsendableReason = isUnsendable(name);
      if (unsendableReason) {
        console.log(`[BLOCKED] Import rejected: "${name.slice(0, 60)}" — ${unsendableReason}`);
        return res.status(400).json({ message: "Este producto no se puede enviar por avión. Es demasiado grande o pesado para nuestro servicio de envío." });
      }

      // Check if product already exists by ASIN (direct DB query for accuracy)
      const pgStorage = storage as PgStorage;
      const db = pgStorage.db;
      const { productsTable: pt } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const existingByAsin = await db.select().from(pt).where(eq(pt.amazonAsin, asin)).limit(1);

      if (existingByAsin.length > 0) {
        return res.json({ slug: existingByAsin[0].slug, id: existingByAsin[0].id });
      }

      // Auto-detect category from name (must be before weight calculation for viability check)
      const nameLower = name.toLowerCase();
      let detectedCategory = "tech";

      // Fetch REAL weight from API (critical for accurate pricing)
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

      // Calculate real weight using API data + fallback
      const realWeight = getBestWeight(weightData.itemWeight, weightData.packageWeight, fallbackWeight, name, detectedCategory);
      const isWeightVerified = !!(weightData.itemWeight || weightData.packageWeight);

      // Calculate pricing: cost * 1.15 markup + shipping at $5.50/lb
      const basePrice = amazonPrice || price || 0;
      const totalPriceUsd = +(basePrice * 1.15 + Math.max(realWeight, 1) * 5.50).toFixed(2);

      // Block products where shipping makes them uncompetitive
      const importViability = checkShippingViability(basePrice, realWeight, detectedCategory);
      if (!importViability.viable) {
        console.log(`[BLOCKED] Import rejected shipping-prohibitive: "${name.slice(0, 60)}" — ratio ${importViability.ratio}x`);
        return res.status(400).json({ message: "Este producto tiene un costo de envío demasiado alto en relación a su precio. No es viable para envío aéreo." });
      }

      // Generate unique slug: base slug + ASIN suffix to avoid duplicates
      // Remove 'amazon' from slugs to avoid exposing source
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
          rawPackageWeight: weightData.rawPackage,
        },
        isActive: true,
        isManual: false,
        amazonAsin: asin,
        createdAt: new Date().toISOString(),
      } as any);

      console.log(`Imported ${asin}: weight=${realWeight}lbs (${isWeightVerified ? 'VERIFIED' : 'estimated'}), price=$${totalPriceUsd}`);
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
    
    // Check cache (only serve cached results that have actual data)
    const cached = variantCache.get(asin);
    if (cached && cached.data?.price && Date.now() - cached.timestamp < 12 * 60 * 60 * 1000) {
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
        // Use real weight from API if available
        const itemW = parseWeightToLbs(detail.itemWeight);
        const pkgW = parseWeightToLbs(detail.packageWeight);
        const weight = getBestWeight(itemW, pkgW, estimateWeight(detail.title || ""), detail.title || "", "");
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
      if (!asin) return res.json({ images: [], featureBullets: [], variants: [], descriptionEs: "", featuresEs: [] });

      // Check in-memory cache (L1)
      const cached = detailCache.get(asin);
      if (cached && Date.now() - cached.timestamp < DETAIL_CACHE_TTL) {
        return res.json(cached.data);
      }

      // Check DB for existing translations (L2) while fetching detail in parallel
      const [detail, dbTranslation] = await Promise.all([
        getFullProductDetail(asin),
        getDbTranslation(product.id),
      ]);

      if (!detail) return res.json({ images: [], featureBullets: [], variants: [], descriptionEs: "", featuresEs: [] });

      const rawBullets = detail.featureBullets || [];
      const rawDescription = product.description || "";
      const needsDescTranslation = rawDescription && rawDescription !== product.name && /[a-zA-Z]/.test(rawDescription);

      let translatedBullets: string[];
      let translatedDescription: string;

      // Use DB translations if available (L2), otherwise translate via API/dictionary (L3)
      if (dbTranslation && dbTranslation.descriptionEs && dbTranslation.featuresEs.length > 0) {
        translatedDescription = dbTranslation.descriptionEs;
        translatedBullets = dbTranslation.featuresEs;
      } else {
        [translatedBullets, translatedDescription] = await Promise.all([
          rawBullets.length > 0
            ? translateBullets(rawBullets).catch(() => rawBullets)
            : Promise.resolve(rawBullets),
          needsDescTranslation
            ? translateDescription(rawDescription).catch(() => rawDescription)
            : Promise.resolve(rawDescription),
        ]);

        // Save translations to DB (L2) in background — fire and forget
        if (translatedDescription || translatedBullets.length > 0) {
          saveDbTranslation(product.id, translatedDescription, translatedBullets).catch(() => {});
        }
      }

      const result = {
        images: [detail.mainImageUrl, ...(detail.imageUrls || [])].filter(Boolean),
        featureBullets: rawBullets,
        translatedDescription,
        descriptionEs: translatedDescription,
        featuresEs: translatedBullets,
        variants: (detail.variants || []).map(v => ({
          asin: v.asin,
          text: v.text,
          attributes: v.attributes || [],
        })),
        brand: (detail.brand || "").replace(/^Amazon$/i, "").replace(/Amazon\s+Basics/gi, "Copikon Basics"),
      };

      // Cache (L1)
      detailCache.set(asin, { data: result, timestamp: Date.now() });
      if (detailCache.size > 300) {
        const oldest = [...detailCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) detailCache.delete(oldest[0]);
      }

      res.json(result);
    } catch (e: any) {
      console.error("Amazon detail error:", e.message);
      res.json({ images: [], featureBullets: [], variants: [], descriptionEs: "", featuresEs: [] });
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

  // Weight & Shipping Health endpoint for admin dashboard
  app.get("/api/admin/weight-health", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { sql: sqlTag } = await import("drizzle-orm");
    try {
      // Weight source distribution
      const weightSourceResult = await db.execute(sqlTag`
        SELECT 
          COALESCE(specs->>'weightSource', 'sin_datos') as source,
          COUNT(*) as count
        FROM products WHERE is_active = true
        GROUP BY specs->>'weightSource'
        ORDER BY count DESC
      `);

      // Shipping ratio distribution
      const ratioResult = await db.execute(sqlTag`
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

      // Top 10 worst shipping ratios (active products)
      const worstRatios = await db.execute(sqlTag`
        SELECT id, name, base_price, weight, category,
          ROUND((GREATEST(weight, 1) * 5.50 / NULLIF(base_price, 0))::numeric, 2) as ratio
        FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
        ORDER BY (GREATEST(weight, 1) * 5.50 / NULLIF(base_price, 0)) DESC
        LIMIT 10
      `);

      // Recent sync logs
      const { syncLogsTable } = await import("@shared/schema");
      const { desc } = await import("drizzle-orm");
      const recentLogs = await db.select().from(syncLogsTable).orderBy(desc(syncLogsTable.id)).limit(5);

      // Total active count
      const totalResult = await db.execute(sqlTag`SELECT COUNT(*) as total FROM products WHERE is_active = true`);
      const totalActive = (totalResult.rows || totalResult)[0]?.total || 0;

      res.json({
        totalActive,
        weightSources: (weightSourceResult.rows || weightSourceResult),
        shippingRatios: (ratioResult.rows || ratioResult),
        worstRatios: (worstRatios.rows || worstRatios),
        recentLogs: recentLogs.map(l => ({ id: l.id, type: l.type, status: l.status, startedAt: l.startedAt, completedAt: l.completedAt, details: l.details })),
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
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
    const allOrders = await (storage as PgStorage).getAllOrders({ status: "pending_payment" });
    const now = new Date();
    let sent = 0;
    for (const order of allOrders) {
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
    const allOrders = await (storage as PgStorage).getAllOrders({ status: "pending_payment" });
    const now = new Date();
    let cancelled = 0;
    for (const order of allOrders) {
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
        const originalBase = item.priceUsd / 1.15 - (Math.max(item.weight, 1) * 5.50 / 1.15); // Reverse-calc base price
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

  // Update user role (admin only)
  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!role || !["admin", "employee", "customer"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }
    const updated = await storage.updateUser(req.params.id, { role });
    if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
    const { password, ...safe } = updated;
    res.json(safe);
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
      const { asin, category, weight: manualWeight } = req.body;
      if (!asin || !category) {
        return res.status(400).json({ message: "ASIN y categoría requeridos" });
      }

      const canopyProduct = await getProductByAsin(asin);

      // Block unsendable products
      const unsendableReason = isUnsendable(canopyProduct.title || "");
      if (unsendableReason) {
        console.log(`[ADMIN IMPORT] Blocked: "${(canopyProduct.title || "").slice(0, 60)}" — ${unsendableReason}`);
        return res.status(400).json({ message: `Producto no enviable por avión: ${unsendableReason}. Demasiado grande/pesado.` });
      }

      // Fetch real weight unless admin provided manual weight
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
        } catch { /* use fallback */ }
      }

      const productData = canopyToProduct(canopyProduct, category, finalWeight);
      (productData as any).specs = { ...((productData as any).specs || {}), weightSource };

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
    { query: "tire pressure gauge", category: "auto", weight: 0.3 },
  ];

  app.post("/api/admin/sync/grow-catalog", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const pgStorage = storage as PgStorage;
    const db = pgStorage.db;
    const { syncLogsTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    // Pick 5 random categories to search today
    const shuffled = [...GROWTH_CATEGORIES].sort(() => Math.random() - 0.5);
    const todaySearches = shuffled.slice(0, 8);

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
              
              // Block unsendable products (too large/heavy for air shipping)
              const unsendableReason = isUnsendable(full.title);
              if (unsendableReason) {
                console.log(`[CATALOG GROWTH] Blocked unsendable: "${full.title.slice(0, 60)}" — ${unsendableReason}`);
                skipped++;
                continue;
              }
              
              // Fetch real weight from API
              let realWeight = search.weight;
              let weightSource = "estimated";
              try {
                const weightData = await getProductWeight(asin);
                const best = getBestWeight(weightData.itemWeight, weightData.packageWeight, search.weight, full.title || "", search.category);
                if (weightData.itemWeight || weightData.packageWeight) {
                  realWeight = best;
                  weightSource = "api";
                }
              } catch { /* use fallback weight */ }

              // Auto-correct weight from product name if it differs significantly
              const nameWeight = extractWeightFromName(full.title || "");
              if (nameWeight !== null && Math.abs(nameWeight - realWeight) / Math.max(realWeight, 0.1) > 0.3) {
                console.log(`[CATALOG GROWTH] Weight correction from name: "${full.title?.slice(0, 50)}" — ${realWeight}→${nameWeight} lbs`);
                realWeight = nameWeight;
              }

              // Check product shippability (furniture, heavy equipment, >50 lbs)
              const shippability = checkProductShippability(full.title || "", realWeight);
              if (!shippability.shippable) {
                console.log(`[CATALOG GROWTH] Blocked unshippable: "${full.title?.slice(0, 60)}" — ${shippability.reason}`);
                skipped++;
                continue;
              }

              // Check shipping viability BEFORE importing
              const baseP = full.price?.value || 0;
              const importViability = checkShippingViability(baseP, realWeight, search.category);
              if (!importViability.viable) {
                console.log(`[CATALOG GROWTH] Blocked shipping-prohibitive: "${full.title?.slice(0, 60)}" — ratio ${importViability.ratio}x`);
                skipped++;
                continue;
              }

              const productData = canopyToProduct(full, search.category, realWeight);
              productData.name = smartTruncateTitle(translateTitle(productData.name));
              // Translate description to Spanish using AI (fire-and-forget — save English if it fails)
              try {
                const rawDesc = full.description || full.title || productData.name;
                productData.description = await translateDescription(rawDesc);
              } catch {
                productData.description = translateTitle(productData.description || productData.name);
              }
              // Tag weight source in specs
              (productData as any).specs = { ...((productData as any).specs || {}), weightSource };
              
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

              // ── GUARDRAIL 1: Block unsendable products that slipped through ──
              const unsendableReason = isUnsendable(product.name);
              if (unsendableReason) {
                if (product.isActive) {
                  await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                  deactivated++;
                  alerts.push({
                    type: "unsendable",
                    productId: product.id,
                    name: product.name,
                    reason: `Producto no enviable: ${unsendableReason}`,
                  });
                  console.log(`[SYNC] Deactivated unsendable: #${product.id} "${product.name.slice(0, 50)}" — ${unsendableReason}`);
                }
                processed++;
                return;
              }

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

              // ── GUARDRAIL 2: Check updated title for unsendable keywords ──
              if (detail.title && isUnsendable(detail.title)) {
                if (product.isActive) {
                  await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                  deactivated++;
                  alerts.push({
                    type: "unsendable",
                    productId: product.id,
                    name: detail.title,
                    reason: `Título actualizado es no enviable: ${isUnsendable(detail.title)}`,
                  });
                }
                return;
              }

              if (!product.isActive) {
                reactivated++;
              }

              const newBasePrice = detail.price.value;
              let weight = product.weight || 1;
              const specs = product.specs as any;

              // ── GUARDRAIL 3: ALWAYS try to get real weight from API ──
              // Even if we have a weight, re-verify it periodically
              let weightUpdated = false;
              let weightSource = specs?.weightSource || "estimated";
              try {
                const weightData = await getProductWeight(asin);
                if (weightData.itemWeight || weightData.packageWeight) {
                  const realWeight = getBestWeight(weightData.itemWeight, weightData.packageWeight, weight, product.name, product.category);
                  
                  // ── GUARDRAIL 4: If real weight > 150 lbs, deactivate (can't ship by air) ──
                  const rawApiWeight = weightData.packageWeight || weightData.itemWeight || 0;
                  if (rawApiWeight > 150) {
                    if (product.isActive) {
                      await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                      deactivated++;
                      alerts.push({
                        type: "overweight",
                        productId: product.id,
                        name: product.name,
                        reason: `Peso real ${rawApiWeight} lbs excede límite aéreo de 150 lbs`,
                        rawWeight: rawApiWeight,
                      });
                      console.log(`[SYNC] Deactivated overweight: #${product.id} "${product.name.slice(0, 50)}" — ${rawApiWeight} lbs`);
                    }
                    return;
                  }

                  // ── GUARDRAIL 5: Alert on major weight corrections ──
                  const oldWeight = product.weight || 1;
                  const weightDiff = Math.abs(realWeight - oldWeight);
                  if (weightDiff > 5 || (oldWeight > 0 && realWeight / oldWeight > 3)) {
                    alerts.push({
                      type: "weight_correction",
                      productId: product.id,
                      name: product.name,
                      oldWeight,
                      newWeight: realWeight,
                      change: `${oldWeight} → ${realWeight} lbs`,
                      priceDiff: `$${(Math.abs(realWeight - oldWeight) * 5.50).toFixed(2)} shipping difference`,
                    });
                  }

                  weight = realWeight;
                  weightUpdated = true;
                  weightSource = "api";
                }
              } catch { /* keep current weight */ }

              // ── GUARDRAIL 5.5: Auto-correct weight from product name ──
              const nameExtracted = extractWeightFromName(product.name);
              if (nameExtracted !== null) {
                const diff = Math.abs(nameExtracted - weight) / Math.max(weight, 0.1);
                if (diff > 0.3) {
                  console.log(`[SYNC] Weight correction from name: #${product.id} "${product.name.slice(0, 50)}" — ${weight}→${nameExtracted} lbs`);
                  weight = nameExtracted;
                  weightUpdated = true;
                  weightSource = "name_extracted";
                }
              }

              // ── GUARDRAIL 5.6: Check product shippability ──
              const shipCheck = checkProductShippability(product.name, weight);
              if (!shipCheck.shippable) {
                if (product.isActive) {
                  await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                  deactivated++;
                  alerts.push({
                    type: "unshippable",
                    productId: product.id,
                    name: product.name,
                    weight,
                    reason: shipCheck.reason,
                  });
                  console.log(`[SYNC] Deactivated unshippable: #${product.id} "${product.name.slice(0, 50)}" — ${shipCheck.reason}`);
                }
                return;
              }

              // ── GUARDRAIL 6: Sanity check — weight vs price ratio ──
              // If shipping cost ($5.50/lb) would be more than 3x the product price, something is wrong
              const shippingCost = weight * 5.50;
              if (shippingCost > newBasePrice * 3 && weight > 10) {
                alerts.push({
                  type: "suspicious_weight",
                  productId: product.id,
                  name: product.name,
                  weight,
                  basePrice: newBasePrice,
                  shippingCost,
                  reason: `Envío ($${shippingCost.toFixed(2)}) es ${(shippingCost / newBasePrice).toFixed(1)}x el precio base ($${newBasePrice.toFixed(2)})`,
                });
              }

              // ── GUARDRAIL 7: Shipping viability — deactivate uncompetitive products ──
              const viability = checkShippingViability(newBasePrice, weight, product.category);
              if (!viability.viable) {
                await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
                deactivated++;
                alerts.push({
                  type: "shipping_prohibitive",
                  productId: product.id,
                  name: product.name,
                  weight,
                  basePrice: newBasePrice,
                  shippingCost: viability.shippingCost,
                  ratio: viability.ratio,
                  reason: viability.reason,
                });
                console.log(`[SYNC] Deactivated shipping-prohibitive: #${product.id} "${product.name.slice(0, 50)}" — ratio ${viability.ratio}x`);
                return;
              }

              const newTotalPriceUsd = +(newBasePrice * 1.15 + Math.max(weight, 1) * 5.50).toFixed(2);
              const oldTotalPrice = product.totalPriceUsd;
              
              const priceChange = oldTotalPrice > 0 ? Math.abs(newTotalPriceUsd - oldTotalPrice) / oldTotalPrice : 0;
              if (priceChange > 0.20) {
                priceAlerts++;
                alerts.push({
                  type: "price_change",
                  productId: product.id,
                  name: product.name,
                  oldPrice: oldTotalPrice,
                  newPrice: newTotalPriceUsd,
                  change: `${(priceChange * 100).toFixed(0)}%`,
                  weightChange: weightUpdated ? `${product.weight} → ${weight} lbs` : null,
                });
              }

              const updates: any = {
                basePrice: newBasePrice,
                totalPriceUsd: newTotalPriceUsd,
                isActive: true,
                rating: detail.rating || product.rating,
                reviews: detail.ratingsTotal || product.reviews,
              };

              // Update weight and source
              if (weightUpdated) {
                updates.weight = weight;
                updates.specs = { 
                  ...specs, 
                  weightSource,
                  rawItemWeight: specs?.rawItemWeight,
                  rawPackageWeight: specs?.rawPackageWeight,
                  lastWeightCheck: new Date().toISOString(),
                };
              }

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
              const translated_name = smartTruncateTitle(translateTitle(product.name));
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

  // ===== CRON: TRANSLATE DESCRIPTIONS (AI) =====
  app.post("/api/admin/sync/translate-descriptions", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable, syncLogsTable } = await import("@shared/schema");
    const { eq, sql } = await import("drizzle-orm");

    // Find active products that don't have a Spanish description yet
    const allProducts = await db.select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      descriptionEs: productsTable.descriptionEs,
    })
      .from(productsTable)
      .where(eq(productsTable.isActive, true));

    // Filter to products missing Spanish translation
    const untranslatedProducts = allProducts.filter(p => {
      const desc = p.description || "";
      const descEs = p.descriptionEs || "";
      if (desc.length < 10) return false;
      if (descEs.length > 10) return false; // Already translated
      return /\b(for|with|and|the|this|that|from|your|our|these|is|are|has|have|can|will|not|all|one|two|get|use|set|new|top|best|made|high|quality|design|pack|size|color|inch|compatible|wireless|portable|bluetooth|waterproof|rechargeable|lightweight|durable|premium|professional|adjustable|stainless|steel)\b/i.test(desc);
    });

    const batchSize = +(req.query.batch || 50);
    const productsToProcess = untranslatedProducts.slice(0, batchSize);

    const [log] = await db.insert(syncLogsTable).values({
      type: "description_translation",
      startedAt: new Date().toISOString(),
      totalProducts: productsToProcess.length,
      status: "running",
    }).returning();

    res.json({ message: `Traducción de descripciones iniciada para ${productsToProcess.length} de ${untranslatedProducts.length} productos`, logId: log.id });

    // Background translation — saves to description_es column (not description)
    (async () => {
      let translated = 0, errors = 0;
      for (const product of productsToProcess) {
        try {
          const translatedDesc = await translateDescription(product.description || product.name);
          if (translatedDesc && translatedDesc !== product.description) {
            await db.update(productsTable)
              .set({ descriptionEs: translatedDesc })
              .where(eq(productsTable.id, product.id));
            translated++;
          }
        } catch {
          errors++;
        }
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 300));
      }

      await db.update(syncLogsTable).set({
        completedAt: new Date().toISOString(),
        updated: translated,
        errors,
        status: "completed",
        details: { total: untranslatedProducts.length, processed: productsToProcess.length },
      }).where(eq(syncLogsTable.id, log.id));
      console.log(`[TRANSLATE-DESC] Done: ${translated} translated, ${errors} errors`);
    })();
  });

  // ===== CLEAR BAD CACHED TRANSLATIONS =====
  app.post("/api/admin/sync/clear-translations", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { sql } = await import("drizzle-orm");

    const result = await db.execute(sql`UPDATE products SET description_es = NULL, features_es = NULL`);
    res.json({ message: "Traducciones limpiadas", cleared: result.rowCount || 0 });
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

  // ===== BULK WEIGHT FIX =====
  // Fetches real weights from API for products with estimated/default weights
  // Processes in batches to avoid rate limits. Call repeatedly to fix more products.
  app.post("/api/admin/sync/fix-weights", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable, syncLogsTable } = await import("@shared/schema");
    const { eq, and, sql, inArray } = await import("drizzle-orm");

    const batchSize = +(req.query.batch || 100);

    // Create sync log
    const [log] = await db.insert(syncLogsTable).values({
      type: "weight_fix",
      status: "running",
      startedAt: new Date().toISOString(),
      details: { batchSize },
    }).returning();

    res.json({ message: "Weight fix started", logId: log.id, batchSize });

    // Run in background
    (async () => {
      try {
        // Common default weights that indicate the weight was estimated, not real
        const DEFAULT_WEIGHTS = [0.2, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0, 3.0, 5.0, 6.0, 8.0, 10.0, 15.0, 20.0, 35.0, 40.0];
        
        // Get products with estimated weights that have ASIN
        const candidates = await db.select({
          id: productsTable.id,
          name: productsTable.name,
          weight: productsTable.weight,
          basePrice: productsTable.basePrice,
          category: productsTable.category,
          amazonAsin: productsTable.amazonAsin,
          specs: productsTable.specs,
        }).from(productsTable).where(
          and(
            eq(productsTable.isActive, true),
            sql`${productsTable.amazonAsin} IS NOT NULL AND ${productsTable.amazonAsin} != ''`,
            sql`${productsTable.weight} IN (${sql.join(DEFAULT_WEIGHTS.map(w => sql`${w}`), sql`, `)})`
          )
        ).limit(batchSize);

        console.log(`[WEIGHT FIX] Found ${candidates.length} products with estimated weights`);

        let fixed = 0, skipped = 0, errors = 0, deactivated = 0;
        const alerts: string[] = [];

        for (const product of candidates) {
          try {
            // Check unsendable first
            const unsendableReason = isUnsendable(product.name);
            if (unsendableReason) {
              await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
              deactivated++;
              alerts.push(`Deactivated #${product.id}: ${unsendableReason} - ${product.name.slice(0, 60)}`);
              continue;
            }

            // Fetch real weight from API
            const weightData = await getProductWeight(product.amazonAsin!);
            
            if (!weightData.itemWeight && !weightData.packageWeight) {
              // No API weight available — use better estimate from name
              const betterEstimate = estimateWeightByName(product.name, product.category);
              if (Math.abs(betterEstimate - product.weight) > 0.5) {
                const newPrice = +(product.basePrice * 1.15 + Math.max(betterEstimate, 1) * 5.50).toFixed(2);
                await db.update(productsTable).set({
                  weight: betterEstimate,
                  totalPriceUsd: newPrice,
                  specs: { ...(product.specs as any || {}), weightSource: "name_estimate" },
                }).where(eq(productsTable.id, product.id));
                fixed++;
              } else {
                skipped++;
              }
              // Small delay to be nice to API
              await new Promise(r => setTimeout(r, 200));
              continue;
            }

            // Got real weight — validate and apply
            const realWeight = getBestWeight(
              weightData.itemWeight, weightData.packageWeight,
              estimateWeightByName(product.name, product.category),
              product.name, product.category
            );

            // Check if too heavy for air shipping
            if (realWeight > 150) {
              await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
              deactivated++;
              alerts.push(`Deactivated #${product.id}: ${realWeight}lbs exceeds 150lb limit - ${product.name.slice(0, 60)}`);
              continue;
            }

            // Check for major weight change (likely was very wrong before)
            const weightChange = Math.abs(realWeight - product.weight);
            const weightChangePct = product.weight > 0 ? (weightChange / product.weight * 100) : 999;

            // Calculate correct price
            const newPrice = +(product.basePrice * 1.15 + Math.max(realWeight, 1) * 5.50).toFixed(2);
            const oldPrice = +(product.basePrice * 1.15 + Math.max(product.weight, 1) * 5.50).toFixed(2);

            await db.update(productsTable).set({
              weight: realWeight,
              totalPriceUsd: newPrice,
              specs: {
                ...(product.specs as any || {}),
                weightSource: "api",
                rawItemWeight: weightData.rawItem,
                rawPackageWeight: weightData.rawPackage,
              },
            }).where(eq(productsTable.id, product.id));

            fixed++;

            if (weightChangePct > 100) {
              alerts.push(`#${product.id}: weight ${product.weight}→${realWeight}lbs, price $${oldPrice}→$${newPrice} (${product.name.slice(0, 50)})`);
            }

            // Rate limit: ~3 requests/sec to Canopy
            await new Promise(r => setTimeout(r, 350));
          } catch (e: any) {
            errors++;
            console.error(`[WEIGHT FIX] Error on product ${product.id}:`, e.message);
          }
        }

        // Update log
        await db.update(syncLogsTable).set({
          status: "completed",
          completedAt: new Date().toISOString(),
          details: {
            batchSize,
            processed: candidates.length,
            fixed,
            skipped,
            errors,
            deactivated,
            alerts: alerts.slice(0, 50),
          },
        }).where(eq(syncLogsTable.id, log.id));

        console.log(`[WEIGHT FIX] Done: ${fixed} fixed, ${skipped} skipped, ${deactivated} deactivated, ${errors} errors`);
      } catch (e: any) {
        console.error("[WEIGHT FIX] Fatal error:", e.message);
        await db.update(syncLogsTable).set({
          status: "error",
          completedAt: new Date().toISOString(),
          details: { error: e.message },
        }).where(eq(syncLogsTable.id, log.id));
      }
    })();
  });

  // ===== OPTIMIZE WEIGHTS: Mass weight correction + shipping filter =====
  app.post("/api/admin/sync/optimize-weights", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable, syncLogsTable } = await import("@shared/schema");
    const { eq, sql: sqlTag, count } = await import("drizzle-orm");

    const batchSize = +(req.query.batch || 200);
    const mode = (req.query.mode as string) || "full"; // "full" | "filter-only" | "weights-only"

    const [log] = await db.insert(syncLogsTable).values({
      type: "weight_optimization",
      status: "running",
      startedAt: new Date().toISOString(),
      details: { batchSize, mode },
    }).returning();

    res.json({ message: "Weight optimization started", logId: log.id, batchSize, mode });

    (async () => {
      try {
        let weightFixed = 0, shippingFiltered = 0, errors = 0, skipped = 0;
        const alerts: string[] = [];
        const startTime = Date.now();

        // PHASE 1: Apply shipping viability filter to ALL active products
        if (mode !== "weights-only") {
          console.log(`[OPTIMIZE] Phase 1: Shipping viability filter...`);
          const allActive = await db.execute(sqlTag`
            SELECT id, name, base_price, weight, category FROM products
            WHERE is_active = true AND base_price > 0 AND weight > 0
          `);
          for (const row of (allActive.rows || allActive) as any[]) {
            const viability = checkShippingViability(Number(row.base_price), Number(row.weight), row.category || '');
            if (!viability.viable) {
              await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, row.id));
              shippingFiltered++;
              if (shippingFiltered <= 50) {
                alerts.push(`[SHIPPING] #${row.id}: $${Number(row.base_price).toFixed(2)} base, ${row.weight}lbs, ratio ${viability.ratio}x - ${(row.name || "").slice(0, 50)}`);
              }
            }
          }
          console.log(`[OPTIMIZE] Phase 1 done: ${shippingFiltered} products deactivated for prohibitive shipping`);
        }

        // PHASE 2: Fix estimated weights with API data
        if (mode !== "filter-only") {
          console.log(`[OPTIMIZE] Phase 2: Fetching real weights from API...`);
          const DEFAULT_WEIGHTS = [0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 50.0];

          // Get products with estimated weights (round numbers) that don't have API weight
          const candidates = await db.execute(sqlTag`
            SELECT id, name, weight, base_price, category, amazon_asin, specs
            FROM products
            WHERE is_active = true
              AND amazon_asin IS NOT NULL AND amazon_asin != ''
              AND (specs->>'weightSource' IS NULL OR specs->>'weightSource' != 'api')
            ORDER BY RANDOM()
            LIMIT ${batchSize}
          `);

          const rows = (candidates.rows || candidates) as any[];
          console.log(`[OPTIMIZE] Phase 2: Processing ${rows.length} products...`);

          for (const product of rows) {
            if (Date.now() - startTime > 20 * 60 * 1000) {
              console.log(`[OPTIMIZE] Time limit reached`);
              break;
            }
            try {
              const weightData = await getProductWeight(product.amazon_asin);
              
              if (!weightData.itemWeight && !weightData.packageWeight) {
                // No API data — use smart estimate
                const estimate = estimateWeightByName(product.name, product.category);
                const currentWeight = Number(product.weight);
                if (Math.abs(estimate - currentWeight) > 0.5) {
                  const newPrice = +(Number(product.base_price) * 1.15 + estimate * 5.50).toFixed(2);
                  // Re-check viability with new weight
                  const v = checkShippingViability(Number(product.base_price), estimate, product.category || '');
                  await db.update(productsTable).set({
                    weight: estimate,
                    totalPriceUsd: newPrice,
                    isActive: v.viable,
                    specs: { ...(product.specs || {}), weightSource: "smart_estimate", previousWeight: currentWeight },
                  }).where(eq(productsTable.id, product.id));
                  weightFixed++;
                  if (!v.viable) shippingFiltered++;
                } else {
                  skipped++;
                }
                await new Promise(r => setTimeout(r, 200));
                continue;
              }

              // Got API weight — use it
              const realWeight = getBestWeight(
                weightData.itemWeight, weightData.packageWeight,
                estimateWeightByName(product.name, product.category),
                product.name, product.category
              );

              const oldWeight = Number(product.weight);
              const newPrice = +(Number(product.base_price) * 1.15 + realWeight * 5.50).toFixed(2);
              
              // Check viability with real weight
              const v = checkShippingViability(Number(product.base_price), realWeight, product.category || '');

              await db.update(productsTable).set({
                weight: realWeight,
                totalPriceUsd: newPrice,
                isActive: v.viable,
                specs: {
                  ...(product.specs || {}),
                  weightSource: "api",
                  rawItemWeight: weightData.rawItem,
                  rawPackageWeight: weightData.rawPackage,
                  previousWeight: oldWeight,
                },
              }).where(eq(productsTable.id, product.id));

              weightFixed++;
              if (!v.viable) {
                shippingFiltered++;
                alerts.push(`[WEIGHT+SHIP] #${product.id}: ${oldWeight}→${realWeight}lbs, ratio ${v.ratio}x → deactivated - ${(product.name || "").slice(0, 50)}`);
              } else if (Math.abs(realWeight - oldWeight) > 2) {
                alerts.push(`[WEIGHT] #${product.id}: ${oldWeight}→${realWeight}lbs, price $${Number(product.base_price).toFixed(0)}→$${newPrice} - ${(product.name || "").slice(0, 50)}`);
              }

              await new Promise(r => setTimeout(r, 350));
            } catch (e: any) {
              errors++;
            }
          }
          console.log(`[OPTIMIZE] Phase 2 done: ${weightFixed} weights fixed`);
        }

        // Final count
        const countResult = await db.select({ count: count() }).from(productsTable).where(eq(productsTable.isActive, true));
        const totalActive = countResult[0]?.count || 0;

        await db.update(syncLogsTable).set({
          status: "completed",
          completedAt: new Date().toISOString(),
          details: {
            mode,
            weightFixed,
            shippingFiltered,
            skipped,
            errors,
            totalActive,
            runtime: `${Math.round((Date.now() - startTime) / 1000)}s`,
            alerts: alerts.slice(0, 100),
          },
        }).where(eq(syncLogsTable.id, log.id));

        console.log(`[OPTIMIZE] Completed: ${weightFixed} weights fixed, ${shippingFiltered} shipping-filtered, ${totalActive} active, ${errors} errors in ${Math.round((Date.now() - startTime) / 1000)}s`);
      } catch (e: any) {
        console.error("[OPTIMIZE] Fatal error:", e.message);
        const { syncLogsTable } = await import("@shared/schema");
        await db.update(syncLogsTable).set({
          status: "error",
          completedAt: new Date().toISOString(),
          details: { error: e.message },
        }).where(eq(syncLogsTable.id, log.id));
      }
    })();
  });

  // ===== AUTO WEIGHT FIX: Name-based weight extraction across ALL active products =====
  // Extracts weights from product names, corrects underweighted products, deactivates unshippable ones.
  // No API calls needed — purely name-based detection.
  app.post("/api/admin/sync/fix-weights-auto", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable, syncLogsTable } = await import("@shared/schema");
    const { eq, sql: sqlTag } = await import("drizzle-orm");

    const [log] = await db.insert(syncLogsTable).values({
      type: "auto_weight_fix",
      status: "running",
      startedAt: new Date().toISOString(),
    }).returning();

    res.json({ message: "Auto weight fix started", logId: log.id });

    (async () => {
      try {
        let corrected = 0, deactivated = 0, skipped = 0;
        const details: any[] = [];

        const allActive = await db.execute(sqlTag`
          SELECT id, name, weight, base_price, category, specs
          FROM products
          WHERE is_active = true
        `);

        const rows = (allActive.rows || allActive) as any[];
        console.log(`[AUTO WEIGHT FIX] Processing ${rows.length} active products...`);

        for (const product of rows) {
          const currentWeight = Number(product.weight) || 0;
          const name = product.name || "";

          // Step 1: Extract weight from name
          const nameWeight = extractWeightFromName(name);

          // Step 2: Check shippability with best available weight
          const checkWeight = nameWeight !== null ? nameWeight : currentWeight;
          const shipCheck = checkProductShippability(name, checkWeight);

          if (!shipCheck.shippable) {
            await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
            deactivated++;
            details.push({
              action: "deactivated",
              id: product.id,
              name: name.slice(0, 60),
              weight: checkWeight,
              reason: shipCheck.reason,
            });
            continue;
          }

          // Step 3: Correct weight if name-extracted weight is >2x current weight
          if (nameWeight !== null && nameWeight > currentWeight * 2) {
            const basePrice = Number(product.base_price) || 0;
            const newPrice = +(basePrice * 1.15 + Math.max(nameWeight, 1) * 5.50).toFixed(2);

            // Re-check shipping viability with corrected weight
            const viability = checkShippingViability(basePrice, nameWeight, product.category || '');

            if (!viability.viable) {
              await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, product.id));
              deactivated++;
              details.push({
                action: "deactivated",
                id: product.id,
                name: name.slice(0, 60),
                oldWeight: currentWeight,
                newWeight: nameWeight,
                reason: `Shipping prohibitive after weight correction: ratio ${viability.ratio}x`,
              });
              continue;
            }

            await db.update(productsTable).set({
              weight: nameWeight,
              totalPriceUsd: newPrice,
              specs: {
                ...(product.specs || {}),
                weightSource: "name_auto_fix",
                previousWeight: currentWeight,
                autoFixedAt: new Date().toISOString(),
              },
            }).where(eq(productsTable.id, product.id));

            corrected++;
            details.push({
              action: "corrected",
              id: product.id,
              name: name.slice(0, 60),
              oldWeight: currentWeight,
              newWeight: nameWeight,
              oldPrice: +(basePrice * 1.15 + Math.max(currentWeight, 1) * 5.50).toFixed(2),
              newPrice,
            });
          } else {
            skipped++;
          }
        }

        await db.update(syncLogsTable).set({
          status: "completed",
          completedAt: new Date().toISOString(),
          details: {
            processed: rows.length,
            corrected,
            deactivated,
            skipped,
            changes: details.slice(0, 200),
          },
        }).where(eq(syncLogsTable.id, log.id));

        console.log(`[AUTO WEIGHT FIX] Done: ${corrected} corrected, ${deactivated} deactivated, ${skipped} skipped out of ${rows.length}`);
      } catch (e: any) {
        console.error("[AUTO WEIGHT FIX] Fatal error:", e.message);
        await db.update(syncLogsTable).set({
          status: "error",
          completedAt: new Date().toISOString(),
          details: { error: e.message },
        }).where(eq(syncLogsTable.id, log.id));
      }
    })();
  });

  // ===== CATALOG HEALTH CHECK & CLEANUP =====
  app.post("/api/admin/sync/cleanup", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable, syncLogsTable } = await import("@shared/schema");
    const { eq, and, sql: sqlTag, count } = await import("drizzle-orm");

    // Create sync log
    const [log] = await db.insert(syncLogsTable).values({
      type: "catalog_cleanup",
      status: "running",
      startedAt: new Date().toISOString(),
      details: {},
    }).returning();

    res.json({ message: "Catalog cleanup started", logId: log.id });

    // Run in background
    (async () => {
      try {
        let deactivated = 0, fixed = 0;
        const alerts: string[] = [];

        // 1. Find and remove duplicates (keep highest reviews)
        // IMPORTANT: exclude NULL and empty ASINs — they are NOT duplicates
        const dupeRows = await db.execute(sqlTag`
          SELECT amazon_asin, array_agg(id ORDER BY COALESCE(reviews, 0) DESC) as ids
          FROM products
          WHERE is_active = true AND amazon_asin IS NOT NULL AND amazon_asin != ''
          GROUP BY amazon_asin
          HAVING COUNT(*) > 1
        `);
        for (const row of (dupeRows.rows || dupeRows) as any[]) {
          const ids: number[] = row.ids;
          if (ids.length > 1) {
            // Keep first (highest reviews), deactivate rest
            for (const id of ids.slice(1)) {
              await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, id));
              deactivated++;
            }
            alerts.push(`Dedup ASIN ${row.amazon_asin}: kept #${ids[0]}, removed ${ids.slice(1).join(",")}`);
          }
        }

        // 2. Deactivate products over 100 lbs
        const heavyRows = await db.execute(sqlTag`
          SELECT id, name, weight FROM products
          WHERE is_active = true AND weight > 100
        `);
        for (const row of (heavyRows.rows || heavyRows) as any[]) {
          await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, row.id));
          deactivated++;
          alerts.push(`Too heavy: #${row.id} ${row.weight}lbs - ${(row.name || "").slice(0, 50)}`);
        }

        // 3. Deactivate products with zero or negative price
        const badPriceRows = await db.execute(sqlTag`
          SELECT id, name, total_price_usd FROM products
          WHERE is_active = true AND (total_price_usd IS NULL OR total_price_usd <= 0)
        `);
        for (const row of (badPriceRows.rows || badPriceRows) as any[]) {
          await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, row.id));
          deactivated++;
          alerts.push(`Bad price: #${row.id} $${row.total_price_usd} - ${(row.name || "").slice(0, 50)}`);
        }

        // 4. Deactivate products with weird unicode (spam)
        const allActive = await db.execute(sqlTag`
          SELECT id, name FROM products WHERE is_active = true
        `);
        for (const row of (allActive.rows || allActive) as any[]) {
          const name = row.name || "";
          if ([...name].some((c: string) => c.codePointAt(0)! > 0xFFFF)) {
            await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, row.id));
            deactivated++;
            alerts.push(`Spam name: #${row.id} - ${name.slice(0, 50)}`);
          }
        }

        // 5. Run unsendable check on all active products
        const checkUnsendable = await db.execute(sqlTag`
          SELECT id, name FROM products WHERE is_active = true
        `);
        for (const row of (checkUnsendable.rows || checkUnsendable) as any[]) {
          const reason = isUnsendable(row.name);
          if (reason) {
            await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, row.id));
            deactivated++;
            alerts.push(`Unsendable [${reason}]: #${row.id} - ${(row.name || "").slice(0, 50)}`);
          }
        }

        // 6. Shipping viability check — deactivate products where shipping is prohibitive
        const shippingCheckRows = await db.execute(sqlTag`
          SELECT id, name, base_price, weight, category FROM products
          WHERE is_active = true AND base_price > 0 AND weight > 0
        `);
        for (const row of (shippingCheckRows.rows || shippingCheckRows) as any[]) {
          const viability = checkShippingViability(Number(row.base_price), Number(row.weight), row.category || '');
          if (!viability.viable) {
            await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, row.id));
            deactivated++;
            alerts.push(`Shipping prohibitive [${viability.ratio}x]: #${row.id} - $${Number(row.base_price).toFixed(2)} base, ${row.weight}lbs = $${viability.shippingCost} shipping - ${(row.name || "").slice(0, 50)}`);
          }
        }

        // Get final count
        const countResult = await db.select({ count: count() }).from(productsTable).where(eq(productsTable.isActive, true));
        const totalActive = countResult[0]?.count || 0;

        await db.update(syncLogsTable).set({
          status: "completed",
          completedAt: new Date().toISOString(),
          details: {
            deactivated,
            fixed,
            totalActive,
            alerts: alerts.slice(0, 100),
          },
        }).where(eq(syncLogsTable.id, log.id));

        console.log(`[CLEANUP] Done: ${deactivated} deactivated, ${totalActive} active products remaining`);
      } catch (e: any) {
        console.error("[CLEANUP] Fatal error:", e.message);
        const { syncLogsTable } = await import("@shared/schema");
        await db.update(syncLogsTable).set({
          status: "error",
          completedAt: new Date().toISOString(),
          details: { error: e.message },
        }).where(eq(syncLogsTable.id, log.id));
      }
    })();
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

  // ===== PLATFORM HEALTH CHECK (for automated monitoring) =====
  app.get("/api/admin/health-check", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { sql: sqlTag } = await import("drizzle-orm");
    const issues: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];

    try {
      // 1. Database connectivity
      const dbCheck = await db.execute(sqlTag`SELECT 1 as ok`);
      if (!dbCheck) issues.push("Base de datos no responde");

      // 2. Product catalog health
      const catalogStats = await db.execute(sqlTag`
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
      if (Number(stats.over_weight) > 0) issues.push(`${stats.over_weight} productos activos pesan más de 150 lbs`);
      if (Number(stats.no_image) > 5) warnings.push(`${stats.no_image} productos sin imagen`);
      if (Number(stats.bad_ratio) > 0) warnings.push(`${stats.bad_ratio} productos con ratio envío/precio > 2x (potencialmente no viables)`);

      // 3. Auto-fix: deactivate products over 150 lbs
      if (Number(stats.over_weight) > 0) {
        const fixed = await db.execute(sqlTag`
          UPDATE products SET is_active = false 
          WHERE is_active = true AND weight > 150
          RETURNING id, name, weight
        `);
        const fixedRows = fixed.rows || fixed;
        fixes.push(`Desactivados ${fixedRows.length} productos > 150 lbs: ${fixedRows.map((r: any) => `#${r.id} (${r.weight}lbs)`).join(', ')}`);
      }

      // 4. Auto-fix: deactivate products with bad shipping ratios
      if (Number(stats.bad_ratio) > 0) {
        const badProducts = await db.execute(sqlTag`
          UPDATE products SET is_active = false
          WHERE is_active = true AND base_price > 0 AND weight > 0
            AND (GREATEST(weight, 1) * 5.50 / base_price) > 2.0
            AND category NOT IN ('tech', 'phones', 'gaming')
          RETURNING id, name, ROUND((GREATEST(weight, 1) * 5.50 / base_price)::numeric, 2) as ratio
        `);
        const badRows = badProducts.rows || badProducts;
        if (badRows.length > 0) {
          fixes.push(`Desactivados ${badRows.length} productos con ratio envío excesivo: ${badRows.slice(0, 5).map((r: any) => `#${r.id} (${r.ratio}x)`).join(', ')}${badRows.length > 5 ? '...' : ''}`);
        }
      }

      // 5. Auto-fix: recalculate prices for products where totalPriceUsd doesn't match formula
      const priceCheck = await db.execute(sqlTag`
        SELECT id, name, base_price, weight, total_price_usd,
          ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2) as expected_price
        FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
          AND ABS(total_price_usd - (base_price * 1.15 + GREATEST(weight, 1) * 5.50)) > 1.00
        LIMIT 100
      `);
      const mismatchedPrices = priceCheck.rows || priceCheck;
      if (mismatchedPrices.length > 0) {
        const updated = await db.execute(sqlTag`
          UPDATE products
          SET total_price_usd = ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)
          WHERE is_active = true AND base_price > 0 AND weight > 0
            AND ABS(total_price_usd - (base_price * 1.15 + GREATEST(weight, 1) * 5.50)) > 1.00
        `);
        fixes.push(`Corregidos ${mismatchedPrices.length} precios desincronizados (diferencia > $1 de la fórmula)`);
      }

      // 6. Auto-fix: detect and deactivate duplicate ASINs (keep newest)
      const dupeCheck = await db.execute(sqlTag`
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
          // Parse ids: PostgreSQL returns array_agg as string "{1,2,3}" via raw SQL
          let ids: number[] = [];
          if (Array.isArray(dupe.ids)) {
            ids = dupe.ids.map(Number);
          } else if (typeof dupe.ids === 'string') {
            ids = dupe.ids.replace(/[{}]/g, '').split(',').map(Number).filter(n => !isNaN(n));
          }
          const idsToDeactivate = ids.slice(1); // keep first (newest), deactivate rest
          if (idsToDeactivate.length > 0) {
            for (const id of idsToDeactivate) {
              await db.execute(sqlTag`UPDATE products SET is_active = false WHERE id = ${id}`);
            }
            totalDeduped += idsToDeactivate.length;
          }
        }
        if (totalDeduped > 0) fixes.push(`Desactivados ${totalDeduped} productos duplicados (mismo ASIN, se mantuvo el más reciente)`);
      }

      // 7. Check pending orders health
      const orderCheck = await db.execute(sqlTag`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'pending' AND created_at::timestamptz < NOW() - INTERVAL '48 hours') as stale_pending,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_awaiting,
          COUNT(*) FILTER (WHERE status = 'purchased') as purchased
        FROM orders
      `);
      const orders = (orderCheck.rows || orderCheck)[0];
      if (Number(orders.stale_pending) > 0) warnings.push(`${orders.stale_pending} pedidos pendientes de hace más de 48h`);

      // 8. Check search/API availability (quick Canopy test)
      let searchOk = false;
      try {
        const testResult = await canopySearch("test", 1);
        searchOk = testResult && testResult.results && testResult.results.length > 0;
      } catch { searchOk = false; }
      if (!searchOk) issues.push("API de búsqueda (Canopy) no responde");

      // 9. Check recent sync logs for failures
      const { syncLogsTable } = await import("@shared/schema");
      const { desc } = await import("drizzle-orm");
      const recentLogs = await db.select().from(syncLogsTable).orderBy(desc(syncLogsTable.id)).limit(10);
      const failedLogs = recentLogs.filter(l => l.status === 'error');
      if (failedLogs.length > 0) {
        warnings.push(`${failedLogs.length} sync logs recientes con errores: ${failedLogs.map(l => `${l.type} (${l.startedAt})`).join(', ')}`);
      }

      const healthStatus = issues.length > 0 ? 'critical' : warnings.length > 0 ? 'warning' : 'healthy';

      res.json({
        status: healthStatus,
        timestamp: new Date().toISOString(),
        catalog: {
          active: Number(stats.active),
          inactive: Number(stats.inactive),
        },
        orders: {
          pending: Number(orders.pending),
          stalePending: Number(orders.stale_pending),
          paidAwaiting: Number(orders.paid_awaiting),
          purchased: Number(orders.purchased),
        },
        searchApiOnline: searchOk,
        issues,
        warnings,
        autoFixes: fixes,
        recentSyncLogs: recentLogs.slice(0, 5).map(l => ({ type: l.type, status: l.status, startedAt: l.startedAt })),
      });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // ===== RECALCULATE PRICES (min 1 lb shipping weight) =====
  app.post("/api/admin/sync/recalculate-prices", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Requires PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { sql: sqlTag } = await import("drizzle-orm");

    try {
      // Count how many will change BEFORE updating
      const [countResult] = await db.execute(sqlTag`
        SELECT COUNT(*) as cnt FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
        AND ABS(total_price_usd - ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)) > 0.01
      `);
      const willUpdate = parseInt((countResult as any).cnt || "0");

      // Get examples BEFORE update
      const examples = await db.execute(sqlTag`
        SELECT id, name, weight, total_price_usd as old_price,
          ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2) as new_price
        FROM products
        WHERE is_active = true AND base_price > 0 AND weight > 0
        AND ABS(total_price_usd - ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)) > 0.01
        LIMIT 10
      `);

      // Single bulk UPDATE
      await db.execute(sqlTag`
        UPDATE products
        SET total_price_usd = ROUND((base_price * 1.15 + GREATEST(weight, 1) * 5.50)::numeric, 2)
        WHERE is_active = true AND base_price > 0 AND weight > 0
      `);

      res.json({
        message: `Precios recalculados para ${willUpdate} productos con mínimo 1 lb`,
        updated: willUpdate,
        examples: (examples as any[]).slice(0, 10).map((e: any) => ({
          id: e.id,
          name: (e.name || "").slice(0, 60),
          weight: parseFloat(e.weight),
          oldPrice: parseFloat(e.old_price),
          newPrice: parseFloat(e.new_price),
        })),
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ===== WEIGHT ANOMALY HUNTER (automated audit) =====
  app.get("/api/admin/audit/weights", requireAdmin, async (_req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");

    try {
      const allActive = await db.select().from(productsTable).where(eq(productsTable.isActive, true));

      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

      // Compute category averages for statistical outlier detection
      const categoryWeights: Record<string, number[]> = {};
      for (const p of allActive) {
        if (p.weight > 0.02) {
          if (!categoryWeights[p.category]) categoryWeights[p.category] = [];
          categoryWeights[p.category].push(p.weight);
        }
      }
      const categoryAvg: Record<string, number> = {};
      for (const [cat, weights] of Object.entries(categoryWeights)) {
        categoryAvg[cat] = weights.reduce((a, b) => a + b, 0) / weights.length;
      }

      type Finding = {
        id: number;
        name: string;
        category: string;
        weight: number;
        basePrice: number;
        amazonAsin: string;
        severity: string;
        reasons: string[];
        suggestedWeight: number | null;
      };

      const findings: Finding[] = [];

      for (const p of allActive) {
        const reasons: string[] = [];
        let severity = "low";
        const nameLower = (p.name || "").toLowerCase();

        // CRITICAL: placeholder weights
        if (p.weight === 0.01 || p.weight === 0.02) {
          reasons.push("placeholder_weight");
          severity = "critical";
        }

        // CRITICAL: zero or null weight
        if (p.weight === 0 || p.weight == null) {
          reasons.push("zero_weight");
          severity = "critical";
        }

        // HIGH: category-specific anomalies
        // baby
        if (p.category === "baby") {
          if (/diaper|diapers|pañal|pañales/i.test(nameLower) && p.weight < 2.0) {
            reasons.push("baby_diaper_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/wipes|toallitas/i.test(nameLower) && /\d{2,}.*ct|\d{2,}.*count|\d{3,}/.test(nameLower) && p.weight < 1.0) {
            reasons.push("baby_wipes_bulk_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/formula|fórmula/i.test(nameLower) && p.weight < 0.5) {
            reasons.push("baby_formula_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }

        // food
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

        // tech
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

        // gaming
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

        // beauty
        if (p.category === "beauty") {
          if (/perfume|cologne|fragrance|eau de/i.test(nameLower) && p.weight > 3) {
            reasons.push("beauty_fragrance_too_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }

        // phones
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

        // home
        if (p.category === "home") {
          if (p.weight > 25) {
            reasons.push("home_suspiciously_heavy");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }

        // clothing/shoes
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

        // pets
        if (p.category === "pets") {
          if (/food|treats|litter|comida/i.test(nameLower) && p.weight < 0.1) {
            reasons.push("pets_food_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
        }

        // MEDIUM: multi-pack weight mismatch
        const multipackMatch = nameLower.match(/(\d+)\s*-?\s*(pack|count|ct|sheets|wipes|pods|capsules)/);
        if (multipackMatch && parseInt(multipackMatch[1]) >= 50 && p.weight < 0.5) {
          reasons.push("multipack_weight_mismatch");
          if (severityOrder[severity] > severityOrder["medium"]) severity = "medium";
        }

        // LOW: statistical outliers
        const avg = categoryAvg[p.category];
        if (avg && p.weight > 0.02) {
          if (p.weight > avg * 3) {
            reasons.push("statistical_outlier_heavy");
            // keep severity as-is (low) unless already higher
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
            suggestedWeight: null,
          });
        }
      }

      // Sort by severity (critical first), then by category
      findings.sort((a, b) => {
        const sd = severityOrder[a.severity] - severityOrder[b.severity];
        if (sd !== 0) return sd;
        return a.category.localeCompare(b.category);
      });

      // Build summary counts
      const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      const byCategory: Record<string, number> = {};
      for (const f of findings) {
        bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
        byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      }

      res.json({
        timestamp: new Date().toISOString(),
        totalActive: allActive.length,
        totalSuspicious: findings.length,
        bySeverity,
        byCategory,
        products: findings,
      });
    } catch (e: any) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });

  // ===== AUTO-FIX WEIGHT ANOMALIES =====
  app.post("/api/admin/audit/weights/auto-fix", requireAdmin, async (req, res) => {
    if (!(storage instanceof PgStorage)) return res.status(400).json({ message: "Solo PostgreSQL" });
    const db = (storage as PgStorage).db;
    const { productsTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");

    try {
      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200);

      // Step 1: Run the same audit logic to find suspicious products
      const allActive = await db.select().from(productsTable).where(eq(productsTable.isActive, true));

      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

      type Finding = {
        id: number;
        name: string;
        category: string;
        weight: number;
        basePrice: number;
        amazonAsin: string;
        severity: string;
        reasons: string[];
      };

      const findings: Finding[] = [];

      for (const p of allActive) {
        const reasons: string[] = [];
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
          if (/diaper|diapers|pañal|pañales/i.test(nameLower) && p.weight < 2.0) {
            reasons.push("baby_diaper_too_light");
            if (severityOrder[severity] > severityOrder["high"]) severity = "high";
          }
          if (/wipes|toallitas/i.test(nameLower) && /\d{2,}.*ct|\d{2,}.*count|\d{3,}/.test(nameLower) && p.weight < 1.0) {
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

        // Only include critical + high for auto-fix
        if (reasons.length > 0 && (severity === "critical" || severity === "high")) {
          findings.push({
            id: p.id,
            name: p.name,
            category: p.category,
            weight: p.weight,
            basePrice: p.basePrice,
            amazonAsin: p.amazonAsin || "",
            severity,
            reasons,
          });
        }
      }

      // Sort critical first, then high
      findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      // Apply limit
      const toProcess = findings.slice(0, limit);

      const fixes: Array<{
        id: number;
        name: string;
        category: string;
        oldWeight: number;
        newWeight: number;
        source: string;
        oldPrice: number;
        newPrice: number;
        reasons: string[];
      }> = [];

      const skippedProducts: Array<{
        id: number;
        name: string;
        reason: string;
      }> = [];

      // Step 2: Process each product sequentially
      for (const product of toProcess) {
        const nameLower = (product.name || "").toLowerCase();

        // Skip digital products
        if (/gift\s*card|digital\s*code|\bdigital\b|\[digital/i.test(nameLower)) {
          skippedProducts.push({ id: product.id, name: product.name, reason: "digital_product" });
          continue;
        }

        let newWeight: number | null = null;
        let source = "";

        // Step 2a: Try Canopy API if ASIN available
        if (product.amazonAsin) {
          try {
            const { itemWeight, packageWeight } = await getProductWeight(product.amazonAsin);
            const fallbackEstimate = estimateWeightByName(product.name, product.category);
            const canopyWeight = getBestWeight(itemWeight, packageWeight, fallbackEstimate, product.name, product.category);

            // Use Canopy weight if valid and different from current suspicious weight
            if ((itemWeight && itemWeight > 0) || (packageWeight && packageWeight > 0)) {
              if (canopyWeight !== product.weight) {
                newWeight = canopyWeight;
                source = "canopy_api";
              }
            }
          } catch {
            // Canopy failed, fall through to estimation
          }

          // Rate limit: 500ms between API calls
          await new Promise(r => setTimeout(r, 500));
        }

        // Step 2b: Fall back to name-based estimation if Canopy didn't work
        if (newWeight === null) {
          const estimated = estimateWeightByName(product.name, product.category);
          const isPlaceholder = product.weight === 0.01 || product.weight === 0.02 || product.weight === 0;

          if (isPlaceholder) {
            // Any estimate is better than a placeholder
            newWeight = estimated;
            source = "name_estimate";
          } else if (Math.abs(estimated - product.weight) / product.weight > 0.5) {
            // Estimate differs by >50%
            newWeight = estimated;
            source = "name_estimate";
          }
        }

        if (newWeight === null || newWeight === product.weight) {
          skippedProducts.push({ id: product.id, name: product.name, reason: "no_weight_available" });
          continue;
        }

        // Step 3: Apply correction
        const newPrice = +(product.basePrice * 1.15 + Math.max(newWeight, 1) * 5.50).toFixed(2);

        await db.update(productsTable)
          .set({ weight: newWeight, totalPriceUsd: newPrice })
          .where(eq(productsTable.id, product.id));

        fixes.push({
          id: product.id,
          name: product.name,
          category: product.category,
          oldWeight: product.weight,
          newWeight,
          source,
          oldPrice: +(product.basePrice * 1.15 + Math.max(product.weight, 1) * 5.50).toFixed(2),
          newPrice,
          reasons: product.reasons,
        });
      }

      res.json({
        timestamp: new Date().toISOString(),
        processed: toProcess.length,
        fixed: fixes.length,
        skipped: skippedProducts.length,
        fixes,
        skippedProducts,
      });
    } catch (e: any) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });

  return httpServer;
}
