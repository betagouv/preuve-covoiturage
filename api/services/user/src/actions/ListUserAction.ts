import lodash from 'lodash';

import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';


@Container.handler({
  service: 'user',
  method: 'list',
})
export class ListUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['can', ['user.list']],
    ['validate', 'user.list'],
  ];

  private readonly config = {
    perPage: 25,
    defaultPage: 1,
    defaultLimit: 25,
    maxLimit: 1000,
  };

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    filters: { [prop: string]: any },
    context: { call?: { user: UserDbInterface}}): Promise<{data: UserDbInterface[], metadata: { pagination: { [prop:string]: any }}}> {
    // pagination: (skip and/or limit) or (page and/or per_page)

    const page = filters.page ? this.castPage(filters.page) : this.config.defaultPage;
    const limit = filters.limit ? this.castPage(filters.limit) : this.config.defaultLimit;


    const pagination = this.paginate({ limit, page });

    const data = await this.userRepository.list(filters, pagination);

    return {
      data: data.users,
      metadata: {
        pagination : {
          total: data.total,
          count: data.users.length,
          per_page: this.config.perPage, // not used in front
          current_page: Math.floor((pagination.skip || 0) / pagination.limit) + 1,
          total_pages: Math.floor(data.total / pagination.limit),
        },
      },
    };


    // Complete aom & operators in payload

    // const results = await baseFind(query, options);
    // const aom = await Aom.find({}, { name: 1 });
    // const operators = await Operator.find({}, { nom_commercial: 1 });
    //
    // results.data = results.data.map((item) => {
    //   const user = item.toJSON();
    //
    //   if (user.aom && user.aom !== '') {
    //     const found = _.find(aom, a => a._id.toString() === user.aom.toString());
    //     if (found) user.aom = found.toJSON();
    //   }
    //
    //   if (user.operator && user.operator !== '') {
    //     const found = _.find(operators, a => a._id.toString() === user.operator.toString());
    //     if (found) user.operator = found.toJSON();
    //   }
    //
    //   return user;
    // });
    //
    // return results;
  }

  private castPage(page) {
    const p = parseInt(page, 10);

    if (lodash.isNaN(p)) return this.config.defaultPage;

    return Math.abs(p) || this.config.defaultPage;
  }

  private castLimit(limit) {
    let lim = parseInt(limit, 10);

    if (lodash.isNaN(lim)) return this.config.defaultLimit;

    lim = Math.abs(lim) || this.config.defaultLimit;

    return lim > this.config.maxLimit ? this.config.maxLimit : lim;
  }

  private paginate(query: {limit: number, page: number}): {skip:number, limit:number} {
    const limit = this.castLimit(query.limit);
    const skip = (this.castPage(query.page) - 1) * limit;

    return { skip, limit };
  }
}
