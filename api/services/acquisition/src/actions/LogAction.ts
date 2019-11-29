import { Action as AbstractAction } from '@ilos/core';
import { MongoConnection } from '@ilos/connection-mongo';
import { handler, ContextType, ConfigInterfaceResolver } from '@ilos/common';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

@handler({
  service: 'acquisition',
  method: 'log',
})
export class LogAction extends AbstractAction {
  constructor(
    private mongo: MongoConnection,
    private config: ConfigInterfaceResolver,
    private tokenProvider: TokenProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: { req: any }, context: ContextType): Promise<void> {
    if (
      !process.env.REQLOG ||
      !context.channel.metadata.internal ||
      context.channel.service !== 'proxy' ||
      context.channel.transport !== 'http' ||
      ['production', 'staging', 'local'].indexOf(process.env.NODE_ENV) === -1
    ) {
      return;
    }

    const client = await this.mongo.getClient();
    const collection = client.db(this.config.get('acquisition.db')).collection('reqlog');

    const bd = JSON.parse(JSON.stringify(params.req.body));
    const hd = JSON.parse(JSON.stringify(params.req.headers));

    await collection.insertOne({
      bd,
      hd,
      u: `${params.req.method} ${params.req.url}`,
      c: context.call,
      tz: new Date(),
    });
  }
}
