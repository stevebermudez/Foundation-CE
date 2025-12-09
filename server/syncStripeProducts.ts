import Stripe from "stripe";
import { db } from "./db";
import { courses, courseBundles } from "@shared/schema";

async function syncStripeProducts() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY not configured");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  console.log("Starting Stripe product sync...\n");

  // Get all courses from database
  const allCourses = await db.select().from(courses);
  console.log(`Found ${allCourses.length} courses to sync\n`);

  // Get existing Stripe products by SKU (using metadata)
  const existingProducts = await stripe.products.list({ limit: 100, active: true });
  const productsBySku = new Map<string, Stripe.Product>();
  for (const product of existingProducts.data) {
    if (product.metadata?.sku) {
      productsBySku.set(product.metadata.sku, product);
    }
  }

  // Sync each course
  for (const course of allCourses) {
    const sku = course.sku || course.id;
    console.log(`\nProcessing: ${course.title}`);
    console.log(`  SKU: ${sku}`);
    console.log(`  Price: $${((course.price || 0) / 100).toFixed(2)}`);

    const existingProduct = productsBySku.get(sku);

    try {
      let product: Stripe.Product;

      if (existingProduct) {
        // Update existing product
        product = await stripe.products.update(existingProduct.id, {
          name: course.title,
          description: course.description || undefined,
          metadata: {
            sku,
            courseId: course.id,
            state: course.state || "FL",
            licenseType: course.licenseType || "",
            hours: String(course.hoursRequired || 0),
            requirementType: course.requirementCycleType || "",
          },
        });
        console.log(`  ✓ Updated product: ${product.id}`);
      } else {
        // Create new product
        product = await stripe.products.create({
          name: course.title,
          description: course.description || undefined,
          metadata: {
            sku,
            courseId: course.id,
            state: course.state || "FL",
            licenseType: course.licenseType || "",
            hours: String(course.hoursRequired || 0),
            requirementType: course.requirementCycleType || "",
          },
        });
        console.log(`  ✓ Created product: ${product.id}`);
      }

      // Check for existing price
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 10,
      });

      const targetAmount = course.price || 0;
      const matchingPrice = existingPrices.data.find(
        (p) => p.unit_amount === targetAmount && p.currency === "usd"
      );

      if (matchingPrice) {
        console.log(`  ✓ Price already exists: ${matchingPrice.id} ($${(targetAmount / 100).toFixed(2)})`);
      } else {
        // Deactivate old prices
        for (const oldPrice of existingPrices.data) {
          await stripe.prices.update(oldPrice.id, { active: false });
        }

        // Create new price
        const newPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: targetAmount,
          currency: "usd",
          metadata: {
            sku,
            courseId: course.id,
          },
        });
        console.log(`  ✓ Created price: ${newPrice.id} ($${(targetAmount / 100).toFixed(2)})`);
      }
    } catch (err: any) {
      console.error(`  ✗ Error syncing ${course.title}:`, err.message);
    }
  }

  // Sync bundles
  const allBundles = await db.select().from(courseBundles);
  console.log(`\n\nFound ${allBundles.length} bundles to sync\n`);

  for (const bundle of allBundles) {
    const sku = `BUNDLE-${bundle.id.substring(0, 8)}`;
    console.log(`\nProcessing bundle: ${bundle.name}`);
    console.log(`  Price: $${((bundle.bundlePrice || 0) / 100).toFixed(2)}`);

    try {
      // Check if bundle product exists
      const bundleProducts = await stripe.products.search({
        query: `metadata['bundleId']:'${bundle.id}'`,
      });

      let product: Stripe.Product;

      if (bundleProducts.data.length > 0) {
        product = await stripe.products.update(bundleProducts.data[0].id, {
          name: bundle.name,
          description: bundle.description || undefined,
          metadata: {
            bundleId: bundle.id,
            sku,
            state: bundle.state || "FL",
            totalHours: String(bundle.totalHours || 0),
          },
        });
        console.log(`  ✓ Updated bundle product: ${product.id}`);
      } else {
        product = await stripe.products.create({
          name: bundle.name,
          description: bundle.description || undefined,
          metadata: {
            bundleId: bundle.id,
            sku,
            state: bundle.state || "FL",
            totalHours: String(bundle.totalHours || 0),
          },
        });
        console.log(`  ✓ Created bundle product: ${product.id}`);
      }

      // Check for existing price
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 10,
      });

      const targetAmount = bundle.bundlePrice || 0;
      const matchingPrice = existingPrices.data.find(
        (p) => p.unit_amount === targetAmount && p.currency === "usd"
      );

      if (matchingPrice) {
        console.log(`  ✓ Price already exists: ${matchingPrice.id} ($${(targetAmount / 100).toFixed(2)})`);
      } else {
        for (const oldPrice of existingPrices.data) {
          await stripe.prices.update(oldPrice.id, { active: false });
        }

        const newPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: targetAmount,
          currency: "usd",
          metadata: {
            bundleId: bundle.id,
            sku,
          },
        });
        console.log(`  ✓ Created price: ${newPrice.id} ($${(targetAmount / 100).toFixed(2)})`);
      }
    } catch (err: any) {
      console.error(`  ✗ Error syncing bundle ${bundle.name}:`, err.message);
    }
  }

  console.log("\n\n✅ Stripe product sync complete!");
}

syncStripeProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
