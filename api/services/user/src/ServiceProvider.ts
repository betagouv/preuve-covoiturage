import path from 'path';
import { Parents, Interfaces, Types } from '@ilos/core';
import { PermissionMiddleware } from '@ilos/package-acl';
import { ConfigProviderInterfaceResolver, ConfigProvider } from '@ilos/provider-config';
import { EnvProviderInterfaceResolver, EnvProvider } from '@ilos/provider-env';
import { CryptoProviderInterfaceResolver, CryptoProvider } from '@pdc/provider-crypto';
import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';
import { NotificationProvider, NotificationProviderInterfaceResolver } from '@ilos/provider-notification';
import { TemplateProviderInterfaceResolver, HandlebarsProvider } from '@ilos/provider-template';
import { MongoProvider } from '@ilos/provider-mongo';

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

import { UserRepositoryProviderInterfaceResolver } from './interfaces/repository/UserRepositoryProviderInterface';
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

import { ScopeToSelfMiddleware } from './middlewares/ScopeToSelfMiddleware';
import { ContentBlacklistMiddleware } from './middlewares/ContentBlacklistMiddleware';
import { ContentWhitelistMiddleware } from './middlewares/ContentWhitelistMiddleware';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [UserRepositoryProviderInterfaceResolver, UserRepositoryProvider],
    [CryptoProviderInterfaceResolver, CryptoProvider],
    [TemplateProviderInterfaceResolver, HandlebarsProvider],
    [NotificationProviderInterfaceResolver, NotificationProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
    MongoProvider,
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
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
  ];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
  ];

  protected readonly validators: [string, any][] = [
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
  ];

  public async boot() {
    this.registerEnv();
    this.registerConfig();
    await super.boot();
    this.registerValidators();
    this.registerTemplate();
  }

  protected registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }

  protected registerConfig() {
    this.getContainer()
      .bind(ConfigProviderInterfaceResolver)
      .to(ConfigProvider);

    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }

  protected registerEnv() {
    if (!this.getContainer().isBound(EnvProviderInterfaceResolver)) {
      this.getContainer()
        .bind(EnvProviderInterfaceResolver)
        .to(EnvProvider);
    }
  }
  protected registerTemplate() {
    this.getContainer()
      .get(TemplateProviderInterfaceResolver)
      .loadTemplatesFromDirectory(
        path.resolve(__dirname, 'templates'),
        this.getContainer()
          .get(ConfigProviderInterfaceResolver)
          .get('template'),
      );
  }
}
