import { Parents, Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserListResponseInterface } from '../interfaces/UserListResponseInterface';
import { ListUserParamsInterface } from '../interfaces/actions/UserListParamsInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';

import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * list users filtered by territory or operator and paginate with limit & skip
 */
@Container.handler({
  service: 'user',
  method: 'list',
})
export class ListUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.list'],
    [
      'scopeIt',
      [
        ['user.list'],
        [
          (_params, context) => {
            if ('territory' in context.call.user) {
              return 'territory.users.list';
            }
          },
          (_params, context) => {
            if ('operator' in context.call.user) {
              return 'operator.users.list';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput.map((key: string) => `data.${key}`)],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private config: ConfigProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: ListUserParamsInterface,
    context: UserContextInterface,
  ): Promise<UserListResponseInterface> {
    const contextParam: { territory?: string; operator?: string } = {};

    if ('territory' in context.call.user) {
      contextParam.territory = context.call.user.territory;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    // Pagination
    const page = 'page' in params ? this.castPage(params.page) : this.config.get('pagination.defaultPage');
    const limit = 'limit' in params ? this.castPage(params.limit) : this.config.get('pagination.defaultLimit');
    const pagination = this.paginate({ limit, page });

    const data = await this.userRepository.list(contextParam, pagination);

    return {
      data: data.users,
      metadata: {
        pagination: {
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
    return page || this.config.get('pagination.defaultPage');
  }

  private castLimit(limit: number): number {
    const lim = limit || this.config.get('pagination.defaultLimit');
    return lim > this.config.get('pagination.maxLimit') ? this.config.get('pagination.maxLimit') : lim;
  }

  private paginate(query: { limit: number; page: number }): { skip: number; limit: number } {
    const limit = this.castLimit(query.limit);
    const skip = (this.castPage(query.page) - 1) * limit;
    return { skip, limit };
  }
}
