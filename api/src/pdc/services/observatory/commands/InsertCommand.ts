import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver, ResultType } from '@ilos/common';
import { signature as distrib } from '@shared/observatory/distribution/insertMonthlyDistribution.contract';
import { signature as flux } from '@shared/observatory/flux/insertMonthlyFlux.contract';
import { signature as occupation } from '@shared/observatory/occupation/insertMonthlyOccupation.contract';

@command()
export class InsertCommand implements CommandInterface {
  static readonly signature: string = 'observatory:insert';
  static readonly options: CommandOptionType[] = [];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<ResultType> {
    const handlers = [occupation, distrib, flux];
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    for (const h of handlers) {
      console.info(`[observatory:insert] insert ${h} at ${month}/${year}`);
      await this.kernel.call(h, { year, month }, { channel: { service: 'observatory' } });
    }
  }
}
