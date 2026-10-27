/**
 * Tests for generatePassphrase() – default and custom word lists.
 */
import { createRunner } from '@systemix/runner';
import {
  calculatePassphraseEntropy,
  defaultWordList,
  generatePassphrase,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const custom = generatePassphrase({
    wordCount: 2,
    wordList: ['a', 'b'],
    separator: '-',
  });
  assert(
    ['a-a', 'a-b', 'b-a', 'b-b'].includes(custom),
    'custom wordList works',
  );

  assert(defaultWordList.length === 7776, 'default list is the EFF large list');
  assert(
    new Set(defaultWordList).size === defaultWordList.length,
    'default list has no duplicate words',
  );
  assert(
    defaultWordList.every((w) => /^[a-z]+(-[a-z]+)*$/.test(w)),
    'default list words are lowercase letters (hyphens allowed)',
  );
  assert(
    calculatePassphraseEntropy(4, defaultWordList.length) > 51,
    'default 4-word passphrase has more than 51 bits of entropy',
  );

  const words = new Set();
  let allFromList = true;
  for (let i = 0; i < 200; i++) {
    for (const w of generatePassphrase({ wordCount: 4 }).split(' ')) {
      if (!defaultWordList.includes(w)) allFromList = false;
      words.add(w);
    }
  }
  assert(allFromList, 'generated words all come from the default list');
  assert(words.size > 300, 'default generation draws from the full list');
});
