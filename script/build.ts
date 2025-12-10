import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "@neondatabase/serverless",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "docx",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Copy catalog snapshot for production sync
  console.log("copying catalog snapshot...");
  const snapshotSrc = join(process.cwd(), "server", "catalogSnapshot.json");
  const snapshotDest = join(process.cwd(), "dist", "server", "catalogSnapshot.json");
  
  if (existsSync(snapshotSrc)) {
    await mkdir(join(process.cwd(), "dist", "server"), { recursive: true });
    await copyFile(snapshotSrc, snapshotDest);
    console.log("  catalog snapshot copied to dist/server/");
  } else {
    console.log("  WARNING: catalogSnapshot.json not found, skipping copy");
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
