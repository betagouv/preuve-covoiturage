import { RepositoryInterface, RepositoryInterfaceResolver } from '@ilos/common';

export interface CampaignRepositoryProviderInterface extends RepositoryInterface {
  patchWhereTerritory(id: string, territoryId: string, patch: any): Promise<any>;

  findOneWhereTerritory(id: string, territoryId: string): Promise<any>;
  findWhereTerritory(territoryId: string): Promise<any[]>;
  findTemplates(): Promise<any[]>;
}

export abstract class CampaignRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  async patchWhereTerritory(id: string, territoryId: string, patch: any): Promise<any> {
    throw new Error();
  }
  async findOneWhereTerritory(id: string, territoryId: string): Promise<any> {
    throw new Error();
  }

  async findWhereTerritory(territoryId: string): Promise<any[]> {
    throw new Error();
  }

  async findTemplates(): Promise<any[]> {
    throw new Error();
  }
}
