import { StatInterface } from "./StatInterface.ts";

export interface StatCacheRepositoryProviderInterface {
  getOrBuild(fn: Function, target: any): Promise<StatInterface[]>;
}

export abstract class StatCacheRepositoryProviderInterfaceResolver
  implements StatCacheRepositoryProviderInterface {
  async getOrBuild(fn: Function, target: any): Promise<StatInterface[]> {
    throw new Error("Not implemented");
  }
}
