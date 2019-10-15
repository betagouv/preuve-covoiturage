import { command, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { ParentMigrateCommand } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

import { AppV1toV2Migration } from '../migrations/AppV1toV2Migration';

@command()
export class MigrateCommand extends ParentMigrateCommand {
  entity = 'application';
  migrations = [AppV1toV2Migration];

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
