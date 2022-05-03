import { PostgresConnection } from '@ilos/connection-postgres';
import { createDatabase, dropDatabase, migrate } from '@pdc/migrator';
import { parse, Options as ParseOptions } from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { URL } from 'url';
import { companies, Company } from './companies';
import { Operator, operators } from './operators';
import { CreateTerritoryGroupInterface, TerritorySelectorsInterface, territory_groups } from './territories';
import { User, users } from './users';
export class Migrator {
  public connection: PostgresConnection;
  public config: {
    driver: string;
    user: string;
    password: string;
    host: string;
    database: string;
    port: number;
    ssl: boolean;
  };
  public readonly dbName: string;
  public readonly dbIsCreated: boolean;

  constructor(dbUrlString: string, newDatabase = true) {
    const dbUrl = new URL(dbUrlString);
    this.config = {
      driver: 'pg',
      user: dbUrl.username,
      password: dbUrl.password,
      host: dbUrl.hostname,
      database: dbUrl.pathname.replace('/', ''),
      port: parseInt(dbUrl.port),
      ssl: false,
    };
    this.dbIsCreated = newDatabase;
    this.dbName = newDatabase ? `test-${Date.now().valueOf()}` : dbUrl.pathname.replace('/', '');
  }

  async up() {
    this.connection = new PostgresConnection({
      ...this.config,
      database: this.dbName,
    });
    await this.connection.up();
  }

  async create() {
    if (this.dbIsCreated) {
      await createDatabase(this.config, this.dbName);
    }
  }

  async migrate() {
    await migrate({
      ...this.config,
      database: this.dbName,
    });
  }

  async seed() {
    if (!this.connection) {
      await this.up();
    }
    await this.connection.getClient().query(`SET session_replication_role = 'replica'`);

    for (const company of companies) {
      console.debug(`Seeding company ${company.legal_name}`);
      await this.seedCompany(company);
    }

    console.debug(`Seeding geo`);
    await this.seedTerritory();

    for (const operator of operators) {
      console.debug(`Seeding operator ${operator.name}`);
      await this.seedOperator(operator);
    }

    for (const user of users) {
      console.debug(`Seeding user ${user.email}`);
      await this.seedUser(user);
    }

    for (const territory_group of territory_groups) {
      console.debug(`Seeding territory group ${territory_group.name}`);
      await this.seedTerritoyGroup(territory_group);
    }

    /*
          - Territoires
            - company.companies

          - Operateurs
            - operator.operators
            - operator.thumbnails
            - application.applications
            - company.companies
            - territory.territory_operators

          - Politiques
            - policy.policies

          - Trajets
            - acquisition.acquisitions
            - carpool.carpools
            - carpool.identities

          - Liste des tables
            - certificates.**
            - honor.tracking
            - fraudcheck.fraudchecks
            - policy.policy_metas
            - policy.incentives
            +++ VIEWS +++ 
    */
    await this.connection.getClient().query(`SET session_replication_role = 'origin'`);
  }

  protected async *dataFromCsv<P>(filename: string, options: ParseOptions = {}): AsyncIterator<P> {
    const filepath = path.join(__dirname, filename);
    const parser = fs.createReadStream(filepath).pipe(
      parse({
        cast: (v: any) => (v === '' ? null : v),
        ...options,
      }),
    );
    for await (const record of parser) {
      yield record;
    }
  }

  protected async seedFromCsv(filename: string, tablename: string, csvOptions: ParseOptions = {}) {
    const cursor = this.dataFromCsv(filename);
    let done = false;
    do {
      const data = await cursor.next();
      if (data.value && Array.isArray(data.value)) {
        await this.connection.getClient().query({
          text: `INSERT INTO ${tablename} VALUES (${data.value.map((_, i) => `$${i + 1}`).join(', ')})`,
          values: data.value,
        });
      }
      done = !!data.done;
    } while (!done);
  }

