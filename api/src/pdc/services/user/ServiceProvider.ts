import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { CryptoProvider } from '@pdc/providers/crypto';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { defaultNotificationBindings } from '@pdc/providers/notification';

import { changePassword } from '@shared/user/changePassword.schema';
import { changePasswordWithToken } from '@shared/user/changePasswordWithToken.schema';
import { changeRole } from '@shared/user/changeRole.schema';
import { checkForgottenToken } from '@shared/user/checkForgottenToken.schema';
import { confirmEmail } from '@shared/user/confirmEmail.schema';
import { contactform } from '@shared/user/contactform.schema';
import { deleteUser } from '@shared/user/delete.schema';
import { deleteAssociatedUser } from '@shared/user/deleteAssociated.schema';
import { find } from '@shared/user/find.schema';
import { create } from '@shared/user/create.schema';
import { forgottenPassword } from '@shared/user/forgottenPassword.schema';
import { list } from '@shared/user/list.schema';
import { login } from '@shared/user/login.schema';
import { patch } from '@shared/user/patch.schema';
import { sendConfirmEmail } from '@shared/user/sendConfirmEmail.schema';
import { sendInvitationEmail } from '@shared/user/sendInvitationEmail.schema';
import { UserPgRepositoryProvider } from './providers/UserPgRepositoryProvider';

import { config } from './config';
import { ChangePasswordUserAction } from './actions/ChangePasswordUserAction';
import { ChangePasswordWithTokenUserAction } from './actions/ChangePasswordWithTokenUserAction';
import { ChangeRoleUserAction } from './actions/ChangeRoleUserAction';
import { CheckForgottenTokenUserAction } from './actions/CheckForgottenTokenUserAction';
import { ConfirmEmailUserAction } from './actions/ConfirmEmailUserAction';
import { CreateUserAction } from './actions/CreateUserAction';
import { DeleteUserAction } from './actions/DeleteUserAction';
import { DeleteAssociatedUserAction } from './actions/DeleteAssociatedUserAction';
import { FindUserAction } from './actions/FindUserAction';
import { ForgottenPasswordUserAction } from './actions/ForgottenPasswordUserAction';
import { ListUserAction } from './actions/ListUserAction';
import { LoginUserAction } from './actions/LoginUserAction';
import { NotifyUserAction } from './actions/NotifyUserAction';
import { PatchUserAction } from './actions/PatchUserAction';
import { SendConfirmEmailUserAction } from './actions/SendConfirmEmailUserAction';
import { SendInvitationEmailUserAction } from './actions/SendInvitationEmailUserAction';

import { AuthRepositoryProvider } from './providers/AuthRepositoryProvider';
import { UserNotificationProvider } from './providers/UserNotificationProvider';
import { SeedUsersCommand } from './commands/SeedUsersCommand';
import { HasUsersAction } from './actions/HasUsersAction';
import { FindInactiveCommand } from './commands/FindInactiveCommand';
import { challengePasswordMiddlewareBinding } from './middlewares/ChallengePasswordMiddleware';
import { challengeTokenMiddlewareBinding } from './middlewares/ChallengeTokenMiddleware';
import { ContactformAction } from './actions/ContactformAction';
import { SimulatePolicyformAction } from './actions/SimulatePolicyformAction';
import { sendSimulationEmail } from '@shared/user/simulatePolicyform.schema';

@serviceProvider({
  config,
  providers: [
    ...defaultNotificationBindings,
    UserPgRepositoryProvider,
    CryptoProvider,
    AuthRepositoryProvider,
    UserNotificationProvider,
  ],
  validator: [
    ['user.changePassword', changePassword],
    ['user.changePasswordWithToken', changePasswordWithToken],
    ['user.changeRole', changeRole],
    ['user.checkForgottenToken', checkForgottenToken],
    ['user.confirmEmail', confirmEmail],
    ['user.contactform', contactform],
    ['user.create', create],
    ['user.delete', deleteUser],
    ['user.deleteAssociated', deleteAssociatedUser],
    ['user.find', find],
    ['user.forgottenPassword', forgottenPassword],
    ['user.list', list],
    ['user.login', login],
    ['user.patch', patch],
    ['user.sendConfirmEmail', sendConfirmEmail],
    ['user.sendInvitationEmail', sendInvitationEmail],
    ['user.sendSimulationEmail', sendSimulationEmail],
  ],
  middlewares: [
    ...defaultMiddlewareBindings,
    challengePasswordMiddlewareBinding,
    challengeTokenMiddlewareBinding,
    ['validate', ValidatorMiddleware],
  ],
  handlers: [
    ChangePasswordUserAction,
    ChangePasswordWithTokenUserAction,
    ChangeRoleUserAction,
    CheckForgottenTokenUserAction,
    ConfirmEmailUserAction,
    ContactformAction,
    CreateUserAction,
    DeleteUserAction,
    DeleteAssociatedUserAction,
    FindUserAction,
    ForgottenPasswordUserAction,
    ListUserAction,
    LoginUserAction,
    NotifyUserAction,
    PatchUserAction,
    SendConfirmEmailUserAction,
    SendInvitationEmailUserAction,
    HasUsersAction,
    SimulatePolicyformAction,
  ],
  commands: [SeedUsersCommand, FindInactiveCommand],
  queues: ['user'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
