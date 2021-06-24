export function escapeRegExp(input: string): string {
  return input.replace(/[\.\*\+\?\^\$\{\}\(\)\|\[\]\\\/\:]/g, '\\$&');
}
