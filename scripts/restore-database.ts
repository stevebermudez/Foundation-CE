import { exec } from "child_process";
import { promisify } from "util";
import { readFile, access } from "fs/promises";
import { constants } from "fs";
import { gunzip } from "zlib";
import { promisify as promisifyUtil } from "util";
import * as readline from "readline";

const execAsync = promisify(exec);
const gunzipAsync = promisifyUtil(gunzip);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

// Parse DATABASE_URL to extract connection details
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.slice(1), // Remove leading /
      user: parsed.username,
      password: parsed.password,
    };
  } catch (error) {
    console.error("❌ Failed to parse DATABASE_URL:", error);
    process.exit(1);
  }
}

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

async function restoreBackup(backupPath: string) {
  const dbConfig = parseDatabaseUrl(DATABASE_URL!);

  console.log(`📥 Restoring from backup: ${backupPath}`);

  // Check if file exists
  try {
    await access(backupPath, constants.F_OK);
  } catch {
    console.error(`❌ Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  // Read and decompress if needed
  let sqlContent: Buffer;
  try {
    const fileContent = await readFile(backupPath);
    if (backupPath.endsWith(".gz")) {
      console.log("📦 Decompressing backup...");
      sqlContent = await gunzipAsync(fileContent);
    } else {
      sqlContent = fileContent;
    }
  } catch (error: any) {
    console.error("❌ Failed to read backup file:", error.message);
    process.exit(1);
  }

  // Build psql command
  const psqlCmd = [
    "psql",
    `--host=${dbConfig.host}`,
    `--port=${dbConfig.port}`,
    `--username=${dbConfig.user}`,
    `--dbname=${dbConfig.database}`,
    "--no-password", // Use .pgpass or environment variable
    "--quiet", // Suppress output except errors
  ].join(" ");

  // Set PGPASSWORD environment variable for psql
  const env = { ...process.env, PGPASSWORD: dbConfig.password };

  try {
    console.log("🔄 Restoring database...");
    const { stdout, stderr } = await execAsync(psqlCmd, {
      env,
      input: sqlContent.toString(),
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    });

    if (stderr && !stderr.includes("WARNING")) {
      console.warn("⚠️  psql warnings:", stderr);
    }

    if (stdout) {
      console.log(stdout);
    }

    console.log("✅ Database restored successfully");
  } catch (error: any) {
    console.error("❌ Restore failed:", error.message);
    if (error.stderr) {
      console.error("Error details:", error.stderr);
    }
    throw error;
  }
}

async function main() {
  const backupPath = process.argv[2];

  if (!backupPath) {
    console.error("❌ Usage: tsx scripts/restore-database.ts <backup-file-path>");
    console.error("   Example: tsx scripts/restore-database.ts backups/backup-2024-01-15.sql.gz");
    process.exit(1);
  }

  console.log("⚠️  WARNING: This will overwrite the current database!");
  console.log(`   Database: ${parseDatabaseUrl(DATABASE_URL!).database}`);
  console.log(`   Backup file: ${backupPath}`);

  const confirmed = await askConfirmation("Are you sure you want to proceed?");

  if (!confirmed) {
    console.log("❌ Restore cancelled");
    process.exit(0);
  }

  try {
    await restoreBackup(backupPath);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Restore process failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

