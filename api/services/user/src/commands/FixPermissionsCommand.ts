import {
  command,
  KernelInterfaceResolver,
  CommandInterface,
  ConfigInterfaceResolver,
  CommandOptionType,
} from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

// The config object returned from permissions.ts
interface PermsConfig {
  group: {
    role: {
      slug: string;
      name: string;
      permissions: string[];
    };
  };
}

@command()
export class FixPermissionsCommand implements CommandInterface {
  static get signature(): string {
    return 'fix-permissions';
  }

  constructor(
    protected kernel: KernelInterfaceResolver,
    protected config: ConfigInterfaceResolver,
    protected mongo: MongoConnection,
  ) {}

  static readonly options: CommandOptionType[] = [];

  public async call(): Promise<void> {
    try {
      const db = await this.mongo.getClient();
      const collection = db.db(this.config.get('user.db')).collection(this.config.get('user.collectionName'));

      // reset all users' permissions based on config
      const perms: PermsConfig = this.config.get('permissions');
      const updates = [];
      Object.keys(perms).forEach((group: string) => {
        Object.values(perms[group]).forEach(({ slug: role, permissions }) => {
          console.log(`[fix-permissions] ${group}:${role}`);
          updates.push(collection.updateMany({ group, role }, { $set: { permissions } }));
        });
      });

      await Promise.all(updates);
      console.log('[fix-permissions] All patched!');
    } catch (e) {
      console.log('[fix-permissions] ERROR', e.message);
    }
  }
}
