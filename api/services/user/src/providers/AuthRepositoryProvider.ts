import { provider, ConfigInterfaceResolver, UnauthorizedException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  AuthRepositoryProviderInterface,
  AuthRepositoryProviderInterfaceResolver,
} from '../interfaces/AuthRepositoryProviderInterface';

import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto/dist';

@provider({
  identifier: AuthRepositoryProviderInterfaceResolver,
})
export class AuthRepositoryProvider implements AuthRepositoryProviderInterface {
  public readonly table = 'auth.users';

  constructor(
    protected connection: PostgresConnection,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {}

  protected async getPasswordById(_id: string): Promise<string> {
    return 'get_password_from_db_or_throw';
  }

  protected async getPasswordByEmail(email: string): Promise<string> {
    return 'get_password_from_db_or_throw';
  }

  protected async getTokenByEmail(email: string): Promise<{ token: string; expires_at: Date }> {
    return {
      token: 'get_token_from_db_or_throw',
      expires_at: new Date(),
    };
  }

  async challengePasswordByEmail(email: string, password: string): Promise<boolean> {
    // TODO: why clean up forgotten props ?
    // return this.userRepository.patch(user._id, {
    //   forgotten_at: null,
    //   forgotten_token: null,
    // });
    return true;
  }

  async createTokenByEmail(email: string, type: string, status?: string): Promise<string> {
    const token = await this.cryptoProvider.cryptToken(this.cryptoProvider.generateToken());

    const patch: {
      token: string;
      token_expires_at: Date;
      status?: string;
    } = {
      token,
      token_expires_at: Date.now() + this.config.get('...'),
    };

    if (status) {
      patch.status = status; // demander au front
    }

    // TODO: patch
    // await this.userRepository.patch(_id, patch);

    return token;
  }

  async clearTokenByEmail(email: string, status?: string): Promise<boolean> {
    // {
    //   status: ,
    //   forgotten_at: undefined,
    //   forgotten_token: undefined,
    // });
    return true;
  }

  async challengePasswordById(_id: string, password: string): Promise<boolean> {
    const hashedPassword = await this.getPasswordById(_id);
    return await this.cryptoProvider.comparePassword(password, hashedPassword);
  }

  async updatePasswordById(_id: string, password: string): Promise<boolean> {
    const newHashPassword = await this.cryptoProvider.cryptPassword(password);
    // patch or fail

    // {
    //   password,
    //   forgotten_token: undefined,
    //   forgotten_at: undefined,
    //   status: 'active',
    // }
    return true;
  }
  async updateEmailById(id: string, email: string): Promise<string> {
    // create token
    // update user
    return '';
  }

  async challengeTokenByEmail(email: string, clearToken: string): Promise<boolean> {
    const { token, expires_at } = await this.getTokenByEmail(email);
    if (
      Date.now() - expires_at.getTime() <= 0 ||
      (await this.cryptoProvider.compareForgottenToken(clearToken, token))
    ) {
      // clear token
      return false;
    }
    return true;
  }
}
