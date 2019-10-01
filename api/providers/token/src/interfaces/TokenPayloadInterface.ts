/**
 * a: application_id
 * o: operator_id
 * p: permissions
 * v: version of the token payload
 */
export interface TokenPayloadInterface {
  a: string;
  o: string;
  p?: string[];
  v?: number;
  iat?: number;
  issuer?: string;
  audience?: string;
  subject?: string;
}
