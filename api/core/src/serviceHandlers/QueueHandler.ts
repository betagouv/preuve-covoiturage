import { Job } from 'bull';

import { HandlerInterface } from '~/interfaces/HandlerInterface';
import { handler } from '~/Container';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { CallType } from '~/types/CallType';
import { NewableType } from '~/types/NewableType';

import { KernelInterface } from '../interfaces/KernelInterface';
import { resolveMethodFromObject } from '../helpers/resolveMethod';
import { ConfigProvider } from '../providers/ConfigProvider';
import { EnvProvider } from '../providers/EnvProvider';
import { bullFactory } from '../helpers/bullFactory';

export class QueueHandler implements HandlerInterface {
  readonly middlewares: MiddlewareInterface[] = [];

  protected readonly service: string;
  protected readonly version: string;
  protected booted = false;

  private client;

  constructor(
    private env: EnvProvider,
    private config: ConfigProvider,
  ) {
  }

  private boot() {
    const redisUrl = this.config.get('redisUrl');
    const env = this.env.get('NODE_ENV');

    this.client = bullFactory(`${env}-${this.service}`, redisUrl);
    this.booted = true;
  }

  public async call(call: CallType): Promise<Job> {
    if (!this.booted) {
      this.boot();
    }

    try {
      const { method, params, context } = call;
      const methodString = resolveMethodFromObject({
        method,
        service: this.service,
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

export function queueHandlerFactory(service: string, version?: string): NewableType<HandlerInterface> {
  @handler({
    service,
    version,
    method: '*',
    transport: 'queue',
  })
  class CustomQueueHandler extends QueueHandler {
    readonly service: string = service;
    readonly version: string = version;
  }

  return CustomQueueHandler;
}

