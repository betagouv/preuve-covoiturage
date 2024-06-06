import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver, ResultType } from '@/ilos/common/index.ts';
import { signature as distrib } from '@/shared/observatory/distribution/insertMonthlyDistribution.contract.ts';
import { signature as flux } from '@/shared/observatory/flux/insertMonthlyFlux.contract.ts';
import { signature as occupation } from '@/shared/observatory/occupation/insertMonthlyOccupation.contract.ts';

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
