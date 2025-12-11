import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { join } from "path";
import { gzip } from "zlib";
import { promisify as promisifyUtil } from "util";

const execAsync = promisify(exec);
const gzipAsync = promisifyUtil(gzip);

const BACKUP_DIR = process.env.BACKUP_DIR || join(process.cwd(), "backups");
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

async function ensureBackupDir() {
  try {
    await mkdir(BACKUP_DIR, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function createBackup(): Promise<string> {
  const dbConfig = parseDatabaseUrl(DATABASE_URL);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `backup-${timestamp}.sql`;
  const backupPath = join(BACKUP_DIR, backupFileName);

  console.log(`📦 Creating backup: ${backupFileName}`);

  // Build pg_dump command
  const pgDumpCmd = [
    "pg_dump",
    `--host=${dbConfig.host}`,
    `--port=${dbConfig.port}`,
    `--username=${dbConfig.user}`,
    `--dbname=${dbConfig.database}`,
    "--no-password", // Use .pgpass or environment variable
    "--format=plain",
    "--verbose",
  ].join(" ");

  // Set PGPASSWORD environment variable for pg_dump
  const env = { ...process.env, PGPASSWORD: dbConfig.password };

  try {
    const { stdout, stderr } = await execAsync(pgDumpCmd, { env, maxBuffer: 10 * 1024 * 1024 });
    
    if (stderr && !stderr.includes("WARNING")) {
      console.warn("⚠️  pg_dump warnings:", stderr);
    }

    // Compress the backup
    console.log("🗜️  Compressing backup...");
    const compressed = await gzipAsync(Buffer.from(stdout));
    const compressedPath = `${backupPath}.gz`;
    await writeFile(compressedPath, compressed);

    console.log(`✅ Backup created: ${compressedPath}`);
    return compressedPath;
  } catch (error: any) {
    console.error("❌ Backup failed:", error.message);
    if (error.stderr) {
      console.error("Error details:", error.stderr);
    }
    throw error;
  }
}

async function cleanupOldBackups() {
  try {
    const files = await readdir(BACKUP_DIR);
    const backupFiles = files
      .filter((f) => f.startsWith("backup-") && f.endsWith(".sql.gz"))
      .map((f) => ({
        name: f,
        path: join(BACKUP_DIR, f),
        date: new Date(f.match(/backup-(.+?)\.sql\.gz/)?.[1] || ""),
      }))
      .filter((f) => !isNaN(f.date.getTime()))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Keep last 7 daily backups
    const dailyBackups = backupFiles.filter((f, i) => i < 7);
    const toDelete = backupFiles.slice(7);

    // Keep 4 weekly backups (one per week for last 4 weeks)
    const weeklyBackups: typeof backupFiles = [];
    const weeks = new Set<string>();
    for (const backup of backupFiles.slice(7)) {
      const weekKey = `${backup.date.getFullYear()}-W${Math.ceil(
        (backup.date.getTime() - new Date(backup.date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
      )}`;
      if (!weeks.has(weekKey) && weeks.size < 4) {
        weeks.add(weekKey);
        weeklyBackups.push(backup);
      }
    }

    // Keep 12 monthly backups
    const monthlyBackups: typeof backupFiles = [];
    const months = new Set<string>();
    for (const backup of backupFiles) {
      const monthKey = `${backup.date.getFullYear()}-${backup.date.getMonth()}`;
      if (!months.has(monthKey) && months.size < 12) {
        months.add(monthKey);
        monthlyBackups.push(backup);
      }
    }

    // Files to keep
    const keepSet = new Set([
      ...dailyBackups.map((f) => f.path),
      ...weeklyBackups.map((f) => f.path),
      ...monthlyBackups.map((f) => f.path),
    ]);

    // Delete old backups
    const deletePromises = toDelete
      .filter((f) => !keepSet.has(f.path))
      .map((f) => {
        console.log(`🗑️  Deleting old backup: ${f.name}`);
        return unlink(f.path);
      });

    await Promise.all(deletePromises);

    if (deletePromises.length > 0) {
      console.log(`✅ Cleaned up ${deletePromises.length} old backup(s)`);
    }
  } catch (error: any) {
    console.error("⚠️  Error during cleanup:", error.message);
    // Don't throw - cleanup failure shouldn't fail the backup
  }
}

async function main() {
  try {
    await ensureBackupDir();
    const backupPath = await createBackup();
    await cleanupOldBackups();
    
    console.log("✅ Backup process completed successfully");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Backup process failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

