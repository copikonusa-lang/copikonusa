/**
 * Weight Estimate Audit
 * Uses the existing estimateWeightByName() function to fix products
 * with default weight (1.5 lbs) that should be different.
 * Much faster than Canopy API calls.
 */

const ADMIN_EMAIL = "admin@copikonusa.com";
const ADMIN_PASS = "admin123";
const BASE_URL = "https://copikonusa.com";

// Import from canopy module
import { estimateWeightByName } from "../server/canopy";

async function getToken(): Promise<string> {
  const resp = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const data = await resp.json();
  return data.token;
}

async function getAllDefaultWeightProducts(token: string): Promise<any[]> {
  const all: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const resp = await fetch(`${BASE_URL}/api/admin/products?page=${page}&limit=200`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (!data.products || data.products.length === 0) break;
    const defaults = data.products.filter((p: any) => p.weight === 1.5 && p.isActive);
    all.push(...defaults);
  }
  return all;
}

async function updateProductWeight(token: string, id: number, weight: number): Promise<any> {
  const resp = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ weight })
  });
  return resp.json();
}

async function main() {
  console.log("=== CopikonUSA Weight Estimate Audit ===\n");
  
  const token = await getToken();
  console.log("Authenticated.\n");
  
  const products = await getAllDefaultWeightProducts(token);
  console.log(`Found ${products.length} active products with default weight (1.5 lbs)\n`);
  
  let updated = 0;
  let kept = 0;
  const changes: Array<{ id: number; name: string; category: string; oldW: number; newW: number; oldP: number; newP: number }> = [];
  
  for (const p of products) {
    const estimated = estimateWeightByName(p.name || "", p.category || "");
    
    // Only update if estimate differs significantly from 1.5 (the default)
    if (Math.abs(estimated - 1.5) > 0.3) {
      const result = await updateProductWeight(token, p.id, estimated);
      const diff = (result.totalPriceUsd - p.totalPriceUsd).toFixed(2);
      
      if (Math.abs(result.totalPriceUsd - p.totalPriceUsd) > 2) {
        console.log(`  ✓ ${p.name?.substring(0, 55).padEnd(55)} | ${p.category.padEnd(8)} | ${(1.5 + '').padEnd(4)} → ${(estimated + '').padEnd(5)} lbs | $${p.totalPriceUsd} → $${result.totalPriceUsd} (${+diff > 0 ? '+' : ''}$${diff})`);
      }
      
      changes.push({
        id: p.id,
        name: p.name?.substring(0, 60),
        category: p.category,
        oldW: 1.5,
        newW: estimated,
        oldP: p.totalPriceUsd,
        newP: result.totalPriceUsd
      });
      updated++;
    } else {
      kept++;
    }
  }
  
  console.log(`\n=== AUDIT COMPLETE ===`);
  console.log(`Total processed: ${products.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Kept at 1.5 lbs: ${kept}`);
  
  // Summary of category changes
  const byCategory: Record<string, number> = {};
  for (const c of changes) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  }
  console.log(`\nUpdates by category:`);
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  
  // Significant price changes
  const significant = changes.filter(c => Math.abs(c.newP - c.oldP) > 10);
  if (significant.length > 0) {
    console.log(`\n=== SIGNIFICANT PRICE CHANGES (>$10) ===`);
    for (const s of significant.sort((a, b) => Math.abs(b.newP - b.oldP) - Math.abs(a.newP - a.oldP))) {
      const diff = (s.newP - s.oldP).toFixed(2);
      console.log(`  ${s.name} [${s.category}]: ${s.oldW}→${s.newW}lbs | $${s.oldP}→$${s.newP} (${+diff > 0 ? '+' : ''}$${diff})`);
    }
  }
  
  // Save
  const fs = await import('fs');
  fs.writeFileSync('/home/user/workspace/weight_audit_results.json', JSON.stringify({
    updated, kept, total: products.length, changes, significant
  }, null, 2));
  console.log(`\nResults saved.`);
}

main().catch(console.error);
