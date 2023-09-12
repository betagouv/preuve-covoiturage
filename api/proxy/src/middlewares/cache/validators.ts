import { CacheValidatorParams, CacheValidatorResponse, HttpVerb } from './types';

export async function validate({
  globalConfig,
  routeConfig,
  req,
  res,
}: CacheValidatorParams): Promise<CacheValidatorResponse> {
  // validate the request method
  if (!globalConfig.authorizedMethods.includes(req.method as HttpVerb)) {
    return {
      isValid: false,
      errors: [new Error(`Method ${req.method} not allowed`)],
    };
  }

  return { isValid: true, errors: [] };
}
