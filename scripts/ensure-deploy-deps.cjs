#!/usr/bin/env node
/**
 * npm 11's allow-scripts sandbox intermittently prunes the Cloudflare/wrangler
 * and Vite plugin subtree from the install tree even when the packages are
 * approved in `allowScripts`. This script re-materializes them after every
 * `npm install` so deploys never break on missing modules.
 */
const { execSync } = require("node:child_process");
const path = require("node:path");

const REQUIRED = [
  "wrangler",
  "@vitejs/plugin-react",
  "@cloudflare/vite-plugin",
];

const root = path.resolve(__dirname, "..");

function missing(name) {
  try {
    require.resolve(`${name}/package.json`, { paths: [root] });
    return false;
  } catch {
    return true;
  }
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
