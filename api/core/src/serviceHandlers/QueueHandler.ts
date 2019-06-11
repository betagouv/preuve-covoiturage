import { Job, Queue } from 'bull';

import { HandlerInterface } from '../interfaces/HandlerInterface';
import { handler } from '../container';
import { CallType } from '../types/CallType';
import { NewableType } from '../types/NewableType';

import { ConfigProvider } from '../providers/ConfigProvider';
import { EnvProvider } from '../providers/EnvProvider';
import { bullFactory } from '../helpers/bullFactory';

export class QueueHandler implements HandlerInterface {
  public readonly middlewares: (string | [string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  private client: Queue;

  constructor(private env: EnvProvider, private config: ConfigProvider) {}

  public boot() {
    const redisUrl = this.config.get('redisUrl');
    const env = this.env.get('NODE_ENV');

    this.client = bullFactory(`${env}-${this.service}`, redisUrl);
  }

  public async call(call: CallType): Promise<Job> {
    try {
      const { method, params, context } = call;
      // TODO : add channel ?
      await this.client.isReady();

      const job = await this.client.add(method, {
        method,
        jsonrpc: '2.0',
        id: null,
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
    local: false,
    queue: true,
  })
  class CustomQueueHandler extends QueueHandler {
    readonly service: string = service;
    readonly version: string = version;
  }

  return CustomQueueHandler;
}
