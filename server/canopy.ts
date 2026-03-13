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
