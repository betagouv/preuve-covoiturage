import { CommandInterface, CommandOptionType, command } from '@ilos/common';
import { ExportRepositoryInterfaceResolver, ExportStatus } from '../repositories/ExportRepository';
import { BuildServiceInterfaceResolver } from '../services/BuildService';
import { FieldServiceInterfaceResolver } from '../services/FieldService';
import { NameServiceInterfaceResolver } from '../services/NameService';
import { XLSXWriter } from '../models/XLSXWriter';

export type Options = {};

@command()
export class ProcessCommand implements CommandInterface {
  static readonly signature: string = 'export:process';
  static readonly description: string = 'Process all pending exports';
  static readonly options: CommandOptionType[] = [];

  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected buildService: BuildServiceInterfaceResolver,
    protected fieldService: FieldServiceInterfaceResolver,
    protected nameService: NameServiceInterfaceResolver,
  ) {}

  public async call(options: Options): Promise<void> {
    const exports = await this.exportRepository.findPending();
    for (const e of exports) {
      const { _id, type, params } = e;
      const fields = this.fieldService.byType(type);
      const filename = this.nameService.get({ type }); // TODO add support for territory name

      try {
        await this.exportRepository.status(_id, ExportStatus.RUNNING);
        await this.buildService.write(
          params,
          new XLSXWriter(filename, { fields }),
          await this.exportRepository.progress(_id),
        );
        await this.exportRepository.status(_id, ExportStatus.SUCCESS);
      } catch (e) {
        await this.exportRepository.error(_id, e.message);
      }
    }
  }
}
