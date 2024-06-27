import { catchErrors, registerGracefulShutdown } from "@/lib/process/index.ts";
import { INameToValueMap, interceptConsole } from "./interceptConsole.ts";

export function bootstrap(
  customConsole: INameToValueMap = console,
  closeHandlers: Array<() => Promise<any>> = [],
) {
  interceptConsole(customConsole);
  catchErrors(closeHandlers);
  registerGracefulShutdown(closeHandlers);
}
