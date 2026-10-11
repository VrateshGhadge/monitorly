#!/usr/bin/env node
/**
 * npm 11's allow-scripts sandbox intermittently prunes the Cloudflare/wrangler
 * and Vite plugin subtree from the install tree even when the packages are
 * approved in `allowScripts`. This script re-materializes them after every
 * `npm install` so deploys never break on missing modules.
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const REQUIRED = [
  "wrangler",
  "@vitejs/plugin-react",
  "@cloudflare/vite-plugin",
];

const root = path.resolve(__dirname, "..");

// Where a hoisted install can legitimately live: the repo root, or the
// workspace that declares the package. Never resolve through the package
// `exports` map - several of these packages do not export ./package.json,
// which made the previous require.resolve() check report false negatives and
// reinstall them (at "latest", ignoring the lockfile) on every npm install.
const INSTALL_ROOTS = [
  root,
  path.join(root, "apps", "backend"),
  path.join(root, "apps", "frontend"),
];

function missing(name) {
  return !INSTALL_ROOTS.some((base) =>
    fs.existsSync(path.join(base, "node_modules", name, "package.json")),
  );
}

const missingPkgs = REQUIRED.filter(missing);

if (missingPkgs.length === 0) {
  console.log("ensure-deploy-deps: all deploy deps present");
  process.exit(0);
}

console.log(
  `ensure-deploy-deps: installing missing deploy deps: ${missingPkgs.join(", ")}`,
);

// Install all missing packages in a single npm invocation. npm's reify can
// prune packages installed one-by-one, so a single call is more stable.
execSync(
  `npm install ${missingPkgs.join(" ")} --no-save --no-audit --no-fund`,
  { cwd: root, stdio: "inherit" },
);

// Retry once — npm's reify occasionally churns and removes a just-installed pkg.
let stillMissing = REQUIRED.filter(missing);
if (stillMissing.length > 0) {
  console.log(
    `ensure-deploy-deps: retry for: ${stillMissing.join(", ")}`,
  );
  execSync(
    `npm install ${stillMissing.join(" ")} --no-save --no-audit --no-fund`,
    { cwd: root, stdio: "inherit" },
  );
}

stillMissing = REQUIRED.filter(missing);
if (stillMissing.length > 0) {
  console.error(
    `ensure-deploy-deps: FAILED to install: ${stillMissing.join(", ")}`,
  );
  process.exit(1);
}

console.log("ensure-deploy-deps: done");
