import { Job } from 'bull';

import { KernelInterface } from '../interfaces/KernelInterface';
import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { resolveMethodFromObject } from '../helpers/resolveMethod';
import { ConfigProvider } from '../providers/ConfigProvider';
import { EnvProvider } from '../providers/EnvProvider';
import { bullFactory } from '../helpers/bullFactory';

export class QueueProvider implements ServiceProviderInterface {
  readonly signature: string;
  readonly version: string;
  private client;
  private kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  public boot() {
    const redisUrl = (<ConfigProvider>this.kernel.get('config')).get('redisUrl');
    const env = (<EnvProvider>this.kernel.get('env')).get('NODE_ENV');

    this.client = bullFactory(`${env}-${this.signature}`, redisUrl);
  }
  public async call(method: string, params: ParamsType, context: ContextType): Promise<Job> {
    try {
      const methodString = resolveMethodFromObject({
        method,
        service: this.signature,
        version: this.version,
      });

      const job = await this.client.add(methodString, {
        jsonrpc: '2.0',
        id: null,
        method: methodString,
        params: {
          params,
          _context: context,
        },
      });

      return job;
    } catch (e) {
      throw new Error('An error occured');
    }
  }
}
