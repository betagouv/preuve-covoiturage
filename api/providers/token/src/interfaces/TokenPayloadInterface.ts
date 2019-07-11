export interface TokenPayloadInterface {
  appId: string;
  operatorId: string;
  permissions?: string[];
  iat?: number;
  issuer?: string;
  audience?: string;
  subject?: string;
}
