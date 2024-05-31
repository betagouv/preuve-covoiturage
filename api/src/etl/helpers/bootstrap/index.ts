import { catchErrors } from './catchErrors.js';
import { INameToValueMap, interceptConsole } from './interceptConsole.js';
import { registerGracefulShutdown } from './registerGracefulShutdown.js';

export function bootstrap(customConsole: INameToValueMap = console, closeHandlers: Array<() => Promise<any>> = []) {
  interceptConsole(customConsole);
  catchErrors(closeHandlers);
  registerGracefulShutdown(closeHandlers);
}
