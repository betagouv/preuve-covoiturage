import {
  ConfigInterfaceResolver,
  ContextType,
  handler,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";

@handler({
  service: "string",
  method: "log",
})
export class LogAction extends Action {
  constructor(private config: ConfigInterfaceResolver) {
    super();
  }

  protected async handle(
    params: ParamsType,
    context: ContextType,
  ): Promise<ResultType> {
    if (
      context && !!context.channel && !!context.channel.transport &&
      context.channel.transport === "queue"
    ) {
      Deno.writeFileSync(
        this.config.get("log.path"),
        new TextEncoder().encode(JSON.stringify(params)),
      );
    }

    return params;
  }
}
