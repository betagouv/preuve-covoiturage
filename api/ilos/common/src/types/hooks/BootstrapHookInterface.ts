export interface BootstrapHookInterface {
  /**
   * Bootstrap is called after constructor
   * @returns {(Promise<void> | void)}
   * @memberof BootstrapHookInterface
   */
  bootstrap(): Promise<void>;
}
