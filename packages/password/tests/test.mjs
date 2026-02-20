#!/usr/bin/env node
/**
 * Edge-case tests for @systemix/password.
 * Run: pnpm test (builds first, then runs tests)
 */

import { generatePassword, calculatePasswordEntropy } from '../dist/index.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    failed++;
    console.error(`  ✗ ${message} (expected throw)`);
  } catch {
    passed++;
    console.log(`  ✓ ${message}`);
  }
}

console.log('\n📦 @systemix/password\n');

// Basic
const p1 = generatePassword({ length: 12 });
assert(typeof p1 === 'string', 'returns string');
assert(p1.length === 12, 'respects length');
// Default charset includes a-z, A-Z, 0-9 — verify over multiple runs (random can omit a type in one run)
const samples = Array.from({ length: 10 }, () =>
  generatePassword({ length: 12 }),
);
const hasAllTypes = samples.some(
  (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p),
);
assert(hasAllTypes, 'includes lowercase, uppercase, numbers by default');

// Edge lengths
assert(generatePassword({ length: 1 }).length === 1, 'length 1 works');
assert(generatePassword({ length: 100 }).length === 100, 'length 100 works');

// Character guarantees
const p2 = generatePassword({
  length: 12,
  minNumbers: 3,
  minUppercase: 2,
  minLowercase: 2,
  minSymbols: 2,
  useSymbols: true,
});
const numCount = (p2.match(/\d/g) || []).length;
const upperCount = (p2.match(/[A-Z]/g) || []).length;
const lowerCount = (p2.match(/[a-z]/g) || []).length;
const symCount = (p2.match(/[@#$%^&*()_+=<>?/|]/g) || []).length;
assert(numCount >= 3, `minNumbers: ${numCount} >= 3`);
assert(upperCount >= 2, `minUppercase: ${upperCount} >= 2`);
assert(lowerCount >= 2, `minLowercase: ${lowerCount} >= 2`);
assert(symCount >= 2, `minSymbols: ${symCount} >= 2`);

// Entropy
assert(calculatePasswordEntropy(12, 62) > 0, 'entropy > 0');
assert(calculatePasswordEntropy(0, 62) === 0, 'entropy 0 for length 0');

// Errors
assertThrows(
  () =>
    generatePassword({
      length: 5,
      minNumbers: 10,
      minUppercase: 5,
      useNumbers: true,
      useUppercase: true,
    }),
  'throws when min requirements exceed length',
);
assertThrows(
  () =>
    generatePassword({
      length: 12,
      useNumbers: false,
      useUppercase: false,
      useLowercase: false,
      useSymbols: false,
    }),
  'throws when all charsets disabled',
);

// Count
const arr = generatePassword({ length: 8, count: 5 });
assert(Array.isArray(arr) && arr.length === 5, 'count returns array');
assert(
  arr.every((p) => typeof p === 'string' && p.length === 8),
  'each has correct length',
);

console.log(`\n✅ ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
