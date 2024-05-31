import { ServiceProvider as AbstractServiceProvider } from '@ilos/core/index.ts';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator/index.ts';
import { CryptoProvider } from '@pdc/providers/crypto/index.ts';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware/index.ts';
import { defaultNotificationBindings } from '@pdc/providers/notification/index.ts';

import { changePassword } from '@shared/user/changePassword.schema.ts';
import { changePasswordWithToken } from '@shared/user/changePasswordWithToken.schema.ts';
import { changeRole } from '@shared/user/changeRole.schema.ts';
import { checkForgottenToken } from '@shared/user/checkForgottenToken.schema.ts';
import { confirmEmail } from '@shared/user/confirmEmail.schema.ts';
import { contactform } from '@shared/user/contactform.schema.ts';
import { deleteUser } from '@shared/user/delete.schema.ts';
import { deleteAssociatedUser } from '@shared/user/deleteAssociated.schema.ts';
import { find } from '@shared/user/find.schema.ts';
import { create } from '@shared/user/create.schema.ts';
import { forgottenPassword } from '@shared/user/forgottenPassword.schema.ts';
import { list } from '@shared/user/list.schema.ts';
import { login } from '@shared/user/login.schema.ts';
import { patch } from '@shared/user/patch.schema.ts';
import { sendConfirmEmail } from '@shared/user/sendConfirmEmail.schema.ts';
import { sendInvitationEmail } from '@shared/user/sendInvitationEmail.schema.ts';
import { UserPgRepositoryProvider } from './providers/UserPgRepositoryProvider.ts';

import { config } from './config/index.ts';
import { ChangePasswordUserAction } from './actions/ChangePasswordUserAction.ts';
import { ChangePasswordWithTokenUserAction } from './actions/ChangePasswordWithTokenUserAction.ts';
import { ChangeRoleUserAction } from './actions/ChangeRoleUserAction.ts';
import { CheckForgottenTokenUserAction } from './actions/CheckForgottenTokenUserAction.ts';
import { ConfirmEmailUserAction } from './actions/ConfirmEmailUserAction.ts';
import { CreateUserAction } from './actions/CreateUserAction.ts';
import { DeleteUserAction } from './actions/DeleteUserAction.ts';
import { DeleteAssociatedUserAction } from './actions/DeleteAssociatedUserAction.ts';
import { FindUserAction } from './actions/FindUserAction.ts';
import { ForgottenPasswordUserAction } from './actions/ForgottenPasswordUserAction.ts';
import { ListUserAction } from './actions/ListUserAction.ts';
import { LoginUserAction } from './actions/LoginUserAction.ts';
import { NotifyUserAction } from './actions/NotifyUserAction.ts';
import { PatchUserAction } from './actions/PatchUserAction.ts';
import { SendConfirmEmailUserAction } from './actions/SendConfirmEmailUserAction.ts';
import { SendInvitationEmailUserAction } from './actions/SendInvitationEmailUserAction.ts';

import { AuthRepositoryProvider } from './providers/AuthRepositoryProvider.ts';
import { UserNotificationProvider } from './providers/UserNotificationProvider.ts';
import { SeedUsersCommand } from './commands/SeedUsersCommand.ts';
import { HasUsersAction } from './actions/HasUsersAction.ts';
import { FindInactiveCommand } from './commands/FindInactiveCommand.ts';
import { challengePasswordMiddlewareBinding } from './middlewares/ChallengePasswordMiddleware.ts';
import { challengeTokenMiddlewareBinding } from './middlewares/ChallengeTokenMiddleware.ts';
import { ContactformAction } from './actions/ContactformAction.ts';
import { SimulatePolicyformAction } from './actions/SimulatePolicyformAction.ts';
import { sendSimulationEmail } from '@shared/user/simulatePolicyform.schema.ts';

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
