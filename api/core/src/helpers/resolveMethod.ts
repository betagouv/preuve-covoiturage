import { MethodNotFoundException } from '../Exceptions/MethodNotFoundException';

const regexp = new RegExp('^([a-z]*)@?([\.0-9]*|latest):([a-z]*)$');
export function resolveMethodFromString(method: string): { service: string, method: string, version?: string } {
  try {
    const [_expr, s, v, m] = regexp.exec(method);
    if (typeof s !== 'string' || typeof m !== 'string' || s.length === 0 || m.length === 0) {
      throw new Error();
    }
    return {
      service: s,
      method: m,
      version: v ? v : 'latest',
    };
  } catch (e) {
    throw new MethodNotFoundException(`Invalid method string (${method})`);
  }
}
export function resolveMethodFromObject(method: { service: string, method: string, version?: string }): string {
  if (
      typeof method.service !== 'string' ||
      typeof method.method !== 'string' ||
      method.service.length === 0 ||
      method.method.length === 0
    ) {
    throw new MethodNotFoundException(
      `Invalid method object (service:${method.service}, method:${method.method}, version:${method.version})`,
    );
  }
  return `${method.service}@${('version' in method && method.version) ? method.version : 'latest'}:${method.method}`;
}
