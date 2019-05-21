import { Parents, Container } from '@pdc/core';
import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';
import { User } from '../entities/User';

@Container.handler({
  service: 'user',
  method: 'create',
})
export class CreateUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProvider,
  ) {
    super();
  }

  public async handle(request: User, context: { invite: boolean, connectedUser: User }): Promise<void> {
    /*
    // check if the user exists already
    if (await User.findOne({ email: data.email }).exec()) {
      throw new ConflictError();
    }
*/

    if (request.operator && request.aom) {
      throw new Error('Cannot assign operator and AOM at the same time');
    }

    if (!context.invite) context.invite = false;

    const payload: any = {};

    payload['email'] = request.email;
    payload['firstname'] = request.firstname;
    payload['lastname'] = request.lastname;
    payload['group'] = request.group;
    payload['role'] = request.role;
    payload['status'] = context.invite ? 'invited' : 'pending';
    payload['password'] = request.password; // todo: || generateToken();
    payload['requester'] = context.connectedUser['fullname']; // todo: add fullname to user entity ?

    const op = context.invite ? context.connectedUser.operator : request.operator;
    const ao = context.invite ? context.connectedUser.aom : request.aom;

 /*   if (op) {
      const operator = await operatorService.findOne(op);

      if (operator) {
        payload.operator = operator._id;
        payload.organisation = operator.name;
      }
    } else if (ao) {
      const aom = await aomService.findOne(ao);

      if (aom) {
        payload.aom = aom._id;
        payload.organisation = aom.name;
      }
    }
*/


    // create the new user
    const user = new User(payload);
    // user.permissions = Permissions.getFromRole(user.group, user.role);

    this.userRepository.create(payload);

    // generate new token for a password reset on first access
    return this.forgottenPassword({
      email: payload.email,
      invite: {
        requester: payload.requester,
        organisation: payload.organisation,
      },
    });
  }
}
