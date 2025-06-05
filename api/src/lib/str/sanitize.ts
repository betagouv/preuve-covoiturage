/**
 * Sanitize a string a remove non UTF-8 chars
 */
export function sanitize(str: string, maxLength = 4096): string {
  return str
    .replace(/\u20AC/g, "e") // € -> e
    .normalize("NFD")
    .replace(/[\ \.\/]/g, "_")
    .replace(/[\u0300-\u036f]|[^\w-_\ ]/g, "")
    .replace("_-_", "-")
    .toLowerCase()
    .substring(0, maxLength);
}
