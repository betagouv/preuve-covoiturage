import { KernelInterface } from './KernelInterface';

export interface TransportInterface {
  /**
   * Get Kernel instance
   */
  getKernel(): KernelInterface;

  /**
   * Start the transport
   */
  up(opts?: string[]): Promise<void>;

  /**
   * Stop the transport
   */
  down(): Promise<void>;
}
