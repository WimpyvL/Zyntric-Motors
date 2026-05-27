#!/usr/bin/env node
// (|/) Klaasvaakie is the author.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set(["node_modules", "dist", "build", ".git", "coverage"]);

const BLOCKED_NAME_PATTERNS = [
  /firebase-applet-config\.json$/i,
  /firebase.*config.*\.json$/i,
  /google.*config.*\.json$/i,
  /service.*account.*\.json$/i,
  /credentials.*\.json$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.p8$/i,
  /\.key$/i,
  /\.crt$/i,
];

const SECRET_VALUE_PATTERNS = [
  /AIza[0-9A-Za-z\-_]{35}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----/g,
];

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(ROOT, abs);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      walk(abs, out);
      continue;
    }
    out.push({ abs, rel });
  }
  return out;
}

function isLikelyText(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  return [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".env", ".txt", ".yml", ".yaml"].includes(ext) || path.basename(absPath).startsWith(".env");
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  if (BLOCKED_NAME_PATTERNS.some((re) => re.test(file.rel))) {
    violations.push(`blocked filename: ${file.rel}`);
    continue;
  }
  if (!isLikelyText(file.abs)) continue;
  let content = "";
  try {
    content = fs.readFileSync(file.abs, "utf8");
  } catch {
    continue;
  }
  for (const re of SECRET_VALUE_PATTERNS) {
    if (re.test(content)) {
      violations.push(`secret-shaped content: ${file.rel}`);
      break;
    }
  }
}

if (violations.length > 0) {
  console.error("Secret guard failed:");
  for (const item of violations) console.error(`- ${item}`);
  process.exit(1);
}

console.log("Secret guard passed.");
