import { catchErrors, registerGracefulShutdown } from "@/lib/process/index.ts";

export function bootstrap(
  closeHandlers: Array<() => Promise<any>> = [],
) {
  catchErrors(closeHandlers);
  registerGracefulShutdown(closeHandlers);
}
