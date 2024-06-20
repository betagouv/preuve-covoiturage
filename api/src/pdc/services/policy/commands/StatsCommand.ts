import {
  command,
  CommandInterface,
  CommandOptionType,
  KernelInterfaceResolver,
  ResultType,
} from "@/ilos/common/index.ts";
import {
  handlerConfig,
  signature as handlerSignature,
} from "@/shared/policy/stats.contract.ts";

@command()
export class StatsCommand implements CommandInterface {
  static readonly signature: string = "campaign:stats";
  static readonly options: CommandOptionType[] = [];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<ResultType> {
    await this.kernel.call(handlerSignature, {}, {
      channel: { service: handlerConfig.service },
    });
  }
}
