import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

@Container.handler({
  service: 'user',
  method: 'find',
})
export class FindUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: {id: string}): Promise<void> {
    // middleware : "user.read"

    const foundUser = this.userRepository.find(request.id);


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

    return foundUser;
  }
}
