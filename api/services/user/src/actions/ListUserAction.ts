import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';

interface PaginationInputInterface { // todo: mettre offset et limit ?
  per_page: number;
  current_page: number;
  limit: number;
  skip: number;
}


@Container.handler({
  service: 'user',
  method: 'list',
})
export class ListUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    filters: { [prop: string]: any },
    context: { call?: { user: User, metadata?: { pagination: PaginationInputInterface }}}): Promise<any> {
    // middleware : "user.list"

    // todo: manage pagination ( default value ... )
    const pagination = context.call.metadata.pagination;

    const data = await this.userRepository.list(filters, pagination);

    return {
      data: data.users,
      metadata: {
        pagination : {
          total: data.total,
          count: data.users.length,
          per_page: pagination.per_page,
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
}
