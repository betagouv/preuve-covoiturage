import { UserForgottenInterface } from '../shared/user/common/interfaces/UserForgottenInterface';

export abstract class ForgottenTokenValidatorProviderInterface {
  async checkToken(email: string, token: string): Promise<UserForgottenInterface> {
    throw new Error('Not implemented');
  }
  isExpired(type: string, tz: Date): boolean {
    throw new Error('Not implemented');
  }
}
