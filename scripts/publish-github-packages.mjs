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

const PACKAGES = [
  { path: 'packages/password', ghName: '@shahadathhs/systemix-password' },
  { path: 'packages/passphrase', ghName: '@shahadathhs/systemix-passphrase' },
  { path: 'configs/eslint', ghName: '@shahadathhs/systemix-eslint' },
  { path: 'configs/typescript', ghName: '@shahadathhs/systemix-typescript' },
];

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = join(src, e.name);
    const d = join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else cpSync(s, d);
  }
}

function copyGlob(dir, pattern, dest) {
  if (!existsSync(dir)) return;
  const ext = pattern.replace('*.', '');
  for (const name of readdirSync(dir)) {
    if (name.endsWith(ext)) cpSync(join(dir, name), join(dest, name));
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

  const tempDir = join(
    ROOT,
    '.tmp-gh-publish',
    ghName.replace('@', '').replace('/', '-'),
  );
  mkdirSync(tempDir, { recursive: true });

  // Copy files based on package.json "files"
  const files = pkg.files || [];
  for (const pattern of files) {
    const src = join(pkgPath, pattern);
    const dest = join(tempDir, pattern);
    if (pattern.includes('*')) {
      const baseDir = dirname(src);
      copyGlob(baseDir, pattern, tempDir);
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

// Run
for (const pkg of PACKAGES) {
  try {
    publishPackage(pkg);
  } catch (err) {
    console.error(`❌ Failed:`, err.message);
    process.exit(1);
  }
}

// Cleanup
execSync('rm -rf .tmp-gh-publish', { cwd: ROOT });
console.log('\n✅ GitHub Packages publish complete');
