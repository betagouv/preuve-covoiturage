import { Parents, Container } from '@ilos/core';

import { ApplicationRepositoryProviderInterfaceResolver, CheckApplicationParamsInterface } from '../interfaces';

@Container.handler({
  service: 'application',
  method: 'check',
})
export class CheckApplicationAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['application.revoke']],
    ['validate', ['application.revoke']],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CheckApplicationParamsInterface): Promise<boolean> {
    return this.applicationRepository.check(params);
  }
}
