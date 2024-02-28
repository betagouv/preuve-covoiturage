import fs from 'fs';
import { Action } from '@ilos/core';
import { handler, ConfigInterfaceResolver, ParamsType, ContextType, ResultType } from '@ilos/common';

@handler({
  service: 'string',
  method: 'log',
})
export class LogAction extends Action {
  constructor(private config: ConfigInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    if (context && !!context.channel && !!context.channel.transport && context.channel.transport === 'queue') {
      fs.writeFileSync(this.config.get('log.path'), JSON.stringify(params), { encoding: 'utf8', flag: 'w' });
    }
    return params;
  }
}
