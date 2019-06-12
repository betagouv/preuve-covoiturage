import { Parents, Types, Interfaces } from '@pdc/core';

import { MigrateCommand } from './commands/MigrateCommand';

export class CommandServiceProvider extends Parents.CommandServiceProvider {
  public readonly commands: Types.NewableType<Interfaces.CommandInterface>[] = [MigrateCommand];
}
