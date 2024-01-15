import { provider } from '@ilos/common';
import { ExportParams } from '../models/ExportParams';
import { XLSXWriter } from '../models/XLSXWriter';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { CarpoolRepository } from '../repositories/CarpoolRepository';

export type BuildServiceInterface = {
  run(params: ExportParams, fileWriter: XLSXWriter): Promise<void>;
};

export abstract class BuildServiceInterfaceResolver implements BuildServiceInterface {
  public async run(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: BuildServiceInterfaceResolver,
})
export class BuildService {
  constructor(
    protected carpoolRepository: CarpoolRepository,
    protected campaignRepository: CampaignRepository,
  ) {}

  public async run(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    // TODO load campaigns to access their configurations
    // TODO list carpools
    // TODO enrich rows with computed fields based on campaigns and carpools
    const campaigns = await this.campaignRepository.list();

    // add boosters as data source to file writer
    fileWriter.addDatasource('campaigns', campaigns);

    await this.carpoolRepository.list(params, fileWriter);
  }
}
