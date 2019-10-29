import { Action as AbstractAction } from '@ilos/core';
import { handler, ValidatorInterfaceResolver } from '@ilos/common';

@handler({
  service: 'territory',
  method: 'schema',
})
export class SchemaTerritoryAction extends AbstractAction {
  constructor(private validator: ValidatorInterfaceResolver) {
    super();
  }

  public async handle(): Promise<any[]> {
    const res = [];
    (<any>this.validator).bindings.forEach((v) => res.push(v.schema));

    return res;
  }
}
