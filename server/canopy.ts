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

export async function searchProducts(query: string, page = 1): Promise<any> {
  if (!CANOPY_API_KEY) throw new Error("CANOPY_API_KEY no configurada");
  const res = await fetch(`${REST_BASE}/api/amazon/search?searchTerm=${encodeURIComponent(query)}&page=${page}`, {
    headers: {
      "API-KEY": CANOPY_API_KEY,
      "Content-Type": "application/json",
    },
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
  const res = await fetch(`${REST_BASE}/api/amazon/product?asin=${asin}`, {
    headers: {
      "API-KEY": CANOPY_API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Canopy API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  // REST response: data.amazonProduct
  return data?.data?.amazonProduct || data;
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
