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
  { pattern: /\bdrone\b(?!.{0,30}\b(toy|lego|orb|ball|costume|cosplay|spaceship|space|interstellar)\b)(?<!\b(boomerang|magic|flying\s*orb|lego|toy|space)\s*)/i, reason: "Drone" },
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
  phones: 3, beauty: 5, health: 15, clothing: 5, shoes: 5,
  toys: 10, gaming: 10, tech: 15, office: 10, food: 30,
  pets: 40, home: 20, baby: 20, sports: 50, auto: 15, default: 10
};

// Smart weight estimation by product name — used as sanity check AND pricing fallback
// This is CRITICAL for pricing accuracy. Each rule should be based on real product data.
export function estimateWeightByName(name: string, category: string): number {
  const t = name.toLowerCase();

  // ═══ VERY LIGHT (<0.5 lb) ═══
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

  // ═══ LIGHT (0.5-1 lb) ═══
  if (/charger|cable|hdmi|\busb\b|adapter|adaptador|\bhub\b|cargador/.test(t)) return 0.5;
  if (/\bmouse\b|\bmice\b|raton|ratón/.test(t) && !/mouse\s*pad|mouse\s*mat|desk\s*mat/.test(t)) return 0.5;
  if (/smart\s?watch|reloj.*inteligente|fitbit|fitness.*tracker/.test(t)) return 0.5;
  if (/cream|serum|lotion|shampoo|soap|perfume|makeup|sponge/.test(t)) return 0.5;

  // ═══ PROTEIN / SUPPLEMENTS — can be heavy in bulk ═══
  if (/protein.*shake|shake.*protein/.test(t)) {
    const packMatch = t.match(/pack\s+of\s+(\d+)|(\d+)\s*[-]?\s*(?:pack|count|ct)\b/i);
    const packSize = packMatch ? parseInt(packMatch[1] || packMatch[2]) : 0;
    if (packSize >= 10) return 10.0; // 12-pack of protein shakes ~10lbs
    if (packSize >= 4) return 5.0;  // 4-pack ~5lbs
    return 3.0;
  }
  if (/protein.*powder|whey.*protein|creatine.*powder/.test(t)) {
    const ozMatch = t.match(/(\d+\.?\d*)\s*(?:oz|ounce)/i);
    if (ozMatch && parseFloat(ozMatch[1]) > 30) return 3.5;
    return 2.0;
  }
  if (/\bpre-?workout\b|\bbcaa\b|\bamino\b|\bcollagen\b.*powder/.test(t)) return 1.5;
  if (/vitamin|supplement|capsule|tablet|softgel|gummies/i.test(t)) return 0.5;
  if (/\bbattery\b|\bbatteries\b|pila/.test(t)) return 0.5;
  if (/\bwhisk\b|\bpeeler\b|\bcan\s*opener|\bspatula|\btongs\b|\bladle\b/.test(t)) return 0.5;
  if (/herb\s*stripper|garlic\s*press|bottle\s*opener/.test(t)) return 0.3;
  if (/\bseat\s*cover\b(?!.*car\s*seat)/.test(t) && /chair|office|computer/.test(t)) return 1.0;
  if (/\bled\b.*\b(strip|tape)\b|\blight\s*strip\b/.test(t)) return 0.5;

  // ═══ MOUSE PADS & DESK MATS — commonly mis-estimated as 40 lbs ═══
  if (/mouse\s*pad|mouse\s*mat|desk\s*mat|desk\s*pad|gaming.*pad|gaming.*mat/.test(t)) return 1.5;
  if (/\bxxl\b.*\b(pad|mat)\b|\bpad\b.*\bxxl\b|extended.*gaming.*pad/.test(t)) return 2.0;

  // ═══ LED LIGHT BARS — commonly mis-estimated as 40 lbs ═══
  if (/\bled\b.*\b(luz|light)\b.*\bbar\b|\blight\s*bar\b|\bluz\s*bar\b|\bbacklight\b|\bmonitor.*light/.test(t)) return 1.5;
  if (/\brgb\b.*\b(bar|luz|light)\b/.test(t)) return 1.5;
  if (/tv\s*backlight|bias\s*light|ambient.*light|immersive.*led/.test(t)) return 1.0;

  // ═══ LIGHT (1-2 lbs) ═══
  if (/keyboard|teclado/.test(t)) return 1.5;
  if (/headphone|headset|speaker.*portable|bocina|altavoz/.test(t)) return 1.5;
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
  if (/\bpillow\b|\balmohada\b|\bcushion\b/.test(t)) return 2.0;
  if (/\bbook\b|\blibro\b(?!.*shelf|.*case|.*rack)/.test(t)) return 1.5;
  if (/\bwipe|toallita|pañal|diaper/.test(t)) return 2.0;
  if (/flash\s*light|\blinterna\b|\btorch\b/.test(t)) return 0.5;
  if (/\bgaming\b.*\b(microphone|mic)\b|\bcondenser.*mic/.test(t)) return 2.0;

  // ═══ MEDIUM (3-8 lbs) ═══
  if (/laptop|chromebook|macbook|notebook/.test(t)) return 5.0;
  if (/monitor|pantalla/.test(t) && !/\bstand\b|\bmount\b|\bprotector\b/.test(t)) return 8.0;
  if (/\btv\b|television|televisor/.test(t)) return 8.0;
  if (/printer|impresora/.test(t)) return 10.0;
  if (/vacuum|aspiradora/.test(t)) return 8.0;
  if (/blender|licuadora|mixer|batidora/.test(t)) return 6.0;
  if (/coffee.*maker|cafetera|espresso/.test(t)) return 6.0;
  if (/air\s?fryer|freidora/.test(t)) return 8.0;
  if (/\bcomforter\b|\bduvet\b|bed\s*in\s*a\s*bag|bedding\s*set/.test(t)) return 7.0;
  if (/\bblanket\b|\bcobija\b|\bthrow\b/.test(t)) return 3.0;
  if (/shoe\s*rack|shoe\s*organizer|shoe\s*shelf/.test(t)) return 5.0;
  if (/portable.*hard\s*drive|external.*hard\s*drive|\bhdd\b|\bssd\b/.test(t)) return 0.5;
  if (/\bdesk\b(?!.*mat|.*pad|.*lamp|.*organizer)/.test(t)) return 15.0;

  // ═══ PET FOOD / LITTER — legitimately heavy ═══
  if (/cat\s*litter|arena.*gato/.test(t)) {
    // Try to extract weight from name like "22.5lbs" or "40 lb"
    const lbMatch = t.match(/(\d+\.?\d*)\s*(?:lbs?|pounds?)/);
    if (lbMatch) return Math.min(parseFloat(lbMatch[1]), 50);
    return 20.0;
  }
  if (/dog\s*food|cat\s*food|pet\s*food|comida.*(?:perro|gato)/.test(t)) {
    const lbMatch = t.match(/(\d+\.?\d*)\s*(?:lbs?|pounds?)/);
    if (lbMatch) return Math.min(parseFloat(lbMatch[1]), 50);
    return 15.0;
  }

  // ═══ HEAVY (10+ lbs) ═══
  if (/dumbbell|pesa|barbell|weight.*set|kettlebell/.test(t)) {
    // Try to extract weight from name
    const lbMatch = t.match(/(\d+)\s*(?:lbs?|pounds?)/);
    if (lbMatch) return Math.min(parseFloat(lbMatch[1]), 100);
    return 20.0;
  }
  if (/gaming\s*chair|silla.*gaming|office\s*chair|silla.*oficina/.test(t)) return 35.0;
  if (/treadmill|caminadora|elliptical|bench.*press/.test(t)) return 40.0;
  if (/stroller|carriola|car\s*seat|silla.*auto|crib|cuna/.test(t)) return 15.0;
  if (/motor\s?oil|aceite.*motor/.test(t)) return 10.0;
  if (/jumper\s*cable|booster\s*cable/.test(t)) return 6.0;
  if (/\bvacuum\b.*\b(upright|shark|dyson|navigator)\b/.test(t)) return 15.0;

  // ═══ POST-IT NOTES — tiny, often mis-estimated ═══
  if (/post-?it|sticky\s*note|nota.*adhesiva/.test(t)) return 0.3;
  if (/\bnotes?\b.*\bpad\b|notepad|cuaderno/.test(t)) return 0.5;

  // ═══ DRILL / POWER TOOL KITS — moderately heavy ═══
  if (/\bdrill\b|\bimpact.*driver\b|\bsaw\b.*\bcordless\b|\bpower.*tool.*kit\b/.test(t)) return 8.0;
  if (/\bscrewdriver.*set\b|\btool.*set\b/.test(t)) return 3.0;

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
  // BUT: allow higher weights for multipacks (12-pack, 24-count, etc.) — they legitimately weigh more
  const isMultipack = /\b(\d{2,})\s*[-]?\s*(pack|count|ct|cans?|bottles?|pods?|bags?|bars?)\b/i.test(name) || /pack\s+of\s+\d+/i.test(name);
  const multiplier = isMultipack ? 15 : 5; // More lenient for multipacks
  if (weight > estimate * multiplier && weight > maxForCategory) {
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

// ===== SHIPPING COST VIABILITY FILTER =====
// Products where air shipping ($5.50/lb) makes them uncompetitive should be filtered out.
// This prevents showing products that cost 2-3x what they should due to weight.

export interface ShippingViability {
  viable: boolean;
  ratio: number;      // shipping / basePrice  (0.5 = shipping is 50% of product cost)
  shippingCost: number;
  reason: string | null;
}

/**
 * Check if a product's shipping cost makes it unviable for sale.
 * @param basePrice - Amazon base price in USD
 * @param weight - Product weight in lbs
 * @param category - Product category (some categories tolerate higher shipping)
 * @returns ShippingViability with ratio and decision
 */
export function checkShippingViability(basePrice: number, weight: number, category: string = ''): ShippingViability {
  if (!basePrice || basePrice <= 0 || !weight || weight <= 0) {
    return { viable: true, ratio: 0, shippingCost: 0, reason: null };
  }

  const shippingCost = weight * 5.50;
  const ratio = shippingCost / basePrice;

  // Heavy categories that customers EXPECT to pay more shipping for:
  // gym equipment, pet food, furniture — users know these are heavy
  const heavyCategories = ['sports', 'pets', 'home'];
  const isHeavyCategory = heavyCategories.includes(category);

  // Dynamic threshold: heavy categories get 2.0x, others get 1.5x
  const maxRatio = isHeavyCategory ? 2.0 : 1.5;

  if (ratio > maxRatio) {
    return {
      viable: false,
      ratio: +ratio.toFixed(2),
      shippingCost: +shippingCost.toFixed(2),
      reason: `Envío ($${shippingCost.toFixed(2)}) es ${ratio.toFixed(1)}x el precio del producto ($${basePrice.toFixed(2)}) — máximo permitido: ${maxRatio}x`,
    };
  }

  return {
    viable: true,
    ratio: +ratio.toFixed(2),
    shippingCost: +shippingCost.toFixed(2),
    reason: null,
  };
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
