import { Parents, Container } from '@pdc/core';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserInterface } from '../entities/UserInterface';

interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
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
    filters: [{ [prop: string]: any }],
    context: { call?: { user: UserInterface, metadata?: { pagination: Pagination }}}): Promise<any[]> {
    // middleware : "user.list"

    // todo: manage pagination ( default value ... )
    const pagination = context.call.metadata.pagination;

    return this.userRepository.list(filters, pagination);

    // todo: assign new pagination from data
    // data.metadata.pagination = {
    //       // total: docCount,
    //       //   count: data.length,
    //       //   per_page: limit,
    //       //   current_page: Math.floor((skip || 0) / limit) + 1,
    //       //   total_pages: Math.floor(docCount / limit),
    // };


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
