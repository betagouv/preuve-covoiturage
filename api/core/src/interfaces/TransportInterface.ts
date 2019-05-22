import { KernelInterface } from './KernelInterface';

export interface TransportInterface {

  /**
   * Get Kernel instance
   * @returns {KernelInterface}
   * @memberof TransportInterface
   */
  getKernel():KernelInterface;

  /**
   * Start the transport
   * @param {string[]} [opts]
   * @returns {Promise<void>}
   * @memberof TransportInterface
   */
  up(opts?: string[]):Promise<void>;

  /**
   * Stop the transport
   * @returns {Promise<void>}
   * @memberof TransportInterface
   */
  down():Promise<void>;
}
