import { Action as AbstractAction } from '@ilos/core';
import { handler, ValidatorInterfaceResolver } from '@ilos/common';

@handler({
  service: 'user',
  method: 'schema',
})
export class SchemaUserAction extends AbstractAction {
  constructor(private validator: ValidatorInterfaceResolver) {
    super();
  }

  public async handle(): Promise<any[]> {
    const res = [];
    (<any>this.validator).bindings.forEach((v) => res.push(v.schema));

    return res;
  }
}
