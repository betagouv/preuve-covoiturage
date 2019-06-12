import { Types, Interfaces, Providers } from '@pdc/core';
import { MongoProvider } from '@pdc/provider-mongo';

export type MigrationType = {
  signature: string;
  date?: Date;
  success?: boolean;
};

export interface MigrationInterface {
  up(): Promise<void>;
  down(): Promise<void>;
}

export abstract class ParentMigration implements MigrationInterface {
  static signature: string;

  static getSignature(): string {
    if (ParentMigration.signature) {
      return ParentMigration.signature;
    }
    throw new Error('No signature provided');
  }

  async up() {
    throw new Error();
  }

  async down() {
    throw new Error();
  }
}

export abstract class ParentMigrateCommand implements Interfaces.CommandInterface {
  public readonly entity: string = '';
  protected readonly migrations: Types.NewableType<ParentMigration>[] = [];
  protected availableMigrationsMap: Map<string, ParentMigration> = new Map();

  get signature(): string {
    return `migrate.${this.entity}`;
  }

  public readonly description: string = 'Make migration';
  public readonly options: Types.CommandOptionType[] = [
    {
      signature: '-b, --rollback <round>',
      description: 'Rollback',
      default: 1,
    },
    {
      signature: '-r, --reset',
      description: 'Reset migration',
      default: false,
    },
    {
      signature: '-s, --status',
      description: 'List migrations status',
      default: false,
    },
  ];

  constructor(
    protected kernel: Interfaces.KernelInterfaceResolver,
    protected db: MongoProvider,
    protected config: Providers.ConfigProvider,
  ) {}

  public async call({ rollback, reset, status }) {
    await this.boot();

    if (status) {
      return this.status();
    }

    if (rollback) {
      return this.rollback(rollback);
    }

    if (reset) {
      return this.reset();
    }

    return this.process();
  }

  protected boot() {
    const container = this.kernel.getContainer();
    this.migrations.forEach((migration) => {
      this.availableMigrationsMap.set((<any>migration).getSignature(), container.get(migration));
    });
  }

  public async getMigrationCollection() {
    const collection = this.config.get('migration.collection', 'migrations');
    const db = this.config.get('migration.db');
    return this.db.getCollectionFromDb(collection, db);
  }

  protected async status(): Promise<string> {
    const dbMigrations = await this.listDbMigrations();
    const availableMigrations = this.availableMigrations;
    const result = [];
    for (const signature of availableMigrations) {
      const info = dbMigrations.find((migration) => migration.signature === signature);
      result.push({ signature, info });
    }

    let output = '';
    result.forEach(({ info, signature }) => {
      output += `${signature}: ${info ? (info.success ? 'success' : 'failed') : 'pending'}\n`;
    });
    return output;
  }

  protected async rollback(round: number): Promise<string> {
    const dbMigrations = await this.listDbMigrations();
    const orderedDbMigrations = dbMigrations.filter((migration) => !!migration.success).reverse();

    let output = '';
    for (let i = 0; i < round; i += 1) {
      const signature = orderedDbMigrations[i].signature;
      if (!this.availableMigrationsMap.has(signature)) {
        throw new Error(`Migration not found: ${signature}`);
      }
      const r = await this.applyMigrationAndSave(this.availableMigrationsMap.get(signature), true);
      output += `${r.signature}: ${r.success ? 'success' : 'failure'}\n`;
    }

    return output;
  }

  protected async reset() {
    const dbMigrations = await this.listDbMigrations();
    return this.rollback(dbMigrations.length);
  }

  protected async process(): Promise<string> {
    const dbMigrations = await this.listDbMigrations();
    let output = '';
    for (const migrationSignature of this.availableMigrations) {
      if (!dbMigrations.find((m) => m.signature === migrationSignature && !!m.success)) {
        const r = await this.applyMigrationAndSave(this.availableMigrationsMap.get(migrationSignature));
        output += `${r.signature}: ${r.success ? 'success' : 'failure'}\n`;
      }
    }
    return output;
  }

  protected async listDbMigrations(): Promise<MigrationType[]> {
    try {
      const collection = await this.getMigrationCollection();
      const result = await collection.find({}).toArray();

      return result.map((migration) => {
        const date = 'date' in migration ? migration.date : undefined;
        const success = 'success' in migration ? migration.success : undefined;
        return {
          date,
          success,
          signature: migration._id,
        };
      });
    } catch {
      return [];
    }
  }

  protected get availableMigrations(): string[] {
    return Array.from(this.availableMigrationsMap.keys());
  }

  protected async saveMigration(data: MigrationType, reverse: boolean = false): Promise<boolean> {
    const collection = await this.getMigrationCollection();
    if (!reverse) {
      const dbData = {
        _id: data.signature,
        date: data.date,
        success: data.success,
      };

      // tslint:disable-next-line: no-shadowed-variable
      const { result } = await collection.replaceOne({ _id: dbData._id }, dbData, { upsert: true });
      if (result.ok !== 1) {
        return false;
      }

      return true;
    }

    const { result } = await collection.deleteOne({ _id: data.signature });
    if (result.ok !== 1) {
      return false;
    }

    return true;
  }

  protected async applyMigrationAndSave(migration: ParentMigration, reverse: boolean = false): Promise<MigrationType> {
    const result = await this.applyMigration(migration, reverse);
    await this.saveMigration(result, reverse);
    return result;
  }

  protected async applyMigration(migration: ParentMigration, reverse: boolean = false): Promise<MigrationType> {
    try {
      if (reverse) {
        await migration.down();
      } else {
        await migration.up();
      }
      return {
        signature: (<any>migration).constructor.getSignature(),
        date: new Date(),
        success: true,
      };
    } catch (e) {
      return {
        signature: (<any>migration).constructor.getSignature(),
        date: new Date(),
        success: false,
      };
    }
  }
}
