import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver, ResultType } from '/ilos/common/index.ts';
import { signature as indexGeo } from '/shared/territory/indexAllGeo.contract.ts';

@command()
export class IndexCommand implements CommandInterface {
  static readonly signature: string = 'territory:index';
  static readonly options: CommandOptionType[] = [];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<ResultType> {
    const handlers = [indexGeo];
    for (const h of handlers) {
      console.info(`[territory:index] index ${h} in Meilisearch`);
      await this.kernel.call(h, {}, { channel: { service: 'territory' } });
    }
  }
}
