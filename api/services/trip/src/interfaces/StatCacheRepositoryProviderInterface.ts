import { StatInterface } from './StatInterface';

export interface TargetInterface {
  public?: boolean;
  operator_id?: number;
  territory_id?: number[];
}

export interface StatCacheRepositoryProviderInterface {
  getOrBuild(fn: Function, target: TargetInterface): Promise<StatInterface[]>;
  getGeneralOrBuild(fn: Function): Promise<StatInterface[]>;
  getTerritoryOrBuild(territory_id: number[], fn: Function): Promise<StatInterface[]>;
  getOperatorOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]>;
}

export abstract class StatCacheRepositoryProviderInterfaceResolver implements StatCacheRepositoryProviderInterface {
  async getOrBuild(fn: Function, target: TargetInterface): Promise<StatInterface[]> {
    throw new Error('Not implemented');
  }

  async getGeneralOrBuild(fn: Function): Promise<StatInterface[]> {
    throw new Error('Not implemented');
  }

  async getTerritoryOrBuild(territory_id: number[], fn: Function): Promise<StatInterface[]> {
    throw new Error('Not implemented');
  }

  async getOperatorOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]> {
    throw new Error('Not implemented');
  }
}
