import { command, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { ParentMigrateCommand } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

import { ContactsSchemaMigration } from '../migrations/ContactsSchemaMigration';

@command()
export class MigrateCommand extends ParentMigrateCommand {
  entity = 'operator';
  migrations = [ContactsSchemaMigration];

  static get signature(): string {
    return 'migrate';
  }

  constructor(
    protected db: MongoConnection,
    protected kernel: KernelInterfaceResolver,
    protected config: ConfigInterfaceResolver,
  ) {
    super(kernel, db, config);
  }
}
