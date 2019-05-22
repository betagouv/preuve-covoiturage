import { Parents, Container } from '@pdc/core';
import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';
import { User } from '../entities/User';
import { UserInterface } from '../entities/UserInterface';

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
    const foundUser = await this.userRepository.findByEmail(request.email);
    if (foundUser) {
      // throw new ConflictError();
    }


    if (request.operator && request.aom) {
      // throw new BadRequestError('Cannot assign operator and AOM at the same time');
    }


    const payload: any = {
      email: request.email,
      firstname : request.firstname,
      lastname : request.lastname,
      group : request.group,
      role : request.role,
      status : 'invited',
      password : request.password,
      requester : context.call.user.fullname,
    };

    /*
        const op = request.operator;
        const ao = request.aom;

      if (op) {
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

  // todo: put this in authentification ?
  private async forgottenPassword({ email, invite }, userCache = null) {
    // search for user
    const user = userCache || (await this.userRepository.findByEmail(email));
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
    // user.invite(reset, token, invite.requester, invite.organisation);

    return user;
  }
}
