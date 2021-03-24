import { provider } from '@ilos/common';

import { PostgresConnection } from '@ilos/connection-postgres';

// import {
//   TerritoryAdministrativeDataProviderInterfaceResolver,
//   TerritoryAdministrativeDataProviderInterface,
// } from '../interfaces/TerritoryAdministrativeDataProviderInterface';

export enum Level {
  Region = 'region',
  District = 'district',
  City = 'town',
}

interface Code {
  type: string;
  value: string;
}

interface TerritoryDataInterface {
  level: Level;
  code: Code[];
  name: string;
  geo?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  surface?: number;
  population?: number;
}

@provider({
  //   identifier: TerritoryAdministrativeDataProviderInterfaceResolver,
})
//  implements TerritoryAdministrativeDataProviderInterface
export class TerritoryAdministrativeDataProvider {
  public readonly geojsonEndpoint =
    'http://etalab-datasets.geo.data.gouv.fr/contours-administratifs/latest/geojson/communes-5m.geojson.gz';
  public readonly baseApiEndpoint = 'https://geo.api.gouv.fr';

  public readonly territoryTable = 'territory.territories';
  public readonly territoryCodeTable = 'territory.territory_codes';
  public readonly territoryRelationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection) {}

  async updateOrCreate(data: TerritoryDataInterface | TerritoryDataInterface[]): Promise<void> {
    const queryData = (Array.isArray(data) ? data : [data])
      .map(({ code, ...td }) => ({
        ...td,
        insee: code.find((c) => c.type === 'insee').value,
        postcode: code.find((c) => c.type === 'postcode').value,
      }))
      .reduce(
        (acc, td) => {
          acc.level.push(td.level);
          acc.insee.push(td.insee);
          acc.postcode.push(td.postcode);
          acc.name.push(td.name);
          acc.geo.push(td.geo);
          acc.surface.push(td.surface);
          acc.population.push(td.population);
          return acc;
        },
        {
          level: [],
          insee: [],
          postcode: [],
          name: [],
          geo: [],
          surface: [],
          population: [],
        },
      );

    const query = {
      text: `
        WITH input AS (
          SELECT 
            level::territory.territory_level_enum,
            insee,
            postcode,
            name,
            ST_GeomFromGeoJSON(geo) as geo,
            surface,
            population
          FROM UNNEST(
            $1::varchar[],
            $2::varchar[],
            $3::varchar[],
            $4::varchar[],
            $5::json[],
            $6::integer[],
            $7::integer[]
          ) AS u(
            level,
            insee,
            postcode,
            name,
            geo,
            surface,
            population
          )
          WHERE insee IS NOT NULL AND level IS NOT NULL
        ),
        exists AS (
          SELECT
            c.territory_id,
            i.insee
          FROM ${this.territoryCodeTable} AS c
          JOIN input AS i
            ON i.insee = c.value and c.type = 'insee'
        ),
        upd AS (
          UPDATE ${this.territoryTable} AS t SET
            name = COALESCE(sub.name, t.name),
            level = COALESCE(sub.level, t.level),
            geo = COALESCE(sub.geo, t.geo),
            surface = COALESCE(sub.surface, t.surface),
            population = COALESCE(sub.population, t.population)
          FROM (
            SELECT
              e.territory_id as _id,
              i.name,
              i.level,
              i.geo,
              i.surface,
              i.population
            FROM input AS i 
            JOIN exists AS e
              ON e.insee = i.insee
            ) AS sub
          WHERE t._id = sub._id
          RETURNING t._id
        ),
        ins AS (
          INSERT INTO ${this.territoryTable} AS t (
            name,
            level,
            geo,
            surface,
            population
          ) SELECT
            i.name,
            i.level,
            i.geo,
            i.surface,
            i.population
          FROM input AS i
          LEFT JOIN exists AS e
            ON e.insee = i.insee
          WHERE e.insee IS NULL
          RETURNING t._id, (SELECT insee FROM input WHERE name = t.name) as insee
        ),
        codes AS (
          INSERT INTO ${this.territoryCodeTable} (territory_id, type, value)
          SELECT
            n._id as territory_id,
            'insee' as type,
            n.insee as value
          FROM ins AS n
          WHERE n.insee IS NOT NULL
          UNION
          SELECT
            n._id as territory_id,
            'postcode' as type,
            i.postcode as value
          FROM ins AS n
          JOIN input AS i
            ON i.insee = n.insee
          WHERE i.postcode IS NOT NULL
          UNION
          SELECT
            e.territory_id AS territory_id,
            'postcode' AS type,
            i.postcode AS value
          FROM exists AS e
          JOIN input AS i
            ON i.insee = e.insee
          WHERE i.postcode IS NOT NULL
          ON CONFLICT DO NOTHING
        )
        SELECT 
          (SELECT count(*) FROM ins) as inserted,
          (SELECT count(*) FROM upd) as updated
      `,
      values: [
        queryData.level,
        queryData.insee,
        queryData.postcode,
        queryData.name,
        queryData.geo,
        queryData.surface,
        queryData.population,
      ],
    };

    await this.connection.getClient().query(query);
  }

  async link(parent: Code[], children: Code[][]): Promise<void> {
    const parent_insee = parent.find((c) => c.type === 'insee').value;
    const children_insee = children.map((cc) => cc.find((cdc) => cdc.type === 'insee').value);

    const query = {
      text: `
        WITH data AS (
          SELECT
            (
              SELECT
                territory_id
              FROM ${this.territoryCodeTable}
              WHERE
                value = $1::varchar
                AND type = 'insee'
            ) as parent_territory_id,
            territory_id as child_territory_id
          FROM ${this.territoryCodeTable}
          WHERE
            value = ANY($2::varchar[])
            AND type = 'insee'   
        ),
        INSERT INTO ${this.territoryRelationTable} (parent_territory_id, child_territory_id)
        ON CONFLICT (territory_relation_parent_territory_id_child_territory_id_key) DO NOTHING
      `,
      values: [parent_insee, children_insee],
    };
    await this.connection.getClient().query(query);
  }
}
