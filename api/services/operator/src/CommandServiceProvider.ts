import { Parents, Interfaces } from '@ilos/cli';
import { Types } from '@ilos/core';

import { MigrateCommand } from './commands/MigrateCommand';

export class CommandServiceProvider extends Parents.CommandServiceProvider {
  public readonly commands: Types.NewableType<Interfaces.CommandInterface>[] = [MigrateCommand];
}
