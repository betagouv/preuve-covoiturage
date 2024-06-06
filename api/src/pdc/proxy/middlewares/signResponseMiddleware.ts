import { expressMung, createHash } from "@/deps.ts";

/**
 * Hash the payload
 */
const hashPayload = (payload): string => {
  const hash = createHash('SHA256');
  hash.update(JSON.stringify(payload) || '');
  return hash.digest('hex');
};

export const signResponseMiddleware = expressMung.json((body, req, res): void => {
  res.header('X-Response-SHA256', hashPayload(body));
});
