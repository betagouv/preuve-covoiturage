import { CampaignInterface } from './CampaignInterface';

export interface CampaignRepositoryProviderInterface {
  find(id: number): Promise<CampaignInterface>;
  create(params: CampaignInterface): Promise<CampaignInterface>;
  patch(id: number, patch: Partial<CampaignInterface>): Promise<CampaignInterface>;
  patchWhereTerritory(id: number, territoryId: number, patch: Partial<CampaignInterface>): Promise<CampaignInterface>;

  findOneWhereTerritory(id: number, territoryId: number): Promise<CampaignInterface>;
  findWhere(search: { territory_id?: number | null; status?: string }): Promise<CampaignInterface[]>;

  deleteDraftOrTemplate(id: number, territoryId: number): Promise<void>;
  findApplicableCampaigns(territories: number[], date: Date): Promise<CampaignInterface[]>;
}

export abstract class CampaignRepositoryProviderInterfaceResolver implements CampaignRepositoryProviderInterface {
  async find(id: number): Promise<CampaignInterface> {
    throw new Error();
  }
  async create(params: CampaignInterface): Promise<CampaignInterface> {
    throw new Error();
  }
  async patch(id: number, patch: Partial<CampaignInterface>): Promise<CampaignInterface> {
    throw new Error();
  }
  async patchWhereTerritory(
    id: number,
    territoryId: number,
    patch: Partial<CampaignInterface>,
  ): Promise<CampaignInterface> {
    throw new Error();
  }
  async findOneWhereTerritory(id: number, territoryId: number): Promise<CampaignInterface> {
    throw new Error();
  }

  async findWhere(search: { territory_id?: number | null; status?: string }): Promise<CampaignInterface[]> {
    throw new Error();
  }

  async deleteDraftOrTemplate(id: number, territoryId: number): Promise<void> {
    throw new Error();
  }

  async findApplicableCampaigns(territories: number[], d: Date): Promise<CampaignInterface[]> {
    throw new Error();
  }
}
