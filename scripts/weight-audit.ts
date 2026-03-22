/**
 * Weight Audit Script v2
 * Checks all products with default weight (1.5 lbs) against Canopy GraphQL API
 * and updates them with real weights.
 * Uses the correct `amazonProduct` query (not `product`)
 */

const CANOPY_KEY = "80388417-0a58-4a38-b2c1-822bc5e4788c";
const ADMIN_EMAIL = "admin@copikonusa.com";
const ADMIN_PASS = "admin123";
const BASE_URL = "https://copikonusa.com";
const GRAPHQL_BASE = "https://graphql.canopyapi.co";

function parseWeightToLbs(weightStr: string | null | undefined): number {
  if (!weightStr) return 0;
  const match = weightStr.match(/([\d.]+)\s*(pounds?|lbs?|ounces?|oz|kilograms?|kg|grams?|g)\b/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  if (isNaN(value) || value <= 0) return 0;
  const unit = match[2].toLowerCase();
  if (unit.startsWith('pound') || unit.startsWith('lb')) return +value.toFixed(2);
  if (unit.startsWith('ounce') || unit === 'oz') return +(value / 16).toFixed(2);
  if (unit.startsWith('kilogram') || unit === 'kg') return +(value * 2.20462).toFixed(2);
  if (unit.startsWith('gram') || unit === 'g') return +(value * 0.00220462).toFixed(2);
  return 0;
}

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

async function fetchCanopyWeight(asin: string): Promise<{ itemWeight: string | null; packageWeight: string | null; title: string | null }> {
  const query = `query { amazonProduct(input: { asin: "${asin}" }) { title itemWeight packageWeight } }`;
  
  const resp = await fetch(GRAPHQL_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': CANOPY_KEY
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(10000),
  });
  
  const data = await resp.json();
  const product = data?.data?.amazonProduct;
  return {
    itemWeight: product?.itemWeight || null,
    packageWeight: product?.packageWeight || null,
    title: product?.title || null
  };
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
  console.log("=== CopikonUSA Weight Audit v2 ===\n");
  
  const token = await getToken();
  console.log("Authenticated.\n");
  
  // First, test with the Pampers product we know has weight data
  console.log("Testing API with known product B01C3H4ZTY...");
  const testResult = await fetchCanopyWeight("B01C3H4ZTY");
  console.log(`  itemWeight: ${testResult.itemWeight}`);
  console.log(`  packageWeight: ${testResult.packageWeight}`);
  console.log(`  title: ${testResult.title?.substring(0, 60)}`);
  console.log("");
  
  const products = await getAllDefaultWeightProducts(token);
  console.log(`Found ${products.length} active products with default weight (1.5 lbs)\n`);
  
  let updated = 0;
  let noData = 0;
  let errors = 0;
  const significant: Array<{ asin: string; name: string; oldW: number; newW: number; oldP: number; newP: number }> = [];
  
  // Process in batches of 3 to avoid rate limits on Canopy
  for (let i = 0; i < products.length; i += 3) {
    const batch = products.slice(i, i + 3);
    
    await Promise.all(batch.map(async (p: any) => {
      try {
        const canopy = await fetchCanopyWeight(p.amazonAsin);
        
        const itemW = parseWeightToLbs(canopy.itemWeight);
        const pkgW = parseWeightToLbs(canopy.packageWeight);
        let bestWeight = pkgW > 0 ? pkgW : itemW > 0 ? +(itemW * 1.1).toFixed(2) : 0;
        
        // Sanity: max 70 lbs for consumer products
        if (bestWeight > 70) {
          console.log(`  ⚠ [${i + batch.indexOf(p) + 1}] ${p.amazonAsin}: suspicious ${bestWeight} lbs — skipping`);
          return;
        }
        
        if (bestWeight > 0 && Math.abs(bestWeight - 1.5) > 0.3) {
          const result = await updateProductWeight(token, p.id, bestWeight);
          console.log(`  ✓ [${i + batch.indexOf(p) + 1}/${products.length}] ${p.amazonAsin}: ${1.5} → ${bestWeight} lbs | $${p.totalPriceUsd} → $${result.totalPriceUsd}`);
          updated++;
          if (Math.abs(result.totalPriceUsd - p.totalPriceUsd) > 5) {
            significant.push({
              asin: p.amazonAsin,
              name: p.name?.substring(0, 60),
              oldW: 1.5,
              newW: bestWeight,
              oldP: p.totalPriceUsd,
              newP: result.totalPriceUsd
            });
          }
        } else {
          noData++;
        }
      } catch (e: any) {
        errors++;
        if (errors <= 5) console.log(`  ✗ ${p.amazonAsin}: ${e.message}`);
      }
    }));
    
    // Rate limit: ~1 second between batches
    if (i + 3 < products.length) {
      await new Promise(r => setTimeout(r, 1200));
    }
    
    // Progress update every 30 products
    if ((i + 3) % 30 === 0 && i > 0) {
      console.log(`  ... processed ${Math.min(i + 3, products.length)}/${products.length} (${updated} updated, ${noData} no data, ${errors} errors)`);
    }
  }
  
  console.log(`\n=== AUDIT COMPLETE ===`);
  console.log(`Total processed: ${products.length}`);
  console.log(`Updated with real weights: ${updated}`);
  console.log(`No weight data from API: ${noData}`);
  console.log(`Errors: ${errors}`);
  
  if (significant.length > 0) {
    console.log(`\n=== SIGNIFICANT PRICE CHANGES (>$5 difference) ===`);
    for (const s of significant) {
      const diff = (s.newP - s.oldP).toFixed(2);
      console.log(`  ${s.asin} (${s.name}): ${s.oldW}→${s.newW}lbs | $${s.oldP}→$${s.newP} (${+diff > 0 ? '+' : ''}$${diff})`);
    }
  }
  
  // Save results
  const fs = await import('fs');
  fs.writeFileSync('/home/user/workspace/weight_audit_results.json', JSON.stringify({ updated, noData, errors, significant, total: products.length }, null, 2));
  console.log(`\nResults saved to /home/user/workspace/weight_audit_results.json`);
}

main().catch(console.error);
