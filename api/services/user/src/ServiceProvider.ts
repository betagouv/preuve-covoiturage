import path from 'path';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { CryptoProvider } from '@pdc/provider-crypto';
import { NotificationExtension } from '@pdc/provider-notification';

import {
  ScopeToSelfMiddleware,
  ContentBlacklistMiddleware,
  ContentWhitelistMiddleware,
} from '@pdc/provider-middleware';

import { changePassword } from './shared/user/changePassword.schema';
import { changePasswordWithToken } from './shared/user/changePasswordWithToken.schema';
import { changeRole } from './shared/user/changeRole.schema';
import { checkForgottenToken } from './shared/user/checkForgottenToken.schema';
import { confirmEmail } from './shared/user/confirmEmail.schema';
import { deleteUser } from './shared/user/delete.schema';
import { find } from './shared/user/find.schema';
import { create } from './shared/user/create.schema';
import { forgottenPassword } from './shared/user/forgottenPassword.schema';
import { list } from './shared/user/list.schema';
import { login } from './shared/user/login.schema';
import { patch } from './shared/user/patch.schema';
import { register } from './shared/user/register.schema';
import { sendConfirmEmail } from './shared/user/sendConfirmEmail.schema';
import { UserRepositoryProvider } from './providers/UserRepositoryProvider';
import { ForgottenTokenValidatorProvider } from './providers/ForgottenTokenValidatorProvider';
import { FixPermissionsCommand } from './commands/FixPermissionsCommand';
import { ChangePasswordUserAction } from './actions/ChangePasswordUserAction';
import { ChangePasswordWithTokenUserAction } from './actions/ChangePasswordWithTokenUserAction';
import { ChangeRoleUserAction } from './actions/ChangeRoleUserAction';
import { CheckForgottenTokenUserAction } from './actions/CheckForgottenTokenUserAction';
import { ConfirmEmailUserAction } from './actions/ConfirmEmailUserAction';
import { CreateUserAction } from './actions/CreateUserAction';
import { DeleteUserAction } from './actions/DeleteUserAction';
import { FindUserAction } from './actions/FindUserAction';
import { ForgottenPasswordUserAction } from './actions/ForgottenPasswordUserAction';
import { ListUserAction } from './actions/ListUserAction';
import { LoginUserAction } from './actions/LoginUserAction';
import { MeUserAction } from './actions/MeUserAction';
import { NotifyUserAction } from './actions/NotifyUserAction';
import { PatchUserAction } from './actions/PatchUserAction';
import { RegisterUserAction } from './actions/RegisterUserAction';
import { SendConfirmEmailUserAction } from './actions/SendConfirmEmailUserAction';
import { SendInvitationEmailUserAction } from './actions/SendInvitationEmailUserAction';

@serviceProvider({
  config: __dirname,
  providers: [UserRepositoryProvider, CryptoProvider, ForgottenTokenValidatorProvider],
  validator: [
    ['user.changePassword', changePassword],
    ['user.changePasswordWithToken', changePasswordWithToken],
    ['user.changeRole', changeRole],
    ['user.checkForgottenToken', checkForgottenToken],
    ['user.confirmEmail', confirmEmail],
    ['user.create', create],
    ['user.delete', deleteUser],
    ['user.find', find],
    ['user.forgottenPassword', forgottenPassword],
    ['user.list', list],
    ['user.login', login],
    ['user.patch', patch],
    ['user.register', register],
    ['user.sendConfirmEmail', sendConfirmEmail],
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
  ],
  connections: [[MongoConnection, 'mongo']],
  handlers: [
    ChangePasswordUserAction,
    ChangePasswordWithTokenUserAction,
    ChangeRoleUserAction,
    CheckForgottenTokenUserAction,
    ConfirmEmailUserAction,
    CreateUserAction,
    DeleteUserAction,
    FindUserAction,
    ForgottenPasswordUserAction,
    ListUserAction,
    LoginUserAction,
    MeUserAction,
    NotifyUserAction,
    PatchUserAction,
    RegisterUserAction,
    SendConfirmEmailUserAction,
    SendInvitationEmailUserAction,
  ],
  template: null,
  notification: {
    template: path.resolve(__dirname, 'templates'),
    templateMeta: 'template',
  },
  commands: [FixPermissionsCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension, NotificationExtension];
}
