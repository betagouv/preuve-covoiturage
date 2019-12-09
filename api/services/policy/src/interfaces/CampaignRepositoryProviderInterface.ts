export interface CampaignRepositoryProviderInterface {
  find(id: number): Promise<any>;
  create(params: any): Promise<any>;
  patch(id: number, patch: any): Promise<any>;
  patchWhereTerritory(id: number, territoryId: number, patch: any): Promise<any>;

  findOneWhereTerritory(id: number, territoryId: number): Promise<any>;
  findWhere(search: { territory_id?: number | null; status?: string }): Promise<any[]>;

  deleteDraftOrTemplate(id: number, territoryId: number): Promise<void>;
  findApplicableCampaigns(territories: number[], date: Date): Promise<any[]>;
}

export abstract class CampaignRepositoryProviderInterfaceResolver implements CampaignRepositoryProviderInterface {
  async find(id: number): Promise<any> {
    throw new Error();
  }
  async create(params: any): Promise<any> {
    throw new Error();
  }
  async patch(id: number, patch: any): Promise<any> {
    throw new Error();
  }
  async patchWhereTerritory(id: number, territoryId: number, patch: any): Promise<any> {
    throw new Error();
  }
  async findOneWhereTerritory(id: number, territoryId: number): Promise<any> {
    throw new Error();
  }

  async findWhere(search: { territory_id?: number | null; status?: string }): Promise<any[]> {
    throw new Error();
  }

  async deleteDraftOrTemplate(id: number, territoryId: number): Promise<void> {
    throw new Error();
  }

  async findApplicableCampaigns(territories: number[], d: Date): Promise<any[]> {
    throw new Error();
  }
}
