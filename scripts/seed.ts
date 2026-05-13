/**
 * Seeds the Supabase project with the mock catalog from src/lib/data.ts.
 * Uses the service-role key — bypasses RLS, so run it locally only.
 *
 *   npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { categories, products } from "../src/lib/data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "✖ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      "  Run with: npm run seed   (loads .env.local automatically)",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("→ Seeding categories…");
  const { data: cats, error: cErr } = await supabase
    .from("categories")
    .upsert(
      categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        image_url: c.image,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");
  if (cErr) throw cErr;

  const bySlug = Object.fromEntries(cats!.map((c) => [c.slug, c.id]));

  console.log("→ Seeding products…");
  const rows = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    description: p.description,
    price: p.price,
    old_price: p.oldPrice ?? null,
    badge: p.badge ?? null,
    stock: p.stock,
    featured: !!p.featured,
    rating: p.rating,
    reviews: p.reviews,
    features: p.features,
    images: p.images,
    category_id: bySlug[p.categorySlug],
  }));

  const { error: pErr } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" });
  if (pErr) throw pErr;

  console.log(`✓ Done — ${cats!.length} categories, ${rows.length} products.`);
}

main().catch((e) => {
  console.error("✖ Seed failed:", e);
  process.exit(1);
});
