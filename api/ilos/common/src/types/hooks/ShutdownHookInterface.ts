export interface ShutdownHookInterface {
  /**
   * Shutdown is called after constructor
   * @returns {(Promise<void> | void)}
   * @memberof ShutdownHookInterface
   */
  shutdown(): Promise<void>;
}
