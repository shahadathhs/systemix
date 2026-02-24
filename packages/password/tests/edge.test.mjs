/**
 * Tests for generatePassword() – edge lengths and character guarantees.
 */
import { createRunner } from '@systemix/test';
import { generatePassword } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
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
});
