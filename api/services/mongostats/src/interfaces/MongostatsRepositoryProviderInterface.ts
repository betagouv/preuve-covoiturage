import { RepositoryInterfaceResolver, RepositoryInterface } from '@ilos/common';

export interface MongostatsRepositoryProviderInterface extends RepositoryInterface {
  list(): Promise<any[]>;
}

export abstract class MongostatsRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {}
