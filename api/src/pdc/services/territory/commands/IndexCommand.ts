import { command, CommandInterface, KernelInterfaceResolver, ResultType } from "@/ilos/common/index.ts";
import { taggedLogger } from "@/lib/logger/tagged.ts";
import { signature as indexGeo } from "@/pdc/services/territory/contracts/indexAllGeo.contract.ts";

const log = taggedLogger("[territory]", { maxLength: 512 });

@command({
  signature: "territory:index",
})
export class IndexCommand implements CommandInterface {
  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<ResultType> {
    const handlers = [indexGeo];
    for (const h of handlers) {
      log.info("indexing", { signature: h });
      await this.kernel.call(h, {}, { channel: { service: "territory" } });
    }
  }
}
