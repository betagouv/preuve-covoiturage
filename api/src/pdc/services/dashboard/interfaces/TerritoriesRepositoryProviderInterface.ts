import type { ResultInterface as TerritoriesResultInterface } from "../contracts/territories/territories.contract.ts";

export type { TerritoriesResultInterface };

export interface TerritoriesRepositoryInterface {
  getTerritories(): Promise<TerritoriesResultInterface>;
}

export abstract class TerritoriesRepositoryInterfaceResolver implements TerritoriesRepositoryInterface {
  async getTerritories(): Promise<TerritoriesResultInterface> {
    throw new Error();
  }
}
