import { getRandomBytes } from '../shared/crypto';
import {
  bytesToAlphanumeric,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
} from './encode';
import { GenerateTokenFunctionProps } from './types';
import { generateTokenPropValidation } from './validation';

export function generateToken(
  props: GenerateTokenFunctionProps = {},
): string | string[] {
  const { byteLength = 32, charset = 'hex', count = 1 } = props;

  generateTokenPropValidation(props);

  const generateSingleToken = (): string => {
    const bytes = getRandomBytes(byteLength);
    switch (charset) {
      case 'hex':
        return bytesToHex(bytes);
      case 'base64':
        return bytesToBase64(bytes);
      case 'base64url':
        return bytesToBase64Url(bytes);
      case 'alphanumeric':
        return bytesToAlphanumeric(bytes);
      default:
        return bytesToHex(bytes);
    }
  };

  if (count === 1) return generateSingleToken();
  return Array.from({ length: count }, () => generateSingleToken());
}
