# @systemix/passphrase

[![npm](https://img.shields.io/npm/v/@systemix/passphrase.svg)](https://www.npmjs.com/package/@systemix/passphrase)

`@systemix/passphrase` is a secure and memorable passphrase generator for JavaScript and TypeScript. It creates human-readable passphrases by combining randomly selected words, offering a secure alternative to complex random character passwords.

## Features

- **Secure Randomness**: Uses Node.js `crypto` with bias-free selection.
- **Formatting Options**: Supports TitleCase, UPPERCASE, and standard capitalization.
- **Extra Security**: Inject random numbers into words and use randomized separators.
- **Entropy Calculation**: Built-in utility to calculate technical passphrase entropy.
- **Zero Dependencies**: Purely built with Node.js built-ins.
- **Memorable**: Generates easy-to-remember multi-word phrases.

## Installation

```bash
pnpm add @systemix/passphrase
```

or

```bash
npm install @systemix/passphrase
```

From GitHub Packages (add to `.npmrc`: `@shahadathhs:registry=https://npm.pkg.github.com`):

```bash
pnpm add @shahadathhs/passphrase
```

Use `@shahadathhs/passphrase` in imports.

## Usage

### Simple Example

```typescript
import { generatePassphrase } from '@systemix/passphrase';

const passphrase = generatePassphrase();
console.log(passphrase); // Example: "abacus handbag zodiac gravel"
```

### Advanced Formatting

```typescript
const passphrase = generatePassphrase({
  wordCount: 4,
  useTitleCase: true,
  includeNumber: true,
  randomSeparator: true,
});

console.log(passphrase); // Example: "7Security.Meta_Flow9/Logic"
```

### Entropy Calculation

```typescript
import { calculatePassphraseEntropy } from '@systemix/passphrase';

const entropy = calculatePassphraseEntropy(4, 7776); // wordCount, listSize
console.log(`Entropy: ${entropy} bits`);
```

## API Reference

### `generatePassphrase(props?: PassphraseProps): string`

| Property          | Type       | Default     | Description                        |
| :---------------- | :--------- | :---------- | :--------------------------------- |
| `wordCount`       | `number`   | `4`         | Number of words (1 to 100).        |
| `separator`       | `string`   | `" "`       | Separator between words.           |
| `wordList`        | `string[]` | _EFF large_ | Custom list of words.              |
| `useTitleCase`    | `boolean`  | `false`     | Convert words to TitleCase.        |
| `useUpperCase`    | `boolean`  | `false`     | Convert words to UPPERCASE.        |
| `includeNumber`   | `boolean`  | `false`     | Inject a random digit into words.  |
| `randomSeparator` | `boolean`  | `false`     | Randomize separator between words. |

### `calculatePassphraseEntropy(wordCount: number, wordListSize: number): number`

Calculates the theoretical entropy of a passphrase (H = L \* log2(N)).

### `defaultWordList`

The [EFF large wordlist](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases): 7,776 words, about 12.9 bits per word, so the default 4-word passphrase carries about 51.7 bits. Custom lists are your responsibility: entropy is `wordCount * log2(list size)`, so small lists weaken the result quickly.

## License

MIT © [shahadathhs](https://github.com/shahadathhs)

The built-in word list is the EFF large wordlist, © Electronic Frontier Foundation, licensed [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/).
