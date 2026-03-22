/**
 * Dry run: show what would change without making API calls
 */
import { estimateWeightByName } from "../server/canopy";

const ADMIN_EMAIL = "admin@copikonusa.com";
const ADMIN_PASS = "admin123";
const BASE_URL = "https://copikonusa.com";

async function main() {
  const resp = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const { token } = await resp.json();
  
  const all: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await fetch(`${BASE_URL}/api/admin/products?page=${page}&limit=200`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await r.json();
    if (!data.products || data.products.length === 0) break;
    all.push(...data.products.filter((p: any) => p.weight === 1.5 && p.isActive));
  }
  
  console.log(`Products with 1.5 lb default: ${all.length}\n`);
  
  let wouldUpdate = 0;
  let wouldKeep = 0;
  const updates: { id: number; weight: number }[] = [];
  
  for (const p of all) {
    const est = estimateWeightByName(p.name || "", p.category || "");
    if (Math.abs(est - 1.5) > 0.3) {
      wouldUpdate++;
      updates.push({ id: p.id, weight: est });
      if (wouldUpdate <= 20) {
        const newPrice = +(p.basePrice * 1.15 + est * 5.50).toFixed(2);
        const diff = newPrice - p.totalPriceUsd;
        console.log(`  ${p.name?.substring(0, 50).padEnd(50)} | ${p.category.padEnd(8)} | 1.5→${est} lbs | $${p.totalPriceUsd}→$${newPrice} (${diff > 0 ? '+' : ''}$${diff.toFixed(2)})`);
      }
    } else {
      wouldKeep++;
    }
  }
  
  console.log(`\nWould update: ${wouldUpdate}`);
  console.log(`Would keep: ${wouldKeep}`);
  
  // Save updates list for batch processing
  const fs = await import('fs');
  fs.writeFileSync('/home/user/workspace/weight_updates.json', JSON.stringify(updates));
  console.log(`\nSaved ${updates.length} updates to /home/user/workspace/weight_updates.json`);
}

main().catch(console.error);
