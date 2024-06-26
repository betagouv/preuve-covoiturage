import { ServiceContainerInterface } from "../core/ServiceContainerInterface.ts";

export interface InitHookInterface {
  /**
   * Init hook, called after register if provided
   * @returns {(Promise<void> | void)}
   * @memberof InitHookInterface
   */
  init(container?: ServiceContainerInterface): Promise<void> | void;
}
