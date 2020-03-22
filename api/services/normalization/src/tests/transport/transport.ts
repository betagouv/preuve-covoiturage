import { bootstrap } from '../../bootstrap';

export class Transport {
  transport;
  kernel;

  public async start(): Promise<any> {
    this.transport = await bootstrap.boot('http', 0);
  }

  public async stop(): Promise<void> {
    await this.transport.down();
  }
}
