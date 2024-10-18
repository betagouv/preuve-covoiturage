import { command, CommandInterface, KernelInterfaceResolver, ResultType } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { signature as indexGeo } from "@/shared/territory/indexAllGeo.contract.ts";

@command({
  signature: "territory:index",
})
export class IndexCommand implements CommandInterface {
  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<ResultType> {
    const handlers = [indexGeo];
    for (const h of handlers) {
      logger.info(`[territory:index] index ${h} in Meilisearch`);
      await this.kernel.call(h, {}, { channel: { service: "territory" } });
    }
  }
}
