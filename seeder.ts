// @ts-nocheck
import fs from 'fs';
import { MASTER_PRODUCTS, MASTER_VARIANTS } from '../src/data/seedData';

const PROJECT_URL = 'https://pdovuxqbymgqzvaxcwuk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkb3Z1eHFieW1ncXp2YXhjd3VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQzNzcyNywiZXhwIjoyMTA2MDEzNzI3fQ.hj1d23Ci41oYdoqoqvuCuTCUDkTSYcR_L7goL_FNXrY';

async function fetchAPI(path, options = {}) {
  const url = `${PROJECT_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Error on ${path}: ${res.status} ${text}`);
    throw new Error(text);
  }
  return res.status === 204 ? null : res.json();
}

async function run() {
  console.log(`Starting seed... Products: ${MASTER_PRODUCTS.length}, Variants: ${MASTER_VARIANTS.length}`);

  let existingProducts = await fetchAPI('products?select=id,slug');
  let existingSlugs = new Set(existingProducts.map(p => p.slug));

  let failed = [];
  
  for (const prod of MASTER_PRODUCTS) {
    if (existingSlugs.has(prod.slug)) {
      console.log(`Skipping ${prod.name} (already exists)`);
      continue;
    }

    try {
      // Insert Product
      const productRow = {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description || '',
        category_id: prod.category_id,
        is_pure_ghee: prod.pure_ghee === true ? true : false,
        shelf_life_days: prod.shelf_life_days || 7,
        is_active: prod.is_active !== false,
        ingredients: prod.ingredients || '',
        is_bestseller: prod.is_bestseller || false
      };

      await fetchAPI('products', {
        method: 'POST',
        body: JSON.stringify(productRow)
      });
      console.log(`Inserted product: ${prod.name}`);

      // Insert Image (if any)
      if (prod.image_url) {
        // generate random UUID for image
        const imgId = crypto.randomUUID();
        await fetchAPI('product_images', {
          method: 'POST',
          body: JSON.stringify({
            id: imgId,
            product_id: prod.id,
            url: prod.image_url,
            is_primary: true,
            display_order: 1
          })
        });
      }

      // Insert Variants
      const pVars = MASTER_VARIANTS.filter(v => v.productId === prod.id);
      for (const [idx, v] of pVars.entries()) {
        const variantRow = {
          id: v.id,
          product_id: prod.id,
          label: v.label,
          weight_grams: v.weightGrams,
          price: v.price,
          mrp: v.mrp,
          stock_status: v.stockStatus || 'IN_STOCK',
          stock_quantity: v.stockQuantity || 100,
          display_order: idx + 1
        };
        await fetchAPI('product_variants', {
          method: 'POST',
          body: JSON.stringify(variantRow)
        });
      }
    } catch (e) {
      failed.push({ name: prod.name, error: e.message });
    }
  }

  console.log("\n=== SUMMARY ===");
  const pFinal = await fetchAPI('products?select=id');
  const vFinal = await fetchAPI('product_variants?select=id');
  
  console.log(`Final Products Count: ${pFinal.length} (Expected: ${MASTER_PRODUCTS.length})`);
  console.log(`Final Variants Count: ${vFinal.length} (Expected: ${MASTER_VARIANTS.length})`);
  
  if (failed.length > 0) {
    console.log(`Failed insertions: ${failed.length}`);
    failed.forEach(f => console.log(`- ${f.name}: ${f.error}`));
  }
}

run().catch(console.error);
