import {
  command,
  CommandInterface,
  CommandOptionType,
} from "@/ilos/common/index.ts";
import { getPerformanceTimer, logger } from "@/lib/logger/index.ts";
import { NotificationService } from "@/pdc/services/export/services/NotificationService.ts";
import { StorageService } from "@/pdc/services/export/services/StorageService.ts";
import { Export, ExportStatus } from "../models/Export.ts";
import { XLSXWriter } from "../models/XLSXWriter.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";
import { FieldServiceInterfaceResolver } from "../services/FieldService.ts";
import { FileCreatorServiceInterfaceResolver } from "../services/FileCreatorService.ts";
import { LogServiceInterfaceResolver } from "../services/LogService.ts";
import { NameServiceInterfaceResolver } from "../services/NameService.ts";

@command()
export class ProcessCommand implements CommandInterface {
  static readonly signature: string = "export:process";
  static readonly description: string = "Process all pending exports";
  static readonly options: CommandOptionType[] = [];

  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected fileCreatorService: FileCreatorServiceInterfaceResolver,
    protected fieldService: FieldServiceInterfaceResolver,
    protected nameService: NameServiceInterfaceResolver,
    protected logger: LogServiceInterfaceResolver,
    protected storage: StorageService,
    protected notify: NotificationService,
  ) {}

  public async call(): Promise<void> {
    await this.storage.init();

    let counter = 50;

    // process pending exports until there are no more
    // picking one at a time to avoid concurrency issues
    // and let multiple workers process the queue in parallel
    let exp = await this.exportRepository.pickPending();
    while (exp && counter > 0) {
      await this.process(exp);
      exp = await this.exportRepository.pickPending();
      counter--;
    }

    logger.info("No more pending exports. Bye!");
  }

  protected async process(exp: Export): Promise<void> {
    const { _id, uuid, target, params } = exp;
    const fields = this.fieldService.byTarget(target);
    const filename = this.nameService.get({ target, uuid }); // TODO add support for territory name

    try {
      const timer = getPerformanceTimer();
      await this.exportRepository.status(_id, ExportStatus.RUNNING);

      // generate the file
      const filepath = await this.fileCreatorService.write(
        params,
        new XLSXWriter(filename, { fields }),
        await this.exportRepository.progress(_id),
      );

      // upload to storage
      await this.exportRepository.status(_id, ExportStatus.UPLOADING);

      const key = await this.storage.upload(filepath);
      const url = await this.storage.getPublicUrl(key);

      await this.exportRepository.status(_id, ExportStatus.UPLOADED);

      // notify the user
      await this.exportRepository.status(_id, ExportStatus.NOTIFY);
      await this.notify.success(exp, url);

      // :tada:
      await this.exportRepository.status(_id, ExportStatus.SUCCESS);
      logger.info(
        `Export finished processing ${uuid} in ${timer.stop()} ms`,
      );
    } catch (e) {
      await this.exportRepository.error(_id, e.message);
      await this.notify.error(exp);
      await this.notify.support(exp);
    }
  }
}
