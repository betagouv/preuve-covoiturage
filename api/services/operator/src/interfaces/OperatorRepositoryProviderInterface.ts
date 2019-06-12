import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@ilos/provider-repository';

export interface OperatorRepositoryProviderInterface extends ParentRepositoryProviderInterface {}

export abstract class OperatorRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {}
