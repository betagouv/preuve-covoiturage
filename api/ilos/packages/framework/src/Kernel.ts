import { Kernel as BaseKernel, Extensions } from '@ilos/core';
import { Commands, CommandExtension } from '@ilos/cli';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { LoggerExtension } from '@ilos/logger';
import { QueueExtension } from '@ilos/queue';
import { ValidatorExtension } from '@ilos/validator';
import { kernel } from '@ilos/common';

@kernel({
  config: process.cwd(),
  commands: [Commands.CallCommand, Commands.ListCommand, Commands.ScaffoldCommand],
})
export class Kernel extends BaseKernel {
  readonly extensions = [
    LoggerExtension,
    ConnectionManagerExtension,
    CommandExtension,
    ValidatorExtension,
    Extensions.Config,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
    QueueExtension,
  ];
}
