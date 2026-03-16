import type { Product } from "@shared/schema";

const CANOPY_API_KEY = process.env.CANOPY_API_KEY || "";
const REST_BASE = "https://rest.canopyapi.co";

export interface CanopyProduct {
  asin: string;
  title: string;
  brand: string;
  price: { value: number; currency: string; display: string };
  rating: number;
  ratingsTotal: number;
  mainImageUrl: string;
  imageUrls: string[];
  isPrime: boolean;
}

// Parse weight string like "4.73 pounds" or "1.6 ounces" into lbs
export function parseWeightToLbs(weightStr: string | null | undefined): number | null {
  if (!weightStr) return null;
  const match = weightStr.match(/([\d.]+)\s*(pounds?|lbs?|ounces?|oz|kilograms?|kg|grams?|g)\b/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (isNaN(value) || value <= 0) return null;
  const unit = match[2].toLowerCase();
  if (unit.startsWith('pound') || unit.startsWith('lb')) return +value.toFixed(2);
  if (unit.startsWith('ounce') || unit === 'oz') return +(value / 16).toFixed(2);
  if (unit.startsWith('kilogram') || unit === 'kg') return +(value * 2.20462).toFixed(2);
  if (unit.startsWith('gram') || unit === 'g') return +(value * 0.00220462).toFixed(2);
  return null;
}

// Fetch real weight for a product by ASIN
export async function getProductWeight(asin: string): Promise<{ itemWeight: number | null; packageWeight: number | null; rawItem: string | null; rawPackage: string | null }> {
  if (!CANOPY_API_KEY) return { itemWeight: null, packageWeight: null, rawItem: null, rawPackage: null };
  try {
    const query = `query { amazonProduct(input: { asin: "${asin}" }) { itemWeight packageWeight } }`;
    const res = await fetch(GRAPHQL_BASE, {
      method: "POST",
      headers: { "API-KEY": CANOPY_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { itemWeight: null, packageWeight: null, rawItem: null, rawPackage: null };
    const data = await res.json();
    const product = data?.data?.amazonProduct;
    return {
      itemWeight: parseWeightToLbs(product?.itemWeight),
      packageWeight: parseWeightToLbs(product?.packageWeight),
      rawItem: product?.itemWeight || null,
      rawPackage: product?.packageWeight || null,
    };
  } catch {
    return { itemWeight: null, packageWeight: null, rawItem: null, rawPackage: null };
  }
}

// ===== UNSENDABLE PRODUCT FILTER =====
// Products that are physically impossible to ship by air (>150 lbs, too large, etc.)
// This blocks them from appearing in search results AND from being imported.
const UNSENDABLE_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  // Gym equipment - large steel structures
  { pattern: /\bpower\s*(cage|racks?)\b/i, reason: "Power cage/rack" },
  { pattern: /\bsquat\s*racks?\b/i, reason: "Squat rack" },
  { pattern: /\bsmith\s*machine\b/i, reason: "Smith machine" },
  { pattern: /\bcable\s*crossover\b/i, reason: "Cable crossover" },
  { pattern: /\bfunctional\s*trainer\b/i, reason: "Functional trainer" },
  { pattern: /\bhalf\s*rack\b/i, reason: "Half rack" },
  { pattern: /\bpower\s*tower\b/i, reason: "Power tower" },
  { pattern: /\b(weight|cable)\s*stack\s*(machine|system)\b/i, reason: "Weight stack machine" },
  { pattern: /\bhome\s*gym\b.*\b(weight\s*stack|150\s*lb|pulley|lat\s*pull|cable|multifunction|complete\s*workout|strength\s*training)/i, reason: "Home gym system" },
  { pattern: /\b(multifunctional|multifunction)\b.*\b(home\s*gym|strength\s*training)\b.*\b(workout|equipment|machine|training)/i, reason: "Home gym system" },
  { pattern: /\b(bowflex|harison|mikolo|sincmill|total\s*gym)\b.*\b(home\s*gym|gym\s*(system|machine|station)|workout\s*system)/i, reason: "Home gym system" },
  { pattern: /\bgym\s*(monster|station)\b/i, reason: "Gym station" },
  // Heavy benches
  { pattern: /\bweight\s*bench\b/i, reason: "Weight bench" },
  { pattern: /\bbench\s*press\b(?!.{0,20}\b(pad|grip|shirt|sleeve)\b)/i, reason: "Bench press" },
  // Cardio machines (with exclusions for accessories/mats)
  { pattern: /\btreadmill\b(?!.{0,40}\b(mat|cover|lubricant|belt|oil|key|desk|clip|pad|protection|floor)\b)/i, reason: "Treadmill" },
  { pattern: /\belliptical\s*(machine|trainer)?\b(?!.{0,20}\b(mat|pad|desk|under|mini|portable)\b)/i, reason: "Elliptical" },
  { pattern: /\b(stationary|exercise|spin|recumbent|indoor\s*cycling?)\s*bike\b(?!.{0,20}\b(seat|cover|pedal|cushion)\b)/i, reason: "Stationary bike" },
  { pattern: /\browing\s*machine\b(?!.{0,40}\b(seat|pad|handle|cushion|foldable|plegable|squat|compact|portable)\b)/i, reason: "Rowing machine" },
  // Large appliances (careful negative lookaheads to avoid accessories)
  { pattern: /\b(upright\s*)?refrigerator\b(?!.{0,40}\b(mat|magnet|organizer|bin|shelf|light|thermometer|filter|seal|mini|fridge|deodorizer|odor|freshener|cleaner)\b)/i, reason: "Refrigerator" },
  { pattern: /\bwashing\s*machine\b(?!.{0,40}\b(cleaner|clean|tab|detergent|cover|hose|filter|mini|portable|limpiador|affresh|descaler)\b)/i, reason: "Washing machine" },
  // Large furniture
  { pattern: /\b(corner\s*)?sofa\b.*\b(italian|electric|leather|sectional|reclining|large)\b/i, reason: "Large sofa" },
  { pattern: /\bbed\s*frame\b(?!.{0,20}\b(bracket|stopper|wheel|pad|riser)\b)/i, reason: "Bed frame" },
  { pattern: /\b(king|queen|full)\s*(size\s*)?mattress\b(?!.{0,20}\b(protector|cover|pad|topper|bag)\b)/i, reason: "Mattress" },
  // Outdoor/recreation
  { pattern: /\bpool\s*table\b(?!.{0,20}\b(cover|cloth|chalk|cue|ball)\b)/i, reason: "Pool table" },
  { pattern: /\btrampoline\b(?!.{0,20}\b(pad|spring|net|mat|cover|mini|fitness|rebounder)\b)/i, reason: "Trampoline" },
  // Industrial
  { pattern: /\btable\s*saw\b(?!.{0,20}\b(blade|fence|guard|jig|insert)\b)/i, reason: "Table saw" },
  { pattern: /\blawn\s*mower\b(?!.{0,20}\b(blade|belt|filter|cover|wheel|part)\b)/i, reason: "Lawn mower" },
  // Gaming cockpit
  { pattern: /\bgaming\s*(cockpit|workstation|pod)\b/i, reason: "Gaming cockpit" },
  // Drones — restricted for air shipping (exclude toys, LEGO, orb balls)
  { pattern: /\bdrone\b(?!.{0,30}\b(toy|lego|orb|ball|costume|cosplay)\b)(?<!\b(boomerang|magic|flying\s*orb|lego|toy)\s*)/i, reason: "Drone" },
  { pattern: /\bdji\s+(mini|mavic|air|avata|phantom|fpv|inspire)\b/i, reason: "DJI drone" },
  { pattern: /\bquadcopter\b(?!.{0,20}\b(toy|mini|kids)\b)/i, reason: "Quadcopter/drone" },
  { pattern: /\b(fpv|uav)\s+(drone|fly|camera|kit|combo)\b/i, reason: "FPV/UAV drone" },
];

/**
 * Check if a product name indicates an item that cannot be shipped by air.
 * Returns the reason string if unsendable, or null if OK.
 */
export function isUnsendable(name: string): string | null {
  for (const { pattern, reason } of UNSENDABLE_PATTERNS) {
    if (pattern.test(name)) return reason;
  }
  return null;
}

// ===== WEIGHT VALIDATION GUARDRAILS =====
// These prevent pricing errors that can lose money on every sale.
// Max allowed weight per category — anything above triggers a sanity check
const MAX_CATEGORY_WEIGHT: Record<string, number> = {
  phones: 3, beauty: 5, health: 5, clothing: 5, shoes: 5,
  toys: 10, gaming: 10, tech: 15, office: 10, food: 25,
  pets: 40, home: 20, baby: 20, sports: 50, auto: 15, default: 10
};

// Smart weight estimation by product name — used as sanity check
export function estimateWeightByName(name: string, category: string): number {
  const t = name.toLowerCase();
  // Very light (<1 lb)
  if (/fire tv stick|streaming stick|roku stick|chromecast|dongle/.test(t)) return 0.5;
  if (/earbuds?|airpods?|in-ear|auricular|audifonos?/.test(t)) return 0.3;
  if (/phone case|funda|screen protector|protector.*pantalla|pop socket/.test(t)) return 0.3;
  if (/charger|cable|hdmi|\busb\b|adapter|adaptador|\bhub\b|cargador/.test(t)) return 0.5;
  if (/\bmouse\b|\bmice\b|raton|ratón/.test(t)) return 0.5;
  if (/remote|control remoto/.test(t)) return 0.3;
  if (/memory card|sd card|flash drive|pendrive/.test(t)) return 0.1;
  if (/smart\s?watch|reloj|fitbit|tracker/.test(t)) return 0.5;
  if (/cream|serum|lotion|shampoo|soap|perfume|makeup|sponge/.test(t)) return 0.5;
  if (/\bplug\b|smart plug|enchufe/.test(t)) return 0.3;
  if (/\bbattery\b|\bbatteries\b|pila/.test(t)) return 0.5;
  // Light (1-3 lbs)
  if (/keyboard|teclado/.test(t)) return 1.5;
  if (/headphone|headset|speaker.*portable|bocina/.test(t)) return 1.5;
  if (/controller|gamepad|joystick/.test(t)) return 1.0;
  if (/shirt|camiseta|camisa|blouse|blusa|t-?shirt/.test(t)) return 0.8;
  if (/pants|pantalon|jeans|shorts/.test(t)) return 1.0;
  if (/jacket|chaqueta|hoodie|sweater|coat/.test(t)) return 1.5;
  if (/shoes|sneaker|boot|zapatos|zapatillas|tenis|sandal/.test(t)) return 2.0;
  if (/backpack|mochila|bag|bolso|purse|cartera/.test(t)) return 2.0;
  if (/toy|juguete|plush|peluche|lego|puzzle/.test(t)) return 2.0;
  if (/tablet|ipad|kindle|fire hd/.test(t)) return 1.5;
  if (/camera|camara|gopro|webcam/.test(t)) return 1.5;
  if (/router|modem|wifi|extender/.test(t)) return 1.5;
  if (/microphone|microfono/.test(t)) return 1.5;
  if (/bottle|botella|tumbler|cup|taza|mug/.test(t)) return 1.0;
  // Medium (3-10 lbs)
  if (/laptop|chromebook|macbook/.test(t)) return 5.0;
  if (/monitor|pantalla/.test(t)) return 8.0;
  if (/\btv\b|television|televisor/.test(t)) return 8.0;
  if (/printer|impresora/.test(t)) return 10.0;
  if (/vacuum|aspiradora/.test(t)) return 8.0;
  if (/blender|licuadora|mixer|batidora/.test(t)) return 6.0;
  if (/coffee.*maker|cafetera|espresso/.test(t)) return 6.0;
  if (/air\s?fryer|freidora/.test(t)) return 8.0;
  if (/comforter|duvet|blanket|cobija/.test(t)) return 6.0;
  // Heavy (legitimately 10+ lbs)
  if (/dumbbell|pesa|barbell|weight.*set|kettlebell/.test(t)) return 20.0;
  if (/dog food|cat food|pet food|cat litter|comida.*perro/.test(t)) return 20.0;
  if (/gaming chair|silla.*gaming|office chair|silla.*oficina/.test(t)) return 35.0;
  if (/treadmill|caminadora|elliptical|bench.*press/.test(t)) return 40.0;
  if (/stroller|carriola|car seat|silla.*auto|crib|cuna/.test(t)) return 15.0;
  if (/motor\s?oil|aceite.*motor/.test(t)) return 10.0;
  // Category fallback
  const catW: Record<string, number> = {phones:0.5,beauty:0.5,health:1.0,clothing:1.0,shoes:2.0,toys:2.0,gaming:1.5,tech:2.0,office:1.5,food:2.0,pets:2.0,home:3.0,baby:3.0,sports:3.0,auto:3.0};
  return catW[category] || 2.0;
}

// Validate and clamp weight — prevents obviously wrong weights from entering the system
export function validateWeight(weight: number, name: string, category: string): { weight: number; warning: string | null } {
  const maxForCategory = MAX_CATEGORY_WEIGHT[category] || MAX_CATEGORY_WEIGHT.default;
  const estimate = estimateWeightByName(name, category);
  
  // RULE 1: Absolute max of 150 lbs (our shipping limit)
  if (weight > 150) {
    return { weight: estimate, warning: `Weight ${weight} lbs exceeds 150 lb limit, using estimate ${estimate} lbs` };
  }
  
  // RULE 2: If API weight is more than 5x the name-based estimate AND above category max, it's likely wrong
  if (weight > estimate * 5 && weight > maxForCategory) {
    return { weight: estimate, warning: `Weight ${weight} lbs is ${(weight/estimate).toFixed(0)}x the estimate for "${name.slice(0,40)}", clamped to ${estimate} lbs` };
  }
  
  // RULE 3: If a small electronic/accessory has weight > 10 lbs, override
  if (weight > 10 && /cable|usb|charger|mouse|earbuds?|plug|hub|adapter|remote|sponge|brush|protector|\bcase\b/i.test(name)) {
    return { weight: estimate, warning: `Small item "${name.slice(0,30)}" had ${weight} lbs, corrected to ${estimate} lbs` };
  }
  
  // Weight looks reasonable
  return { weight, warning: null };
}

// Get the best weight: prefer packageWeight (what ships), then itemWeight, then fallback
// Now includes validation to prevent inflated weights
export function getBestWeight(itemWeight: number | null, packageWeight: number | null, fallbackEstimate: number, productName?: string, category?: string): number {
  let raw: number;
  // packageWeight is what actually ships — most accurate for shipping cost
  if (packageWeight && packageWeight > 0) raw = packageWeight;
  // itemWeight is the product itself — add 10% for packaging
  else if (itemWeight && itemWeight > 0) raw = +(itemWeight * 1.10).toFixed(2);
  // No real weight available — use estimate
  else raw = fallbackEstimate;
  
  // Apply validation guardrails if we have product info
  if (productName && category) {
    const validated = validateWeight(raw, productName, category);
    if (validated.warning) {
      console.log(`[WEIGHT GUARD] ${validated.warning}`);
    }
    return validated.weight;
  }
  return raw;
}

export async function searchProducts(query: string, page = 1): Promise<any> {
  if (!CANOPY_API_KEY) throw new Error("CANOPY_API_KEY no configurada");
  const res = await fetch(`${REST_BASE}/api/amazon/search?searchTerm=${encodeURIComponent(query)}&page=${page}`, {
    headers: {
      "API-KEY": CANOPY_API_KEY,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Canopy API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  // REST response structure: data.amazonProductSearchResults.productResults.results
  const searchResults = data?.data?.amazonProductSearchResults?.productResults;
  return {
    results: searchResults?.results || [],
    pageInfo: searchResults?.pageInfo || {},
  };
}

export async function getProductByAsin(asin: string): Promise<CanopyProduct> {
  if (!CANOPY_API_KEY) throw new Error("CANOPY_API_KEY no configurada");
  // Retry up to 2 times with timeout
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${REST_BASE}/api/amazon/product?asin=${asin}`, {
        headers: {
          "API-KEY": CANOPY_API_KEY,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 429) {
        // Rate limited - wait and retry
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Canopy API error ${res.status}: ${text}`);
      }
      const data = await res.json();
      return data?.data?.amazonProduct || data;
    } catch (e: any) {
      if (attempt === 1 || (e.name !== 'TimeoutError' && e.name !== 'AbortError')) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`Canopy API: max retries for ASIN ${asin}`);
}

// Full product detail via GraphQL (images, featureBullets, variants)
const GRAPHQL_BASE = "https://graphql.canopyapi.co";

export interface ProductVariant {
  asin: string;
  text: string;
  price: { display: string; value: number } | null;
  attributes: { name: string; value: string }[];
}

export interface FullProductDetail {
  title: string;
  asin: string;
  brand: string;
  imageUrls: string[];
  mainImageUrl: string;
  featureBullets: string[];
  variants: ProductVariant[];
  rating: number;
  ratingsTotal: number;
  price: { value: number; display: string; currency: string };
  isPrime: boolean;
  itemWeight: string | null;
  packageWeight: string | null;
}

export async function getFullProductDetail(asin: string): Promise<FullProductDetail | null> {
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.amazonProduct || null;
  } catch {
    return null;
  }
}

export function canopyToProduct(cp: CanopyProduct, category: string, weight: number = 1): Omit<Product, "id"> & { id: number } {
  const basePrice = cp.price?.value || 0;
  const shippingPerLb = 5.50;
  const totalPriceUsd = +(basePrice * 1.15 + weight * shippingPerLb).toFixed(2);

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
    createdAt: new Date().toISOString(),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100);
}
