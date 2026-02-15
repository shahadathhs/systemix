import { GeneratePasswordPropsEnum } from '../enum/props.enum';

export type GeneratePasswordFunctionProps = {
  [key in GeneratePasswordPropsEnum]?: key extends
    | GeneratePasswordPropsEnum.LENGTH
    | GeneratePasswordPropsEnum.COUNT
    ? number
    : key extends GeneratePasswordPropsEnum.EXCLUDE
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
