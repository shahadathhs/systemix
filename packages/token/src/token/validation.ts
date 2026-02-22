import { CHARSETS, TokenPropsEnum } from '../common/enums';
import type { GenerateTokenFunctionProps } from '../common/types';
import {
  byteLengthError,
  charsetError,
  countError,
  unwantedPropsError,
} from '../common/errors';

const VALID_PROPS = Object.values(TokenPropsEnum) as string[];

export function generateTokenPropValidation(
  props: GenerateTokenFunctionProps,
): void {
  const propsValue = Object.keys(props);
  const unwantedProps = propsValue.filter(
    (prop) => !VALID_PROPS.includes(prop),
  );

  if (unwantedProps.length > 0) {
    throw new Error(unwantedPropsError(unwantedProps));
  }

  const { byteLength, charset, count } = props;

  if (byteLength !== undefined) {
    if (typeof byteLength !== 'number' || byteLength < 1) {
      throw new Error(byteLengthError.invalidByteLength);
    }
    if (byteLength > 1024) {
      throw new Error(byteLengthError.byteLengthTooLarge);
    }
  }

  if (charset !== undefined) {
    if (typeof charset !== 'string' || !CHARSETS.includes(charset)) {
      throw new Error(charsetError);
    }
  }

  if (count !== undefined) {
    if (typeof count !== 'number' || count < 1) {
      throw new Error(countError.invalidCount);
    }
    if (count > 10) {
      throw new Error(countError.countTooLarge);
    }
  }
}
