import { GenerateTokenPropsEnum } from './props.enum';

export type TokenCharset = 'hex' | 'base64' | 'base64url' | 'alphanumeric';

export type GenerateTokenFunctionProps = {
  [key in GenerateTokenPropsEnum]?: key extends
    | GenerateTokenPropsEnum.BYTE_LENGTH
    | GenerateTokenPropsEnum.COUNT
    ? number
    : key extends GenerateTokenPropsEnum.CHARSET
      ? TokenCharset
      : never;
};
