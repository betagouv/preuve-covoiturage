import { provider } from '@ilos/common';
import { ExportParams } from '../models/ExportParams';
import { XLSXWriter } from '../models/XLSXWriter';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { CarpoolRepository } from '../repositories/CarpoolRepository';

export type BuildServiceInterface = {
  run(params: ExportParams, fileWriter: XLSXWriter): Promise<void>;
};

export abstract class BuildServiceInterfaceResolver implements BuildServiceInterface {
  protected async configure(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    throw new Error('Not implemented');
  }
  protected async initialize(): Promise<void> {
    throw new Error('Not implemented');
  }
  protected async data(): Promise<void> {
    throw new Error('Not implemented');
  }
  protected async help(): Promise<void> {
    throw new Error('Not implemented');
  }
  protected async wrap(): Promise<void> {
    throw new Error('Not implemented');
  }
  public async run(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: BuildServiceInterfaceResolver,
})
export class BuildService {
  protected fileWriter: XLSXWriter;
  protected params: ExportParams;

  constructor(
    protected carpoolRepository: CarpoolRepository,
    protected campaignRepository: CampaignRepository,
  ) {}

  protected async configure(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    this.params = params;
    this.fileWriter = fileWriter;
  }

  protected async initialize(): Promise<void> {
    await this.fileWriter.create();
  }

  protected async data(): Promise<void> {
    // TODO load campaigns to access their configurations
    // TODO list carpools
    // TODO enrich rows with computed fields based on campaigns and carpools
    const campaigns = await this.campaignRepository.list();

    // add boosters as data source to file writer
    this.fileWriter.addDatasource('campaigns', campaigns);

    await this.carpoolRepository.list(this.params, this.fileWriter);
  }

  protected async help(): Promise<void> {
    await this.fileWriter.printHelp();
  }

  protected async wrap(): Promise<void> {
    await this.fileWriter.close();
    await this.fileWriter.compress();
  }

  public async run(params: ExportParams, fileWriter: XLSXWriter): Promise<void> {
    try {
      await this.configure(params, fileWriter);
      await this.initialize();
      await this.data();
      await this.help();
    } catch (e) {
      console.error(e.message);
    } finally {
      await this.wrap();
      console.info(`File written to ${this.fileWriter.workbookPath}`);
      // TODO cleanup on failure
    }
  }
}
