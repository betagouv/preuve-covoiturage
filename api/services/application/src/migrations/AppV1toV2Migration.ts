import { injectable, ConfigInterfaceResolver, EnvInterfaceResolver } from '@ilos/common';
import { ParentMigration } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

@injectable()
export class AppV1toV2Migration extends ParentMigration {
  readonly signature = '201909271429.appV1toV2Migration';
  protected client;

  constructor(protected env: EnvInterfaceResolver, protected config: ConfigInterfaceResolver) {
    super();
  }

  async up(): Promise<void> {
    const connection = new MongoConnection({
      connectionString: this.config.get('mongo.connectionString'),
    });
    await connection.up();
    const client = connection.getClient();
    const dbOperators = client.db(process.env.APP_MONGO_DB).collection('operators');
    const dbApplications = client.db(process.env.APP_MONGO_DB).collection('applications');

    let newApps = [];
    for await (const op of dbOperators.find({})) {
      if ('applications' in op) {
        newApps = newApps.concat(
          op.applications.map((app) => ({
            _id: app._id,
            name: app.name,
            operator_id: op._id,
            permissions: app.permissions,
            created_at: app.createdAt,
          })),
        );
      }
    }

    console.log(`> found and converted ${newApps.length} applications`);

    const inserts = [];
    newApps.forEach((app) => {
      inserts.push(
        (async (): Promise<any> => {
          const exists = await dbApplications.findOne({ _id: app._id });
          if (!exists) return dbApplications.insertOne(app);
        })(),
      );
    });

    await Promise.all(inserts);

    // remove applications from the operators
    await dbOperators.updateMany({}, { $unset: { applications: 1 } });
    console.log('> deleted .applications from all operators');
  }

  async down(): Promise<void> {
    // No down migration
  }
}
