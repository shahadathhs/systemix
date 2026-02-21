import { getRandomBytes, getRandomInt } from '../shared/crypto';
import { GenerateTokenFunctionProps } from './types';
import { generateTokenPropValidation } from './validation';
import {
  ALPHANUMERIC_CHARSET,
  bytesToAlphanumeric,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
} from './encode';

export function generateToken(
  props: GenerateTokenFunctionProps = {},
): string | string[] {
  const { byteLength = 32, charset = 'hex', count = 1 } = props;

  generateTokenPropValidation(props);

  const generateSingleToken = (): string => {
    switch (charset) {
      case 'hex':
        return bytesToHex(getRandomBytes(byteLength));
      case 'base64':
        return bytesToBase64(getRandomBytes(byteLength));
      case 'base64url':
        return bytesToBase64Url(getRandomBytes(byteLength));
      case 'alphanumeric':
        return Array.from(
          { length: byteLength },
          () => ALPHANUMERIC_CHARSET[getRandomInt(ALPHANUMERIC_CHARSET.length)],
        ).join('');
      default:
        return bytesToHex(getRandomBytes(byteLength));
    }
  };

  if (count === 1) return generateSingleToken();
  return Array.from({ length: count }, () => generateSingleToken());
}
