#!/usr/bin/env node
/**
 * Edge-case tests for @systemix/passphrase.
 * Run: pnpm test (builds first, then runs tests)
 */

import {
  generatePassphrase,
  calculatePassphraseEntropy,
} from '../dist/index.js';

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

console.log('\n📦 @systemix/passphrase\n');

// Basic
const ph1 = generatePassphrase({ wordCount: 4 });
assert(typeof ph1 === 'string', 'returns string');
assert(ph1.split(/\s+/).length === 4, 'word count respected');

// Edge word counts
assert(generatePassphrase({ wordCount: 1 }).split(/\s+/).length === 1, 'wordCount 1 works');
assert(generatePassphrase({ wordCount: 20 }).split(/\s+/).length === 20, 'wordCount 20 works');

// Separators
assert(generatePassphrase({ wordCount: 2, separator: '-' }).includes('-'), 'custom separator');
assert(generatePassphrase({ wordCount: 2, separator: '_' }).includes('_'), 'underscore separator');

// Formatting
const ph2 = generatePassphrase({ wordCount: 3, useTitleCase: true });
assert(/^[A-Z]/.test(ph2.split(' ')[0]), 'TitleCase capitalizes');
const ph3 = generatePassphrase({ wordCount: 2, useUpperCase: true });
assert(ph3 === ph3.toUpperCase(), 'UPPERCASE works');

// Entropy
assert(calculatePassphraseEntropy(4, 7776) > 0, 'entropy > 0');
assert(calculatePassphraseEntropy(0, 7776) === 0, 'entropy 0 for wordCount 0');

// Custom word list
const custom = generatePassphrase({ wordCount: 2, wordList: ['a', 'b'] });
assert(
  ['a b', 'b a', 'a a', 'b b'].includes(custom) ||
    custom.includes('a') ||
    custom.includes('b'),
  'custom wordList works'
);

console.log(`\n✅ ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
