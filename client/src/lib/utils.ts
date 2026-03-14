import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)} USD`;
}

export function formatBs(amountUsd: number, bcvRate: number = 62, differential: number = 1.5): string {
  const bs = amountUsd * differential * bcvRate;
  return `Bs. ${bs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculatePriceUsd(basePrice: number, weight: number, shippingPerLb: number = 5.5): number {
  return +(basePrice * 1.15 + weight * shippingPerLb).toFixed(2);
}

export function calculatePriceBs(priceUsd: number, bcvRate: number = 62, differential: number = 1.5): number {
  return +(priceUsd * differential * bcvRate).toFixed(2);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calculateEstimatedDelivery(): string {
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

  return available.toLocaleDateString("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

export function slugify(text: string): string {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
