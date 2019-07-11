import { Parents, Container } from '@ilos/core';

import {
  ApplicationInterface,
  ApplicationRepositoryProviderInterfaceResolver,
  RevokeApplicationParamsInterface,
} from '../interfaces';

@Container.handler({
  service: 'application',
  method: 'revoke',
})
export class RevokeApplicationAction extends Parents.Action {
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
