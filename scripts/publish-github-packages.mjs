#!/usr/bin/env node
/**
 * Publishes Systemix packages to GitHub Packages with @shahadathhs/systemix-* names.
 * Run after npm publish. Requires NODE_AUTH_TOKEN (GITHUB_TOKEN) and registry config.
 */

import {
  readFileSync,
  writeFileSync,
  cpSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMP_DIR = join(ROOT, '.tmp-gh-publish');

const PACKAGES = [
  { path: 'packages/password', ghName: '@shahadathhs/systemix-password' },
  { path: 'packages/passphrase', ghName: '@shahadathhs/systemix-passphrase' },
  { path: 'configs/eslint', ghName: '@shahadathhs/systemix-eslint' },
  { path: 'configs/typescript', ghName: '@shahadathhs/systemix-typescript' },
];

/**
 * Copies files matching a glob pattern, preserving directory structure.
 * Supports patterns like "*.js", "dist/*.js", "subdir/*.json".
 */
function copyGlob(pkgPath, pattern, tempDir) {
  const srcFull = join(pkgPath, pattern);
  const srcDir = dirname(srcFull);
  const destDir = join(tempDir, dirname(pattern));

  if (!existsSync(srcDir)) return;

  const globPart = pattern.split('/').pop(); // e.g. "*.js" from "dist/*.js"
  const ext = globPart.startsWith('*') ? globPart.replace('*.', '') : null;

  if (!ext) return;

  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    if (name.endsWith(ext)) {
      cpSync(join(srcDir, name), join(destDir, name));
    }
  }
}

function publishPackage({ path, ghName }) {
  const pkgPath = join(ROOT, path);
  const pkgJsonPath = join(pkgPath, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));

  if (pkg.private) {
    console.log(`⏭️  Skipping ${pkg.name} (private)`);
    return;
  }

  const tempDir = join(TEMP_DIR, ghName.replace('@', '').replace('/', '-'));
  mkdirSync(tempDir, { recursive: true });

  // Copy files based on package.json "files"
  const files = pkg.files || [];
  for (const pattern of files) {
    const src = join(pkgPath, pattern);
    const dest = join(tempDir, pattern);
    if (pattern.includes('*')) {
      copyGlob(pkgPath, pattern, tempDir);
    } else if (existsSync(src)) {
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(src, dest, { recursive: true });
    }
  }

  // Copy README and LICENSE
  for (const f of ['README.md', 'LICENSE']) {
    const src = join(pkgPath, f);
    if (existsSync(src)) cpSync(src, join(tempDir, f));
  }

  // Create package.json for GitHub Packages
  const ghPkg = {
    ...pkg,
    name: ghName,
    publishConfig: { registry: 'https://npm.pkg.github.com' },
  };
  delete ghPkg.private;
  writeFileSync(join(tempDir, 'package.json'), JSON.stringify(ghPkg, null, 2));

  // Publish
  console.log(`📦 Publishing ${ghName}@${pkg.version} to GitHub Packages...`);
  try {
    execSync('npm publish --access public', {
      cwd: tempDir,
      stdio: 'pipe',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_AUTH_TOKEN:
          process.env.NODE_AUTH_TOKEN || process.env.GITHUB_TOKEN,
      },
    });
    console.log(`✅ ${ghName}@${pkg.version} published`);
  } catch (err) {
    const output =
      (err.stdout || '') + (err.stderr || '') + (err.message || '');
    if (
      output.includes('version already exists') ||
      output.includes('You cannot publish over')
    ) {
      console.log(`⏭️  ${ghName}@${pkg.version} already exists, skipping`);
    } else {
      console.error(output);
      throw err;
    }
  }
}

function cleanup() {
  try {
    execSync('rm -rf .tmp-gh-publish', { cwd: ROOT });
  } catch {
    // Ignore cleanup errors
  }
}

// Run
try {
  for (const pkg of PACKAGES) {
    try {
      publishPackage(pkg);
    } catch (err) {
      console.error(`❌ Failed:`, err.message);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  cleanup();
}

if (process.exitCode !== 1) {
  console.log('\n✅ GitHub Packages publish complete');
}
