import { CacheValidatorParams, CacheValidatorResponse, HttpVerb } from './types';

const validators = [
  // Skip caching when the request contains a Cache-Control header with 'no-cache' value
  async function noCacheHeader({ req }: CacheValidatorParams): Promise<Partial<CacheValidatorResponse>> {
    if (!req.header('Cache-Control').includes('no-cache')) return {};
    return {
      isValid: false,
      warnings: new Set([new Error('Disabled by no-cache header')]),
      headers: new Map([
        ['Cache-Control', 'no-cache'],
        ['X-Route-Cache-Disabled', 'no-cache'],
      ]),
    };
  },

  // filter out unauthorized methods (only GET is allowed)
  async function methodValidator({
    globalConfig,
    req,
  }: CacheValidatorParams): Promise<Partial<CacheValidatorResponse>> {
    if (globalConfig.authorizedMethods.includes(req.method as HttpVerb)) return {};
    return {
      isValid: false,
      errors: new Set([new Error(`Method ${req.method} not allowed`)]),
      headers: new Map([['X-Route-Cache-Error', `Method ${req.method} not allowed`]]),
    };
  },

  // add your validator here...
];

export async function validate(params: CacheValidatorParams): Promise<CacheValidatorResponse> {
  let isValid = true;
  let errors: Set<Error> = new Set();
  let warnings: Set<Error> = new Set();
  let headers: Map<string, string> = new Map();

  for (const validator of validators) {
    const result = await validator(params);
    isValid = isValid && (result.isValid ?? true);
    if (result.errors) errors = new Set([...errors, ...result.errors]);
    if (result.warnings) warnings = new Set([...warnings, ...result.warnings]);
    if (result.headers) headers = new Map([...headers, ...result.headers]);
  }

  return { isValid, errors, warnings, headers };
}
