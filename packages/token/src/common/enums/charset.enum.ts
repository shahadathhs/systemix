export const CHARSETS = ['hex', 'base64', 'base64url', 'alphanumeric'] as const;
export type Charset = (typeof CHARSETS)[number];
