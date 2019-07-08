import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

export interface OperatorRepositoryProviderInterface extends ParentRepositoryInterface {}

export abstract class OperatorRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {}
