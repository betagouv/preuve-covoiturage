import { injectable, ConfigInterfaceResolver, EnvInterfaceResolver } from '@ilos/common';
import { ParentMigration } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

@injectable()
export class ContactsSchemaMigration extends ParentMigration {
  readonly signature = '201910141429.contactsSchemaMigration';
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
    const dbUsers = client.db(process.env.APP_MONGO_DB).collection('users');

    // load all users
    const users = await dbUsers.find({}, { projection: { firstname: 1, lastname: 1, email: 1, phone: 1 } }).toArray();

    // Find all operators having contacts as ObjectIds
    const updates = [];
    await dbOperators
      .find({
        $or: [
          { 'contacts.technical': { $type: 7 } },
          { 'contacts.rgpd_dpo': { $type: 7 } },
          { 'contacts.rgpd_controller': { $type: 7 } },
        ],
      })
      .forEach((operator) => {
        const contacts = {};

        // build contacts with built technical, gdpr... entries
        Object.keys(operator.contacts).forEach((t) => {
          if (!operator.contacts[t]) return;

          // translate key names
          const type = t.replace('rgpd', 'gdpr');

          // search for a matching user
          const user = users.find(({ _id }) => _id.toString() === operator.contacts.technical.toString());
          if (!user) return;
          Object.keys(user).forEach((k) => {
            if (k === '_id') return;
            if (user[k]) {
              contacts[type] = contacts[type] || {};
              contacts[type][k] = contacts[type][k] || {};
              contacts[type][k] = user[k];
            }
          });
        });

        updates.push(dbOperators.updateOne({ _id: operator._id }, { $set: { contacts } }));
      });

    await Promise.all(updates);
  }

  async down(): Promise<void> {
    // No down migration
    // After the migration, contacts are not required to be existing users.
    // This makes reverting to an ObjectId impossible.
  }
}
