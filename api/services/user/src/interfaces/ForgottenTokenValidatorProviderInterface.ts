import { User } from '../entities/User';

export abstract class ForgottenTokenValidatorProviderInterface {
  async checkToken(email: string, token: string): Promise<User> {
    throw new Error('Not implemented');
  }
  isExpired(type: string, tz: Date): boolean {
    throw new Error('Not implemented');
  }
}
