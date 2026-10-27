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
 * - creates a GitHub Release per published package, with the matching
 *   CHANGELOG.md section as the notes (changesets/action only does this for
 *   `changeset publish` output, so a custom publish command must do it itself)
 *
 * Supports --dry-run for verifying detection without publishing.
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

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

/**
 * Returns the body of the `## <version>` section of a changesets CHANGELOG.md
 * (everything up to the next `## ` heading), or null if there is none.
 */
export function extractReleaseNotes(changelog, version) {
  const lines = changelog.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) return null;
  let end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  if (end === -1) end = lines.length;
  return (
    lines
      .slice(start + 1, end)
      .join('\n')
      .trim() || null
  );
}

/**
 * Creates a GitHub Release for an already-pushed tag. Skips if one exists.
 * Never throws: the packages are already published, so a failure here is a
 * warning, not a failed release.
 */
export function createGithubRelease(pkg, { cwd = ROOT } = {}) {
  const tag = `${pkg.name}@${pkg.version}`;
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      `No GH_TOKEN/GITHUB_TOKEN: skipping GitHub release for ${tag}.`,
    );
    return 'skipped';
  }
  const env = { ...process.env, GH_TOKEN: token };

  try {
    execFileSync('gh', ['release', 'view', tag], { cwd, env, stdio: 'pipe' });
    console.log(`GitHub release for ${tag} already exists.`);
    return 'exists';
  } catch {
    // not found: create it below
  }

  const changelogPath = join(pkg.path, 'CHANGELOG.md');
  const changelog = existsSync(changelogPath)
    ? readFileSync(changelogPath, 'utf8')
    : '';
  const notes = extractReleaseNotes(changelog, pkg.version) ?? `Release ${tag}`;

  try {
    execFileSync(
      'gh',
      [
        'release',
        'create',
        tag,
        '--title',
        tag,
        '--notes-file',
        '-',
        '--verify-tag',
      ],
      { cwd, env, input: notes, stdio: ['pipe', 'inherit', 'inherit'] },
    );
    console.log(`Created GitHub release ${tag}.`);
    return 'created';
  } catch (error) {
    console.warn(
      `Could not create GitHub release for ${tag}: ${error.message}`,
    );
    return 'failed';
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

  const published = [];
  for (const pkg of toPublish) {
    console.log(`Publishing ${pkg.name}@${pkg.version}...`);
    run(`npm publish --access public`, pkg.path);
    published.push(pkg);
  }
  const publishedTags = published.map((pkg) => `${pkg.name}@${pkg.version}`);

  for (const tag of publishedTags) {
    run(`git tag ${JSON.stringify(tag)}`, ROOT);
  }
  if (publishedTags.length > 0) {
    run('git push origin --tags', ROOT);
    console.log(`Pushed ${publishedTags.length} git tag(s).`);
    // Tags must exist on the remote first (gh release create --verify-tag).
    for (const pkg of published) createGithubRelease(pkg);
  }
}

// Only run when executed directly, so the helpers can be imported in tests.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
