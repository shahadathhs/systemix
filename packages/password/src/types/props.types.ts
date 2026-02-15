import { GeneratePasswordPropsEnum } from '../enum/props.enum';

export type GeneratePasswordFunctionProps = {
  [key in GeneratePasswordPropsEnum]?: key extends
    | GeneratePasswordPropsEnum.LENGTH
    | GeneratePasswordPropsEnum.COUNT
    | GeneratePasswordPropsEnum.MIN_NUMBERS
    | GeneratePasswordPropsEnum.MIN_UPPERCASE
    | GeneratePasswordPropsEnum.MIN_LOWERCASE
    | GeneratePasswordPropsEnum.MIN_SYMBOLS
    ? number
    : key extends
          | GeneratePasswordPropsEnum.EXCLUDE
          | GeneratePasswordPropsEnum.CUSTOM_LOWERCASE
          | GeneratePasswordPropsEnum.CUSTOM_UPPERCASE
          | GeneratePasswordPropsEnum.CUSTOM_NUMBERS
          | GeneratePasswordPropsEnum.CUSTOM_SYMBOLS
      ? string
      : key extends
            | GeneratePasswordPropsEnum.USE_NUMBERS
            | GeneratePasswordPropsEnum.USE_UPPERCASE
            | GeneratePasswordPropsEnum.USE_LOWERCASE
            | GeneratePasswordPropsEnum.USE_SYMBOLS
            | GeneratePasswordPropsEnum.EXCLUDE_SIMILAR_CHARACTERS
        ? boolean
        : never;
};
