import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

async function seedAdminUser() {
  console.log("Seeding admin user...");

  const adminEmail = "admin@foundationce.com";
  const adminPassword = "admin1234";

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists. Updating to admin status...");
      // Update existing user to admin
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await db
        .update(users)
        .set({ isAdmin: true, passwordHash })
        .where(eq(users.email, adminEmail));
      console.log("✓ Admin user updated successfully");
    } else {
      console.log("Creating new admin user...");
      // Create new admin user
      const userId = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      await db.insert(users).values({
        id: userId,
        email: adminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
      console.log("✓ Admin user created successfully");
    }

    console.log("\nAdmin Credentials:");
    console.log("Email: admin@foundationce.com");
    console.log("Password: admin1234");
    console.log("\nYou can now login at /admin/login");
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedAdminUser();
