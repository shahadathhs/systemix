#!/usr/bin/env node
/**
 * Publishes unpublished workspace packages to npm using npm Trusted Publishing
 * (OIDC). Runs inside GitHub Actions with `permissions: id-token: write`;
 * requires npm >= 11.5, which exchanges the workflow's OIDC token for
 * short-lived publish credentials — no NPM_TOKEN secret needed.
 *
 * Used by changesets/action as the `publish` command so versioning (Version
 * Packages PR) stays with changesets while publishing uses the npm CLI.
 *
 * Behavior mirrors `changeset publish`:
 * - skips packages whose version already exists in the registry
 * - publishes with `--access public`
 * - creates and pushes git tags for published packages
 *
 * Supports --dry-run for verifying detection without publishing.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const WORKSPACE_DIRS = ['packages', 'configs'];

function listPublishablePackages() {
  const result = [];
  for (const dir of WORKSPACE_DIRS) {
    const dirPath = join(ROOT, dir);
    if (!existsSync(dirPath)) continue;
    for (const name of readdirSync(dirPath)) {
      const pkgPath = join(dirPath, name);
      const pkgJsonPath = join(pkgPath, 'package.json');
      if (!existsSync(pkgJsonPath)) continue;
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
      if (pkg.private === true || !pkg.name || !pkg.version) continue;
      result.push({ name: pkg.name, version: pkg.version, path: pkgPath });
    }
  }
  return result;
}

function isVersionPublished(name, version) {
  try {
    execSync(`npm view ${JSON.stringify(`${name}@${version}`)} version`, {
      stdio: 'pipe',
    });
    return true;
  } catch {
    // npm exits non-zero when the version does not exist
    return false;
  }
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function main() {
  const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
  const [major, minor] = npmVersion.split('.').map(Number);
  if (major < 11 || (major === 11 && minor < 5)) {
    console.error(
      `npm >= 11.5.0 is required for Trusted Publishing (found ${npmVersion}).`,
    );
    process.exit(1);
  }

  const packages = listPublishablePackages();
  const toPublish = packages.filter(
    (pkg) => !isVersionPublished(pkg.name, pkg.version),
  );
  const alreadyPublished = packages.length - toPublish.length;

  console.log(
    `${toPublish.length} package(s) to publish, ${alreadyPublished} already published.`,
  );
  for (const pkg of toPublish) {
    console.log(`  ${pkg.name}@${pkg.version}`);
  }

  if (toPublish.length === 0) {
    console.log('Nothing to publish.');
    return;
  }

  if (DRY_RUN) {
    console.log('Dry run — skipping publish.');
    return;
  }

  const publishedTags = [];
  for (const pkg of toPublish) {
    console.log(`Publishing ${pkg.name}@${pkg.version}...`);
    run(`npm publish --access public`, pkg.path);
    publishedTags.push(`${pkg.name}@${pkg.version}`);
  }

  for (const tag of publishedTags) {
    run(`git tag ${JSON.stringify(tag)}`, ROOT);
  }
  if (publishedTags.length > 0) {
    run('git push origin --tags', ROOT);
    console.log(`Pushed ${publishedTags.length} git tag(s).`);
  }
}

main();
