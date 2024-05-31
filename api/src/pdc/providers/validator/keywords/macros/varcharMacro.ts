import { SanitizeInterface } from '../sanitizeKeyword.ts';

export function varcharMacro(): { type: string; minLength: number; maxLength: number; sanitize: SanitizeInterface } {
  return {
    type: 'string',
    minLength: 1,
    maxLength: 256,
    sanitize: true,
  };
}
