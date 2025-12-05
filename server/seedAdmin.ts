import { db } from "./db";
import { users, supervisors } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

export async function ensureAdminExists(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@foundationce.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.log("⚠ ADMIN_PASSWORD not set - skipping admin seeding");
    return;
  }

  try {
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    let userId: string;

    if (existingAdmin.length > 0) {
      userId = existingAdmin[0].id;
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await db
        .update(users)
        .set({ isAdmin: true, passwordHash })
        .where(eq(users.email, adminEmail));
      console.log("✓ Admin user credentials updated");
    } else {
      userId = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      await db.insert(users).values({
        id: userId,
        email: adminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
      console.log("✓ Admin user created");
    }

    const existingSupervisor = await db
      .select()
      .from(supervisors)
      .where(eq(supervisors.userId, userId));

    if (existingSupervisor.length === 0) {
      await db.insert(supervisors).values({
        userId: userId,
        role: "admin",
        canReviewCE: 1,
        canTrackLicenses: 1,
        canApproveRenewals: 0,
      });
      console.log("✓ Admin supervisor role created");
    }
  } catch (error) {
    console.error("Error ensuring admin exists:", error);
  }
}
