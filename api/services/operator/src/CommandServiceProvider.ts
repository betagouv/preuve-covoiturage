import { Parents, Interfaces } from '@ilos/cli';
import { Types, Container } from '@ilos/core';

import { MigrateCommand } from './commands/MigrateCommand';

@Container.command()
export class CommandServiceProvider extends Parents.CommandServiceProvider {
  public readonly commands: Types.NewableType<Interfaces.CommandInterface>[] = [MigrateCommand];
}
