import path from 'path';
import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { NotificationExtension } from '@ilos/notification';
import { TemplateExtension } from '@ilos/template';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { CryptoProvider } from '@pdc/provider-crypto';
import {
  ScopeToSelfMiddleware,
  ContentBlacklistMiddleware,
  ContentWhitelistMiddleware,
} from '@pdc/provider-middleware';

import { CreateUserAction } from './actions/CreateUserAction';
import { DeleteUserAction } from './actions/DeleteUserAction';
import { FindUserAction } from './actions/FindUserAction';
import { NotifyUserAction } from './actions/NotifyUserAction';
import { ListUserAction } from './actions/ListUserAction';
import { PatchUserAction } from './actions/PatchUserAction';
import { ConfirmEmailUserAction } from './actions/ConfirmEmailUserAction';
import { ForgottenPasswordUserAction } from './actions/ForgottenPasswordUserAction';
import { ResetPasswordUserAction } from './actions/ResetPasswordUserAction';
import { ChangePasswordUserAction } from './actions/ChangePasswordUserAction';
import { ChangeEmailUserAction } from './actions/ChangeEmailUserAction';
import { LoginUserAction } from './actions/LoginUserAction';
import { ChangeRoleUserAction } from './actions/ChangeRoleUserAction';
import { RegisterUserAction } from './actions/RegisterUserAction';
import { UserRepositoryProvider } from './providers/UserRepositoryProvider';
import {
  userPatchSchema,
  userDeleteSchema,
  userCreateSchema,
  userFindSchema,
  userListSchema,
  userRegisterSchema,
  userResetPasswordSchema,
  userForgottenPasswordSchema,
  userConfirmEmailSchema,
  userChangePasswordSchema,
  userChangeEmailSchema,
  userLoginSchema,
  userChangeRoleSchema,
} from './schemas';

@serviceProvider({
  config: __dirname,
  providers: [UserRepositoryProvider, CryptoProvider],
  validator: [
    ['user.create', userCreateSchema],
    ['user.changePassword', userChangePasswordSchema],
    ['user.changeEmail', userChangeEmailSchema],
    ['user.changeRole', userChangeRoleSchema],
    ['user.confirmEmail', userConfirmEmailSchema],
    ['user.find', userFindSchema],
    ['user.forgottenPassword', userForgottenPasswordSchema],
    ['user.patch', userPatchSchema],
    ['user.list', userListSchema],
    ['user.login', userLoginSchema],
    ['user.delete', userDeleteSchema],
    ['user.resetPassword', userResetPasswordSchema],
    ['user.register', userRegisterSchema],
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
    ChangeEmailUserAction,
    ChangePasswordUserAction,
    ChangeRoleUserAction,
    ConfirmEmailUserAction,
    CreateUserAction,
    DeleteUserAction,
    FindUserAction,
    ForgottenPasswordUserAction,
    NotifyUserAction,
    ListUserAction,
    LoginUserAction,
    PatchUserAction,
    ResetPasswordUserAction,
    RegisterUserAction,
  ],
  template: null,
  notification: {
    templatePath: path.resolve(__dirname, 'templates'),
    templateMeta: 'template',
  },
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    ConfigExtension,
    ConnectionManagerExtension,
    ValidatorExtension,
    TemplateExtension,
    NotificationExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
