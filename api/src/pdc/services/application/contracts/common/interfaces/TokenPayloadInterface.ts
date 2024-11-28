/**
 * a: application_id
 * o: operator_id
 * s: service
 * p: permissions
 * v: version of the token payload
 */
export interface TokenPayloadInterface {
  a: string;
  o: number;
  s: string;
  p?: string[];
  v?: number;
  iat?: number;
  issuer?: string;
  audience?: string;
  subject?: string;
}
