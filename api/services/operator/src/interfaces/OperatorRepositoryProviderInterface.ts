import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@pdc/provider-repository';

export interface OperatorRepositoryProviderInterface extends ParentRepositoryProviderInterface {}

export abstract class OperatorRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {}
