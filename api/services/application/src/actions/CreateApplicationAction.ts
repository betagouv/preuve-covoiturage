import { Parents, Container } from '@ilos/core';

import {
  ApplicationInterface,
  ApplicationRepositoryProviderInterfaceResolver,
  CreateApplicationParamsInterface,
} from '../interfaces';

@Container.handler({
  service: 'application',
  method: 'create',
})
export class CreateApplicationAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['application.create']],
    ['validate', ['application.create']],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CreateApplicationParamsInterface): Promise<ApplicationInterface> {
    return this.applicationRepository.create(params);
  }
}
