import { provider } from "@/ilos/common/index.ts";
import { ExportParams } from "../models/ExportParams.ts";
import { XLSXWriter } from "../models/XLSXWriter.ts";
import { CampaignRepository } from "../repositories/CampaignRepository.ts";
import { CarpoolRepository } from "../repositories/CarpoolRepository.ts";
import { ExportProgress } from "../repositories/ExportRepository.ts";

export type BuildServiceInterface = {
  write(
    params: ExportParams,
    fileWriter: XLSXWriter,
    progress?: ExportProgress,
  ): Promise<void>;
};

export abstract class BuildServiceInterfaceResolver
  implements BuildServiceInterface {
  protected async configure(
    params: ExportParams,
    fileWriter: XLSXWriter,
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
  protected async wrap(): Promise<void> {
    throw new Error("Not implemented");
  }
  public async write(
    params: ExportParams,
    fileWriter: XLSXWriter,
    progress?: ExportProgress,
  ): Promise<void> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: BuildServiceInterfaceResolver,
})
export class BuildService {
  protected fileWriter: XLSXWriter;
  protected params: ExportParams;
  protected progress: ExportProgress;

  constructor(
    protected carpoolRepository: CarpoolRepository,
    protected campaignRepository: CampaignRepository,
  ) {}

  protected async configure(
    params: ExportParams,
    fileWriter: XLSXWriter,
    progress?: ExportProgress,
  ): Promise<void> {
    this.params = params;
    this.fileWriter = fileWriter;
    this.progress = progress;
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
    this.fileWriter.addDatasource("campaigns", campaigns);

    await this.carpoolRepository.list(
      this.params,
      this.fileWriter,
      this.progress,
    );
  }

  protected async help(): Promise<void> {
    await this.fileWriter.printHelp();
  }

  protected async wrap(): Promise<void> {
    await this.fileWriter.close();
    await this.fileWriter.compress();
  }

  public async write(
    params: ExportParams,
    fileWriter: XLSXWriter,
    progress?: ExportProgress,
  ): Promise<void> {
    try {
      await this.configure(params, fileWriter, progress);
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
