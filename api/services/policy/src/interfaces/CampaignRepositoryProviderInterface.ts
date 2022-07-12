import { CampaignInterface } from './CampaignInterface';

export interface CampaignRepositoryProviderInterface {
  find(id: number, territoryId?: number): Promise<CampaignInterface>;
  delete(id: number): Promise<void>;
  create(params: CampaignInterface): Promise<CampaignInterface>;
  patch(id: number, patch: Partial<CampaignInterface>): Promise<CampaignInterface>;
  findWhere(search: {
    territory_id?: number | number[] | null;
    status?: string;
    datetime?: Date;
  }): Promise<CampaignInterface[]>;
}

export abstract class CampaignRepositoryProviderInterfaceResolver implements CampaignRepositoryProviderInterface {
  async find(id: number, territoryId?: number): Promise<CampaignInterface> {
    throw new Error();
  }
  async create(params: CampaignInterface): Promise<CampaignInterface> {
    throw new Error();
  }

  async delete(id: number): Promise<void> {
    throw new Error();
  }

  async patch(id: number, patch: Partial<CampaignInterface>): Promise<CampaignInterface> {
    throw new Error();
  }

  async findWhere(search: {
    territory_id?: number | null | number[];
    status?: string;
    datetime?: Date;
  }): Promise<CampaignInterface[]> {
    throw new Error();
  }
}
