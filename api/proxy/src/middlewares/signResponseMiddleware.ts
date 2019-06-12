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

/**
 * Nest response body in a payload and hash it
 */
const signResponse = (body, req, res) => {
  const signed = {
    sha256: hashPayload(body),
    payload: body,
  };

  return signed;
};

export const signResponseMiddleware = expressMung.json(signResponse);
