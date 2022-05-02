import { PostgresConnection } from '@ilos/connection-postgres';
import { createDatabase, dropDatabase, migrate } from '@pdc/migrator';
import { URL } from 'url';
import { companies, Company } from './companies';
import { Operator, operators } from './operators';
import {
  CreateTerritoryGroupInterface,
  territories,
  Territory,
  TerritorySelectorsInterface,
  territory_groups,
} from './territories';
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

    for (const territory of territories) {
      console.debug(`Seeding territory ${territory.name}`);
      await this.seedTerritory(territory);
    }

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
    const fields = ['name', 'shortname', 'contacts', 'address', 'company_id'];

    const values: any[] = [
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

  async seedTerritory(territory: Territory) {
    await this.connection.getClient().query({
      text: `
        INSERT INTO territory.territories
          (_id, name, level, geo, population, surface)
        VALUES
          (
            $1::int, 
            $2::varchar, 
            $3::territory.territory_level_enum, 
            ST_GeomFromGeoJSON($4::json),
            $5::int,
            $6::int
          )
        ON CONFLICT DO NOTHING
      `,
      values: [territory._id, territory.name, territory.level, territory.geo, territory.population, territory.surface],
    });

    await this.connection.getClient().query(`
    SELECT setval('territory.territories__id_seq1', (SELECT MAX(_id) FROM territory.territories)+1);
    `);

    if (territory.insee) {
      const postcodes = territory.postcodes || [];
      await this.connection.getClient().query({
        text: `
            INSERT INTO territory.territory_codes
              (territory_id, type, value)
            SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::varchar[])
            ON CONFLICT
            DO NOTHING 
          `,
        values: [
          ...[
            { territory_id: territory._id, type: 'insee', value: territory.insee },
            ...postcodes.map((c) => ({ territory_id: territory._id, type: 'postcode', value: c })),
          ].reduce(
            (acc, c) => {
              const [tid, ct, cv] = acc;
              tid.push(c.territory_id);
              ct.push(c.type);
              cv.push(c.value);
              return [tid, ct, cv];
            },
            [[], [], []],
          ),
        ],
      });
    }

    if (territory.children && territory.children.length) {
      await this.connection.getClient().query({
        text: `
            INSERT INTO territory.territory_relation 
              (parent_territory_id, child_territory_id)
            SELECT * FROM UNNEST($1::int[], $2::int[])
            ON CONFLICT DO NOTHING
          `,
        values: [
          ...territory.children
            .map((c) => ({ parent: territory._id, child: c._id }))
            .reduce(
              (acc, r) => {
                const [parent, child] = acc;
                parent.push(r.parent);
                child.push(r.child);
                return [parent, child];
              },
              [[], []],
            ),
        ],
      });
    }
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
