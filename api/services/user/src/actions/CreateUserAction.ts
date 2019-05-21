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

  // todo: fix all comments
  public async handle(request: User, context: { connectedUser: User }): Promise<void> {
    /*
    // check if the user exists already
    // if (await this.userRepository.findByEamil(data.email).exec()) {
    //   throw new ConflictError();
    // }

    if (request.operator && request.aom) {
      // throw new BadRequestError('Cannot assign operator and AOM at the same time');
    }


    const payload: any = {};

    payload['email'] = request.email;
    payload['firstname'] = request.firstname;
    payload['lastname'] = request.lastname;
    payload['group'] = request.group;
    payload['role'] = request.role;
    payload['status'] = 'invited';
    payload['password'] = request.password; // todo: || generateToken();
    // token inject authprovider >> to generateToken()
    payload['requester'] = context.connectedUser['fullname']; // todo: add fullname to user entity ?

    const op = request.operator;
    const ao = request.aom;

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
    });
  }

  private async forgottenPassword({ email }, userCache = null) {
    // search for user
    const user = userCache || (await User.findOne({ email }).exec());
    if (!user) {
      // throw new NotFoundError();
    }

    // const reset = generateToken(12);
    // const token = generateToken();

    // user.forgottenReset = reset;
    // user.forgottenToken = token;
    user.forgottenAt = new Date();
    await user.save();

    // send the email
    // user.forgotten(reset, token);


    return user;
  }
}
