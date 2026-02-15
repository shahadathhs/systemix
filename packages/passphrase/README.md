# @systemix/passphrase

`@systemix/passphrase` is a secure and memorable passphrase generator for JavaScript and TypeScript. It creates human-readable passphrases by combining randomly selected words, offering a secure alternative to complex random character passwords.

## Features

- **Secure Randomness**: Uses Node.js `crypto` for cryptographically strong word selection.
- **Zero Dependencies**: Purely built with Node.js built-ins.
- **Memorable**: Generates easy-to-remember mult-word phrases.
- **Customizable**: Define word count, separators, capitalization, and custom word lists.
- **Modern**: Built with ES6/TypeScript.

## Installation

```bash
pnpm add @systemix/passphrase
```

or

```bash
npm install @systemix/passphrase
```

## Usage

### Simple Example

```typescript
import { generatePassphrase } from '@systemix/passphrase';

const passphrase = generatePassphrase();
console.log(passphrase); // Example: "apple orange banana kiwi"
```

### Advanced Configuration

```typescript
const passphrase = generatePassphrase({
  wordCount: 5,
  separator: '-',
  capitalize: true,
  wordList: ['system', 'security', 'scale', 'logic', 'flow', 'meta'],
});

console.log(passphrase); // Example: "Security-Meta-Flow-Logic-System"
```

## API Reference

### `generatePassphrase(props?: PassphraseProps): string`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `wordCount` | `number` | `4` | Number of words (1 to 100). |
| `separator` | `string` | `" "` | Separator between words. |
| `capitalize` | `boolean` | `false` | Capitalize each word. |
| `wordList` | `string[]` | *Built-in* | Custom list of words to select from. |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
