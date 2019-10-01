import { provider, ConfigInterfaceResolver, UnauthorizedException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';

@provider({
  identifier: ForgottenTokenValidatorProviderInterface,
})
export class ForgottenTokenValidatorProvider implements ForgottenTokenValidatorProviderInterface {
  constructor(
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {}

  async checkToken(email: string, token: string): Promise<User> {
    const user = await this.userRepository.findUserByParams({ email });
    const isValid = await this.cryptoProvider.compareForgottenToken(token, user.forgotten_token || '');

    if (!isValid || !user.forgotten_at) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  isExpired(type: string, tz: Date) {
    return (Date.now() - tz.getTime()) / 1000 > this.config.get(`user.tokenExpiration.${type}`);
  }
}
