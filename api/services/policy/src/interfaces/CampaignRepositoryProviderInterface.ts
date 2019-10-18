import { RepositoryInterface, RepositoryInterfaceResolver, NewableType } from '@ilos/common';
import { TripInterface } from '@pdc/provider-schema/dist';

export interface CampaignRepositoryProviderInterface {
  find(id: string): Promise<any>;
  create(params: any): Promise<any>;
  patch(id: string, patch: any): Promise<any>;
  patchWhereTerritory(id: string, territoryId: string, patch: any): Promise<any>;

  findOneWhereTerritory(id: string, territoryId: string): Promise<any>;
  findWhereTerritory(territoryId: string): Promise<any[]>;
  findTemplates(territoryId: string | null): Promise<any[]>;
  deleteDraftOrTemplate(id: string, territoryId: string): Promise<void>;
  findApplicableCampaigns(data: { territories: string[]; date: Date }): Promise<any[]>;
}

export abstract class CampaignRepositoryProviderInterfaceResolver implements CampaignRepositoryProviderInterface {
  async find(id: string): Promise<any> {
    throw new Error();
  }
  async create(params: any): Promise<any> {
    throw new Error();
  }
  async patch(id: string, patch: any): Promise<any> {
    throw new Error();
  }
  async patchWhereTerritory(id: string, territoryId: string, patch: any): Promise<any> {
    throw new Error();
  }
  async findOneWhereTerritory(id: string, territoryId: string): Promise<any> {
    throw new Error();
  }

  async findWhereTerritory(territoryId: string): Promise<any[]> {
    throw new Error();
  }

  async findTemplates(territoryId: string | null): Promise<any[]> {
    throw new Error();
  }

  async deleteDraftOrTemplate(id: string, territoryId: string): Promise<void> {
    throw new Error();
  }

  async findApplicableCampaigns(data: { territories: string[]; date: Date }): Promise<any[]> {
    throw new Error();
  }
}
