import crypto from 'crypto';
import expressMung from 'express-mung';

/**
 * Hash the payload
 */
const hashPayload = (payload) => {
  const hash = crypto.createHash('SHA256');
  hash.update(JSON.stringify(payload) || '');
  return hash.digest('hex');
};

export const signResponseMiddleware = expressMung.json((body, req, res) => {
  res.header('X-Response-SHA256', hashPayload(body));
});
