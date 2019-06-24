import { Parents, Container, Types, Interfaces } from '@ilos/core';

import { Journey } from '../entities/journey';

interface NormalizationGeoParamsInterface {
  journey: Journey;
}

/*
 * Build trip
 */
@Container.handler({
  service: 'crosscheck',
  method: 'process',
})
export class CrosscheckProcessAction extends Parents.Action {
  constructor() {
    super();
  }

  public async handle(param: NormalizationGeoParamsInterface, context: Types.ContextType): Promise<void> {
    return;
  }

}