  async seedCompany(company: Company) {
    await this.connection.getClient().query({
      text: `
        INSERT INTO company.companies
          (_id, siret, siren, nic, legal_name, company_naf_code, establishment_naf_code, headquarter)
        VALUES (
          $1::int,
          $2::varchar,
          $3::varchar,
          $4::varchar,
          $5::varchar,
          $6::varchar,
          $7::varchar,
          $8::boolean
        )
        ON CONFLICT DO NOTHING
      `,
      values: [
        company._id,
        company.siret,
        company.siren,
        company.nic,
        company.legal_name,
        company.company_naf_code,
        company.establishment_naf_code,
        company.headquarter,
      ],
    });
  }

  async seedOperator(operator: Operator) {
    await this.connection.getClient().query({
      text: `
        INSERT INTO operator.operators
          (_id, name, legal_name, siret, company, address, bank, contacts)
        VALUES (
          $1::int,
          $2::varchar,
          $3::varchar,
          $4::varchar,
          $5::json,
          $6::json,
          $7::json,
          $8::json
        )
        ON CONFLICT DO NOTHING
      `,
      values: [
        operator._id,
        operator.name,
        operator.legal_name,
        operator.siret,
        operator.company,
        operator.address,
        operator.bank,
        operator.contacts,
      ],
    });
  }

  async seedUser(user: User) {
    await this.connection.getClient().query({
      text: `
        INSERT INTO auth.users
          (email, firstname, lastname, password, status, role, territory_id, operator_id)
        VALUES (
          $1::varchar,
          $2::varchar,
          $3::varchar,
          $4::varchar,
          $5::auth.user_status_enum,
          $6::varchar,
          $7::int,
          $8::int
        )
        ON CONFLICT DO NOTHING 
      `,
      values: [
        user.email,
        user.firstname,
        user.lastname,
        user.password, // TODO: use cryptoprovider tcrypt password
        user.status,
        user.role,
        user.territory?._id,
        user.operator?._id,
      ],
    });
  }

  async seedTerritoyGroup(territory_group: CreateTerritoryGroupInterface) {
    const fields = ['_id', 'name', 'shortname', 'contacts', 'address', 'company_id'];

    const values: any[] = [
      territory_group._id,
      territory_group.name,
      '',
      territory_group.contacts,
      territory_group.address,
      territory_group.company_id,
    ];
    const query = {
      text: `
        INSERT INTO territory.territory_group (${fields.join(',')})
        VALUES (${fields.map((data, ind) => `$${ind + 1}`).join(',')})
        RETURNING *
      `,
      values,
    };
    const resultData = await this.connection.getClient().query(query);
    this.syncSelector(resultData.rows[0]._id, territory_group.selector);
  }

  async syncSelector(groupId: number, selector: TerritorySelectorsInterface): Promise<void> {
    const values: [number[], string[], string[]] = Object.keys(selector)
      .map((type) => selector[type].map((value: string | number) => [groupId, type, value.toString()]))
      .reduce((arr, v) => [...arr, ...v], [])
      .reduce(
        (arr, v) => {
          arr[0].push(v[0]);
          arr[1].push(v[1]);
          arr[2].push(v[2]);
          return arr;
        },
        [[], [], []],
      );
    await this.connection.getClient().query({
      text: `
        DELETE FROM territory.territory_group_selector
        WHERE territory_group_id = $1
      `,
      values: [groupId],
    });

    const query = {
      text: `
        INSERT INTO territory.territory_group_selector (
          territory_group_id,
          selector_type,
          selector_value
        ) 
        SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::varchar[])`,
      values,
    };

    await this.connection.getClient().query(query);
  }

  async seedTerritory() {
    await this.seedFromCsv('./geo.csv', 'geo.perimeters');
  }

  async down() {
    if (this.connection) {
      await this.connection.down();
    }
  }

  async drop() {
    if (this.dbIsCreated) {
      await dropDatabase(this.config, this.dbName);
    }
  }
}
