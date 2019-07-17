import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { ApplicationInterface, RevokeApplicationParamsInterface } from '@pdc/provider-schema';

import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces';

@handler({
  service: 'application',
  method: 'revoke',
})
export class RevokeApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['application.revoke']],
    ['validate', 'application.revoke'],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: RevokeApplicationParamsInterface): Promise<ApplicationInterface> {
    return this.applicationRepository.softDelete(params);
  }
}
