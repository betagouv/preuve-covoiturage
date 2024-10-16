import { provider } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { CSVWriter } from "../models/CSVWriter.ts";
import { ExportParams } from "../models/ExportParams.ts";
import { CampaignRepository } from "../repositories/CampaignRepository.ts";
import { CarpoolRepository } from "../repositories/CarpoolRepository.ts";

export abstract class OpenDataFileCreatorServiceInterfaceResolver {
  protected async configure(params: ExportParams, fileWriter: CSVWriter): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async initialize(): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async data(): Promise<void> {
    throw new Error("Not implemented");
  }
  public async write(params: ExportParams, fileWriter: CSVWriter): Promise<string> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: OpenDataFileCreatorServiceInterfaceResolver,
})
export class OpenDataFileCreatorService {
  protected fileWriter: CSVWriter;
  protected params: ExportParams;

  constructor(
    protected carpoolRepository: CarpoolRepository,
    protected campaignRepository: CampaignRepository,
  ) {}

  protected async configure(params: ExportParams, fileWriter: CSVWriter): Promise<void> {
    this.params = params;
    this.fileWriter = fileWriter;
  }

  protected async initialize(): Promise<void> {
    await this.fileWriter.create();
  }

  protected async data(): Promise<void> {
    // pass campaign data to the file writer to enrich fields
    const campaigns = await this.campaignRepository.list();
    this.fileWriter.addDatasource("campaigns", campaigns);

    // loop through the carpool data and append rows to the file
    await this.carpoolRepository.openDataList(this.params, this.fileWriter);
  }

  public async write(params: ExportParams, fileWriter: CSVWriter): Promise<string> {
    try {
      await this.configure(params, fileWriter);
      await this.initialize();
      await this.data();
      await this.fileWriter.close();
      await this.fileWriter.compress();

      logger.info(`File written to ${this.fileWriter.path}`);

      return this.fileWriter.path;
    } catch (e) {
      logger.error("OpenDataFileCreatorService", e.message);
      await this.fileWriter.close();
      throw e;
    }
  }
}
