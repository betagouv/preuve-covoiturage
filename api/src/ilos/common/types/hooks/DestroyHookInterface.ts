import { ServiceContainerInterface } from "../core/ServiceContainerInterface.ts";

export interface DestroyHookInterface {
  /**
   * Destroy hook, called before destroy if provided
   * @returns {(Promise<void> | void)}
   * @memberof DestroyHookInterface
   */
  destroy(container?: ServiceContainerInterface): Promise<void> | void;
}
