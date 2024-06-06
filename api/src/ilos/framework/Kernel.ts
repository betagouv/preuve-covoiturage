import { Kernel as BaseKernel, Extensions } from '/ilos/core/index.ts';
import { Commands, CommandExtension } from '/ilos/cli/index.ts';
import { ConnectionManagerExtension } from '/ilos/connection-manager/index.ts';
import { QueueExtension } from '/ilos/queue/index.ts';
import { ValidatorExtension } from '/ilos/validator/index.ts';
import { kernel } from '/ilos/common/index.ts';
import process from 'node:process';

@kernel({
  config: process.cwd(),
  commands: [Commands.CallCommand, Commands.ListCommand],
})
export class Kernel extends BaseKernel {
  readonly extensions = [
    Extensions.Config,
    ConnectionManagerExtension,
    CommandExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
    QueueExtension,
  ];
}
