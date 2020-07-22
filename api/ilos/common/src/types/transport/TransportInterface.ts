import { KernelInterface } from '../core/KernelInterface';

export interface TransportInterface<T = any> {
  /**
   * Get Kernel instance
   * @returns {KernelInterface}
   * @memberof TransportInterface
   */
  getKernel(): KernelInterface;

  /**
   * Get Server instance such as httpServer, queue, etc.
   * @returns {T | T[] | void}
   * @memberof TransportInterface
   */
  getInstance(): T | T[] | void;

  /**
   * Start the transport
   * @param {string[]} [opts]
   * @returns {Promise<void>}
   * @memberof TransportInterface
   */
  up(opts?: string[]): Promise<void>;

  /**
   * Stop the transport
   * @returns {Promise<void>}
   * @memberof TransportInterface
   */
  down(): Promise<void>;
}
