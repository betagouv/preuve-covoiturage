import { StatInterface } from './StatInterface';

export interface TargetInterface {
  operator_id?: number;
  territory_id?: number;
}

export interface StatCacheRepositoryProviderInterface {
  getOrBuild(fn: Function, target: TargetInterface): Promise<StatInterface[]>;
}

export abstract class StatCacheRepositoryProviderInterfaceResolver implements StatCacheRepositoryProviderInterface {
  async getOrBuild(fn: Function, target: TargetInterface): Promise<StatInterface[]> {
    throw new Error('Not implemented');
  }
}
