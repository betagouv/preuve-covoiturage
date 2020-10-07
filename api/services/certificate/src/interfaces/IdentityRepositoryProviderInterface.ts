import { IdentityIdentifiersInterface } from '../shared/certificate/common/interfaces/IdentityIdentifiersInterface';

export type IdentityParams = IdentityIdentifiersInterface;

// TODO replace any output by proper interface
export interface IdentityRepositoryProviderInterface {
  find(params: IdentityParams): Promise<{ uuid: string }>;
}

// TODO replace any output by proper interface
export abstract class IdentityRepositoryProviderInterfaceResolver implements IdentityRepositoryProviderInterface {
  async find(params: IdentityParams): Promise<{ uuid: string }> {
    throw new Error('Method not implemented.');
  }
}
