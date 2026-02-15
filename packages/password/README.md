# @systemix/password

`@systemix/password` is a customizable, lightweight, and cryptographically secure password generator for JavaScript and TypeScript. Built for maximum security, it relies entirely on Node.js built-in `crypto` modules, ensuring zero external dependencies and a low supply-chain risk profile.

## Features

- **Secure**: Uses `crypto.getRandomValues()` with bias-free distribution for maximum security.
- **Character Guarantees**: Ensure a minimum number of uppercase, lowercase, numbers, or symbols.
- **Custom Charsets**: Pass your own character sets for generation.
- **Entropy Calculation**: Built-in utility to calculate technical password entropy.
- **Zero Dependencies**: Purely built with Node.js built-ins.
- **TypeScript Ready**: Full type definitions included.

## Installation

```bash
pnpm add @systemix/password
```

or

```bash
npm install @systemix/password
```

## Usage

### Simple Example

```typescript
import { generatePassword } from '@systemix/password';

const password = generatePassword({
  length: 16,
  useNumbers: true,
  useSymbols: true,
});

console.log(password); // Example: "Z#kM@4p*J!h2X&b7"
```

### Guarantees and Character Sets

```typescript
const securePass = generatePassword({
  length: 12,
  minNumbers: 2,
  minSymbols: 2,
  useUppercase: true,
  customSymbols: '!@#$%^&*', // Use specific symbols only
});
```

### Entropy Calculation

```typescript
import { calculatePasswordEntropy } from '@systemix/password';

const entropy = calculatePasswordEntropy(12, 62); // length, charset size
console.log(`Entropy: ${entropy} bits`);
```

## API Reference

### `generatePassword(props?: PasswordProps): string | string[]`

| Property                   | Type      | Default   | Description                           |
| :------------------------- | :-------- | :-------- | :------------------------------------ |
| `length`                   | `number`  | `12`      | Password length (1 to 100).           |
| `useNumbers`               | `boolean` | `true`    | Include 0-9.                          |
| `useUppercase`             | `boolean` | `true`    | Include A-Z.                          |
| `useLowercase`             | `boolean` | `true`    | Include a-z.                          |
| `useSymbols`               | `boolean` | `false`   | Include special characters.           |
| `minNumbers`               | `number`  | `0`       | Minimum numbers to include.           |
| `minUppercase`             | `number`  | `0`       | Minimum uppercase letters to include. |
| `minLowercase`             | `number`  | `0`       | Minimum lowercase letters to include. |
| `minSymbols`               | `number`  | `0`       | Minimum symbols to include.           |
| `customNumbers`            | `string`  | _0-9_     | Custom number set.                    |
| `customUppercase`          | `string`  | _A-Z_     | Custom uppercase set.                 |
| `customLowercase`          | `string`  | _a-z_     | Custom lowercase set.                 |
| `customSymbols`            | `string`  | _Special_ | Custom symbol set.                    |
| `excludeSimilarCharacters` | `boolean` | `false`   | Exclude visually similar characters.  |
| `exclude`                  | `string`  | `""`      | Specific characters to exclude.       |
| `count`                    | `number`  | `1`       | Number of passwords to generate.      |

### `calculatePasswordEntropy(length: number, charsetSize: number): number`

Calculates the theoretical entropy of a password (H = L \* log2(N)).

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
