import { provider } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { CSVWriter } from "../models/CSVWriter.ts";
import { ExportParams } from "../models/ExportParams.ts";
import { CampaignRepository } from "../repositories/CampaignRepository.ts";
import { CarpoolRepository } from "../repositories/CarpoolRepository.ts";
import { ExportProgress } from "../repositories/ExportRepository.ts";

export type FileCreatorServiceInterface = {
  write(
    params: ExportParams,
    fileWriter: CSVWriter,
    progress?: ExportProgress,
  ): Promise<string>;
};

export abstract class FileCreatorServiceInterfaceResolver
  implements FileCreatorServiceInterface {
  protected async configure(
    params: ExportParams,
    fileWriter: CSVWriter,
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async initialize(): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async data(): Promise<void> {
    throw new Error("Not implemented");
  }
  protected async help(): Promise<void> {
    throw new Error("Not implemented");
  }
  public async write(
    params: ExportParams,
    fileWriter: CSVWriter,
    progress?: ExportProgress,
  ): Promise<string> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: FileCreatorServiceInterfaceResolver,
})
export class FileCreatorService {
  protected fileWriter: CSVWriter;
  protected params: ExportParams;
  protected progress: ExportProgress;

  constructor(
    protected carpoolRepository: CarpoolRepository,
    protected campaignRepository: CampaignRepository,
  ) {}

  protected async configure(
    params: ExportParams,
    fileWriter: CSVWriter,
    progress?: ExportProgress,
  ): Promise<void> {
    this.params = params;
    this.fileWriter = fileWriter;
    this.progress = progress || (async () => {});
  }

  protected async initialize(): Promise<void> {
    await this.fileWriter.create();
  }

  protected async data(): Promise<void> {
    // pass campaign data to the file writer to enrich fields
    const campaigns = await this.campaignRepository.list();
    this.fileWriter.addDatasource("campaigns", campaigns);

    // loop through the carpool data and append rows to the file
    await this.carpoolRepository.list(
      this.params,
      this.fileWriter,
      this.progress,
    );
  }

  protected async help(): Promise<void> {
    await this.fileWriter.printHelp();
  }

  public async write(
    params: ExportParams,
    fileWriter: CSVWriter,
    progress?: ExportProgress,
  ): Promise<string> {
    try {
      await this.configure(params, fileWriter, progress);
      await this.initialize();
      await this.data();
      await this.help();
      await this.fileWriter.close();
      await this.fileWriter.compress();

      logger.info(`File written to ${this.fileWriter.path}`);

      return this.fileWriter.path;
    } catch (e) {
      logger.error("FileCreatorService", e.message);
      await this.fileWriter.close();
      throw e;
    }
  }
}
