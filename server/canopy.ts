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

// Get the best weight: prefer packageWeight (what ships), then itemWeight, then fallback
export function getBestWeight(itemWeight: number | null, packageWeight: number | null, fallbackEstimate: number): number {
  // packageWeight is what actually ships — most accurate for shipping cost
  if (packageWeight && packageWeight > 0) return packageWeight;
  // itemWeight is the product itself — add 10% for packaging
  if (itemWeight && itemWeight > 0) return +(itemWeight * 1.10).toFixed(2);
  // No real weight available — use estimate
  return fallbackEstimate;
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
