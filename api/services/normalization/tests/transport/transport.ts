import { bootstrap } from '@ilos/framework';

export class Transport {
  port = '8084';
  transport;
  kernel;

  public async start(): Promise<any> {
    process.env.APP_URL = `http://localhost:${this.port}`;
    this.transport = await bootstrap.boot(['', '', 'http', this.port]);
  }

  public async stop(): Promise<void> {
    await this.transport.down();
  }
}
