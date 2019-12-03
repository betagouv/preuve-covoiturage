import { StatInterface } from './StatInterface';

export interface StatCacheRepositoryProviderInterface {
  getGeneralOrBuild(fn: Function): Promise<StatInterface[]>;
  getTerritoryOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]>;
  getOperatorOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]>;
}

export abstract class StatCacheRepositoryProviderInterfaceResolver implements StatCacheRepositoryProviderInterface {
  async getGeneralOrBuild(fn: Function): Promise<StatInterface[]> {
    throw new Error();
  }

  async getTerritoryOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]> {
    throw new Error();
  }

  async getOperatorOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]> {
    throw new Error();
  }
}
