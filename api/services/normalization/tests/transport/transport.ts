import { bootstrap } from '@ilos/framework';

export class Transport {
  port = '8081';
  transport;

  public async start(): Promise<any> {
    this.transport = await bootstrap.boot(['', '', 'http', this.port]);
  }

  public async stop(): Promise<void> {
    await this.transport.down();
  }
}
