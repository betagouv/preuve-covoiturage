import { createDatabase, dropDatabase, migrate } from '@pdc/migrator';
import { PostgresConnection } from '@ilos/connection-postgres';

import { Territory } from './territories';

export class Database {
  protected connection: PostgresConnection;

  constructor(protected dbUrl: string, protected dbName: string) {}


  async create() {
    await createDatabase(this.dbName);
  }

  async migrate() {
    await migrate();
  }

  async seed() {
    /*
          - Territoires
            - territory.territories
            - territory.territory_codes
            - territory.relation
            - company.companies

          - Operateurs
            - operator.operators
            - operator.thumbnails
            - application.applications
            - company.companies
            - territory.territory_operators

          - Utilisateurs
            - auth.users
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
  }

  async seedTerritory(territory: Territory) {
    await this.connection.getClient().query({
      text: `
        INSERT INTO terrritory.territories
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
        ON CONFLICT (_id) DO UPDATE SET
        (
          name,
          level,
          geo,
          population,
          surface
        ) = (
          excluded.name,
          excluded.level,
          excluded.geo,
          excluded.population,
          excluded.surface
        )
      `,
      values: [territory._id, territory.name, territory.level, territory.geo, territory.population, territory.surface],
    });

    if (territory.insee) {
      const postcodes = territory.postcodes || [];
      await this.connection.getClient().query({
        text: `
            INSERT INTO territory.territory_codes
              (territory_id, type, value)
            SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::varchar[])
            ON CONFLICT (territory_id, type)
            DO UPDATE SET value = excluded.value
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
            INSERT INTO territory.territory_relations 
              (parent_territory_id, child_territory_id)
            SELECT * FROM UNNEST($1::int[], $2::int[])
            ON CONFLICT DO NOTHING
          `,
        values: [
          ...territory.children
            .map((c) => ({ parent: territory._id, child: c }))
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

  async drop() {
    await dropDatabase(this.dbName);
  }
}
