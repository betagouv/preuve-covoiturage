export interface TerritoryOperatorRepositoryProviderInterface {
  findByOperator(id: number): Promise<number[]>;
  findByTerritory(id: number): Promise<number[]>;
  updateByOperator(id: number, list: number[]): Promise<void>;
}

export abstract class TerritoryOperatorRepositoryProviderInterfaceResolver
  implements TerritoryOperatorRepositoryProviderInterface {
  async findByOperator(id: number): Promise<number[]> {
    throw new Error();
  }
  async findByTerritory(id: number): Promise<number[]> {
    throw new Error();
  }
  async updateByOperator(id: number, list: number[]): Promise<void> {
    throw new Error();
  }
}
