export interface GenerateIdOptions {
  /**
   * Length of the generated ID.
   * @default 21
   */
  size?: number;

  /**
   * Alphabet to draw characters from. Must have unique characters.
   * @default urlAlphabet
   */
  alphabet?: string;
}
