import { command, CommandInterface, HandlerConfigType, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { handlerListIdentifier } from "@/ilos/core/constants.ts";
import { logger } from "@/lib/logger/index.ts";

@command({
  signature: "list",
  description: "List all actions",
})
export class ListCommand implements CommandInterface {
  constructor(
    protected kernel: KernelInterfaceResolver,
  ) {}

  public async call(): Promise<void> {
    const container = this.kernel.getContainer().root;
    const actions = await container.getAllAsync<HandlerConfigType>(handlerListIdentifier);
    for (const action of actions) {
      logger.info(`${action.service} - ${action.method}`);
    }
  }
}
