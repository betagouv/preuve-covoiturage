export interface TerritoryPgRepositoryInterface {
  quickFind(params: { _id: number }): Promise<{ uuid: string; name: string }>;
  findIdentityTerritories(params: { identity_id: number }): Promise<{ _id: number; name: string }[]>;
}

export abstract class TerritoryPgRepositoryInterfaceResolver implements TerritoryPgRepositoryInterface {
  async quickFind(params: { _id: number }): Promise<{ uuid: string; name: string }> {
    throw new Error('Method not implemented.');
  }
  async findIdentityTerritories(params: { identity_id: number }): Promise<{ _id: number; name: string }[]> {
    throw new Error('Method not implemented.');
  }
}
