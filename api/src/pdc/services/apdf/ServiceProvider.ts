import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { APDFNameProvider, S3StorageProvider } from '@pdc/providers/storage';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';

import { config } from './config';
import { DataRepositoryProvider } from './providers/APDFRepositoryProvider';
import { StorageRepositoryProvider } from './providers/StorageRepositoryProvider';
import { binding as exportBinding } from '@shared/apdf/export.schema';
import { binding as listBinding } from '@shared/apdf/list.schema';

import { ExportAction } from './actions/ExportAction';
import { ListAction } from './actions/ListAction';
import { ExportCommand } from './commands/ExportCommand';

@serviceProvider({
  config,
  queues: ['apdf'],
  validator: [listBinding, exportBinding],
  providers: [APDFNameProvider, DataRepositoryProvider, S3StorageProvider, StorageRepositoryProvider],
  handlers: [ListAction, ExportAction],
  commands: [ExportCommand],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
