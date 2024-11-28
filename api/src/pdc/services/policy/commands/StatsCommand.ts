import { command, CommandInterface, KernelInterfaceResolver, ResultType } from "@/ilos/common/index.ts";
import { handlerConfig, signature as handlerSignature } from "../contracts/stats.contract.ts";

@command({
  signature: "campaign:stats",
})
export class StatsCommand implements CommandInterface {
  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<ResultType> {
    await this.kernel.call(handlerSignature, {}, {
      channel: { service: handlerConfig.service },
    });
  }
}
