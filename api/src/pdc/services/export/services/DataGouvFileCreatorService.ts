import { provider } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { CSVWriter } from "../models/CSVWriter.ts";
import { ExportParams } from "../models/ExportParams.ts";
import { CampaignRepository } from "../repositories/CampaignRepository.ts";
import { CarpoolRepository } from "../repositories/CarpoolRepository.ts";
import { CarpoolDataGouvListType } from "../repositories/queries/CarpoolDataGouvQuery.ts";

export abstract class DataGouvFileCreatorServiceInterfaceResolver {
  protected async configure(params: ExportParams, fileWriter: CSVWriter<CarpoolDataGouvListType>): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async initialize(): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async data(): Promise<void> {
    throw new Error("Not implemented");
  }
  public async write(params: ExportParams, fileWriter: CSVWriter<CarpoolDataGouvListType>): Promise<string> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: DataGouvFileCreatorServiceInterfaceResolver,
})
export class DataGouvFileCreatorService {
  protected fileWriter: CSVWriter<CarpoolDataGouvListType>;
  protected params: ExportParams;

  constructor(
    protected carpoolRepository: CarpoolRepository,
    protected campaignRepository: CampaignRepository,
  ) {}

  protected async configure(params: ExportParams, fileWriter: CSVWriter<CarpoolDataGouvListType>): Promise<void> {
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
    await this.carpoolRepository.dataGouvList(this.params, this.fileWriter);
  }

  public async write(params: ExportParams, fileWriter: CSVWriter<CarpoolDataGouvListType>): Promise<string> {
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
