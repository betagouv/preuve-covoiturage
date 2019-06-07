import { Parents, Container, Providers } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { PaginationInterface } from '../interfaces/PaginationInterface';


interface ListUserInterface {
  data: UserDbInterface[];
  metadata: { pagination: PaginationInterface};
}

interface ListUserRequestInterface {
  page?: string;
  limit?: string;
}

@Container.handler({
  service: 'user',
  method: 'list',
})
export class ListUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['validate', 'user.list'],
    ['scopeIt', [['user.list'], [
      (_params, context) => {
        if ('aom' in context.call.user) {
          return 'aom.users.list';
        }
      },
      (_params, context) => {
        if ('operator' in context.call.user) {
          return 'operator.users.list';
        }
      },
    ]]],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private config: Providers.ConfigProvider,
  ) {
    super();
  }

  public async handle(
    request: ListUserRequestInterface,
    context: UserContextInterface): Promise<ListUserInterface> {
    const contextParam: {aom?: string, operator?: string} = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    // Pagination
    const page = 'page' in request ? this.castPage(request.page) : this.config.get('pagination.defaultPage');
    const limit = 'limit' in request ? this.castPage(request.limit) : this.config.get('pagination.defaultLimit');
    const pagination = this.paginate({ limit, page });

    const data = await this.userRepository.list(contextParam, pagination);

    return {
      data: data.users,
      metadata: {
        pagination : {
          total: data.total,
          count: data.users.length,
          per_page: this.config.get('pagination.perPage'), // not used in front
          current_page: Math.floor((pagination.skip || 0) / pagination.limit) + 1,
          total_pages: Math.floor(data.total / pagination.limit),
        },
      },
    };
  }

  private castPage(page: number): number {
    return page || this.config.get('pagination.defaultPage'); // Math abs useful ?
  }

  private castLimit(limit: number): number {
    const lim = limit || this.config.get('pagination.defaultLimit'); // Math abs useful ?
    return lim > this.config.get('pagination.maxLimit') ? this.config.get('pagination.maxLimit') : lim;
  }

  private paginate(query: { limit: number, page: number }): { skip: number, limit: number } {
    const limit = this.castLimit(query.limit);
    const skip = (this.castPage(query.page) - 1) * limit;
    return { skip, limit };
  }
}
