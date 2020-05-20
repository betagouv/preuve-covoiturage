import { IdentityIdentifiersInterface } from '../shared/certificate/common/interfaces/IdentityIdentifiersInterface';
import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';

export type IdentityParams = IdentityIdentifiersInterface;

// TODO replace any output by proper interface
export interface IdentityRepositoryProviderInterface {
  find(params: IdentityParams): Promise<IdentityInterface>;
}

// TODO replace any output by proper interface
export abstract class IdentityRepositoryProviderInterfaceResolver implements IdentityRepositoryProviderInterface {
  async find(params: IdentityParams): Promise<IdentityInterface> {
    throw new Error('Method not implemented.');
  }
}
