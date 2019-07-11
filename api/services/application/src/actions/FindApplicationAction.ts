import { Parents, Container } from '@ilos/core';

import { ApplicationRepositoryProviderInterfaceResolver, CheckApplicationParamsInterface } from '../interfaces';

@Container.handler({
  service: 'application',
  method: 'find',
})
export class FindApplicationAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['application.find']],
    ['validate', 'application.find'],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CheckApplicationParamsInterface): Promise<boolean> {
    return this.applicationRepository.find(params._id);
  }
}
