import { GeneratePassphrasePropsEnum } from '../enum/props.enum';

export type GeneratePassphraseFunctionProps = {
  [key in GeneratePassphrasePropsEnum]?: key extends GeneratePassphrasePropsEnum.WORD_COUNT
    ? number
    : key extends GeneratePassphrasePropsEnum.SEPARATOR
      ? string
      : key extends GeneratePassphrasePropsEnum.WORD_LIST
        ? string[]
        : key extends GeneratePassphrasePropsEnum.CAPITALIZE
          ? boolean
          : never;
};
