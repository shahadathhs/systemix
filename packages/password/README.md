# @systemix/password

`@systemix/password` is a customizable, lightweight, and cryptographically secure password generator for JavaScript and TypeScript. Built for maximum security, it relies entirely on Node.js built-in `crypto` modules, ensuring zero external dependencies and a low supply-chain risk profile.

## Features

- **Secure**: Uses `crypto.getRandomValues()` for cryptographically strong random data.
- **Zero Dependencies**: Purely built with Node.js built-ins.
- **TypeScript Ready**: Full type definitions included.
- **Customizable**: Control length, character sets (numbers, symbols, uppercase, lowercase), and exclude similar characters.
- **Validation**: Built-in strict validation for generation options.

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
  useUppercase: true,
  useLowercase: true,
});

console.log(password); // Example: "Z#kM@4p*J!h2X&b7"
```

### Advanced Configuration

```typescript
const password = generatePassword({
  length: 12,
  useNumbers: true,
  excludeSimilarCharacters: true, // Excludes: i, l, 1, L, o, 0, O
  exclude: 'abc', // Manually exclude specific characters
});
```

## API Reference

### `generatePassword(props?: PasswordProps): string`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `length` | `number` | `8` | Password length (1 to 50). |
| `useNumbers` | `boolean` | `true` | Include 0-9. |
| `useUppercase` | `boolean` | `true` | Include A-Z. |
| `useLowercase` | `boolean` | `true` | Include a-z. |
| `useSymbols` | `boolean` | `false` | Include special characters. |
| `excludeSimilarCharacters` | `boolean` | `false` | Exclude visually similar characters. |
| `exclude` | `string` | `""` | Specific characters to exclude. |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
