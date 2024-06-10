import {
  command,
  CommandInterface,
  CommandOptionType,
} from "@/ilos/common/index.ts";
import { Export, ExportStatus } from "../models/Export.ts";
import { XLSXWriter } from "../models/XLSXWriter.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";
import { BuildServiceInterfaceResolver } from "../services/BuildService.ts";
import { FieldServiceInterfaceResolver } from "../services/FieldService.ts";
import { LogServiceInterfaceResolver } from "../services/LogService.ts";
import { NameServiceInterfaceResolver } from "../services/NameService.ts";

export type Options = {};

@command()
export class ProcessCommand implements CommandInterface {
  static readonly signature: string = "export:process";
  static readonly description: string = "Process all pending exports";
  static readonly options: CommandOptionType[] = [];

  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected buildService: BuildServiceInterfaceResolver,
    protected fieldService: FieldServiceInterfaceResolver,
    protected nameService: NameServiceInterfaceResolver,
    protected logger: LogServiceInterfaceResolver,
  ) {}

  public async call(options: Options): Promise<void> {
    let killswitch = 50;

    // process pending exports until there are no more
    // picking one at a time to avoid concurrency issues
    // and let multiple workers process the queue in parallel
    let exp = await this.exportRepository.pickPending();
    while (exp && killswitch > 0) {
      await this.process(exp);
      exp = await this.exportRepository.pickPending();
      killswitch--;
    }

    console.info("No more pending exports. Bye!");
  }

  protected async process(exp: Export): Promise<void> {
    const { _id, uuid, target, params } = exp;
    const fields = this.fieldService.byTarget(target);
    const filename = this.nameService.get({ target, uuid }); // TODO add support for territory name

    try {
      console.time(`Export finished processing ${uuid}`);

      await this.exportRepository.status(_id, ExportStatus.RUNNING);
      await this.buildService.write(
        params,
        new XLSXWriter(filename, { fields }),
        await this.exportRepository.progress(_id),
      );
      await this.exportRepository.status(_id, ExportStatus.SUCCESS);

      console.timeEnd(`Export finished processing ${uuid}`);
    } catch (e) {
      await this.exportRepository.error(_id, e.message);
    }
  }
}
