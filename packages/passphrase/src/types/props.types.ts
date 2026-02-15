import { GeneratePassphrasePropsEnum } from '../enum/props.enum';

export type GeneratePassphraseFunctionProps = {
  [key in GeneratePassphrasePropsEnum]?: key extends GeneratePassphrasePropsEnum.WORD_COUNT
    ? number
    : key extends GeneratePassphrasePropsEnum.SEPARATOR
      ? string
      : key extends GeneratePassphrasePropsEnum.WORD_LIST
        ? string[]
        : key extends
              | GeneratePassphrasePropsEnum.CAPITALIZE
              | GeneratePassphrasePropsEnum.USE_TITLE_CASE
              | GeneratePassphrasePropsEnum.USE_UPPER_CASE
              | GeneratePassphrasePropsEnum.INCLUDE_NUMBER
              | GeneratePassphrasePropsEnum.RANDOM_SEPARATOR
          ? boolean
          : never;
};
