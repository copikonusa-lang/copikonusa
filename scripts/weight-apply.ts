/**
 * Apply weight updates from dry run results (batch, parallel)
 */
const ADMIN_EMAIL = "admin@copikonusa.com";
const ADMIN_PASS = "admin123";
const BASE_URL = "https://copikonusa.com";

async function main() {
  const fs = await import('fs');
  const updates: { id: number; weight: number }[] = JSON.parse(
    fs.readFileSync('/home/user/workspace/weight_updates.json', 'utf8')
  );
  
  console.log(`Applying ${updates.length} weight updates...\n`);
  
  const resp = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const { token } = await resp.json();
  
  let done = 0;
  let errors = 0;
  
  // Process in parallel batches of 10
  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10);
    
    const results = await Promise.allSettled(batch.map(u =>
      fetch(`${BASE_URL}/api/admin/products/${u.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weight: u.weight })
      }).then(r => r.json())
    ));
    
    for (const r of results) {
      if (r.status === 'fulfilled') done++;
      else errors++;
    }
    
    if ((i + 10) % 50 === 0) {
      console.log(`  Progress: ${Math.min(i + 10, updates.length)}/${updates.length} (${done} ok, ${errors} errors)`);
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${done}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
