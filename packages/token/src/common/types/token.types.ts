import type { TokenPropsEnum } from '../enums/token-props.enum';
import type { Charset } from '../enums/charset.enum';

export type GenerateTokenFunctionProps = {
  [key in TokenPropsEnum]?: key extends
    | TokenPropsEnum.BYTE_LENGTH
    | TokenPropsEnum.COUNT
    ? number
    : key extends TokenPropsEnum.CHARSET
      ? Charset
      : never;
};
