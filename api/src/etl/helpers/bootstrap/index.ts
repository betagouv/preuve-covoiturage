import { catchErrors } from './catchErrors.ts';
import { INameToValueMap, interceptConsole } from './interceptConsole.ts';
import { registerGracefulShutdown } from './registerGracefulShutdown.ts';

export function bootstrap(customConsole: INameToValueMap = console, closeHandlers: Array<() => Promise<any>> = []) {
  interceptConsole(customConsole);
  catchErrors(closeHandlers);
  registerGracefulShutdown(closeHandlers);
}
