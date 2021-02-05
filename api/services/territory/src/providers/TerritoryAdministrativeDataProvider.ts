import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import axios from 'axios';

// import {
//   TerritoryAdministrativeDataProviderInterfaceResolver,
//   TerritoryAdministrativeDataProviderInterface,
// } from '../interfaces/TerritoryAdministrativeDataProviderInterface';

export enum Level {
  Region = 'region',
  District = 'district',
  City = 'town',
}

interface Name {
  name: string;
}

interface Code {
  code: string;
}

interface TerritoryId {
  territory_id: number;
}

interface Geo {
  shape: any;
  population: number;
  surface: number;
}

@provider({
//   identifier: TerritoryAdministrativeDataProviderInterfaceResolver,
})
export class TerritoryAdministrativeDataProvider
//  implements TerritoryAdministrativeDataProviderInterface 
 {
  public readonly baseApiEndpoint = 'https://geo.api.gouv.fr';
  public readonly territoryTable = 'territory.territories';
  public readonly territoryCodeTable = 'territory.territory_codes';
  public readonly territoryRelationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection) {}

  async listRegions(): Promise<(Name&Code)[]> {
    const endpoint = `${this.baseApiEndpoint}/regions`;
    const result = await axios.get(endpoint);
    return result.data.map(r => ({ name: r.nom, code: r.code }));
  }

  async listDistrictsByRegionCode(code: string): Promise<(Name&Code)[]> {
    const endpoint = `${this.baseApiEndpoint}/regions/${code}/departements`;
    const result = await axios.get(endpoint);
    return result.data.map(r => ({ name: r.nom, code: r.code }));
  }

  async listCitiesByDistrictCode(code: string): Promise<(Name&Code&Geo)[]> {
    const endpoint = `${this.baseApiEndpoint}/departements/${code}/communes?fields=nom,code,contour,surface,population`;
    const result = await axios.get(endpoint);
    return result.data.map(r => ({ name: r.nom, code: r.code, shape: r.contour, population: r.population, surface: r.surface }));
  }

  private getCodeType(level: Level): string {
    return level === Level.District ? 'codedep' : 'insee';
  }

  async getTerritoriesIdByCodes<T extends Name&Code>(level: Level, data: T[]): Promise<(T&TerritoryId)[]> {
    const codeType = this.getCodeType(level);

    const query = {
      text: `
        WITH data AS (
          SELECT * FROM unnest($1::varchar[]) as code
        ) SELECT
            d.code as code,
            tc.territory_id as territory_id
          FROM data as d
          LEFT JOIN ${this.territoryCodeTable} as tc
            ON tc.type = $2::varchar AND
              tc.value = d.code
      `,
      values: [data, codeType],
    };
    const result = await this.connection.getClient().query(query);
    return data.map(d => ({...d, territory_id: result.rows.find(r => r.code === d.code).territory_id }));
  }

  async createTerritories<T extends Name&Code & Partial<Geo>>(level: Level, data: T[]): Promise<(T&TerritoryId)[]> {
    const { name, geo, surface, population } = data.reduce((acc, t) => {
      acc.name.push(t.name);
      acc.geo.push(t.shape);
      acc.population.push(t.population);
      acc.surface.push(surface);
      return acc;
    }, { name: [], geo: [], surface: [], population: []});

    const query = {
      text: `
        INSERT INTO ${this.territoryTable} (level, name, geo, surface, population)
        SELECT
          $1::territory.territory_level_enum,
          name,
          ST_AsGeoJSON(geo),
          surface,
          population
        FROM UNNEST(
          $2::varchar[],
          $3::json[],
          $4::int[],
          $5::int[]
        ) AS u(name, geo, surface, population)
        RETURNING _id, name
      `,
      values: [
        level,
        name,
        geo,
        surface,
        population
      ],
    };

    const result = await this.connection.getClient().query(query);
    return data.map(d => ({...d, territory_id: result.rows.find(r => r.name === d.name)._id }));
  }

  async updateTerritories<T extends Name&Code&TerritoryId&Partial<Geo>>(level: Level, territoriesData: T[]): Promise<void> {
    const { territory_id, name, geo, surface, population } = territoriesData.reduce((acc, t) => {
      acc.territory_id.push(t.territory_id);
      acc.name.push(t.name);
      acc.geo.push(t.shape);
      acc.population.push(t.population);
      acc.surface.push(t.surface);
      return acc;
    }, { territory_id: [], name: [], geo: [], surface: [], population: []});

    const query = {
      text: `
        UPDATE ${this.territoryTable} SET
          level = sub.level,
          name = sub.name,
          geo = sub.geo,
          surface = sub.surface,
          population = sub.population
        FROM (
          SELECT
            $1::territory.territory_level_enum,
            name,
            ST_AsGeoJSON(geo),
            surface,
            population
          FROM UNNEST(
            $2::int[],
            $3::varchar[],
            $4::json[],
            $5::int[],
            $6::int[]
          ) AS u(territory_id, name, geo, surface, population)
        ) as sub
        WHERE territories._id = sub.territory_id
      `,
      values: [
        level,
        territory_id,
        name,
        geo,
        surface,
        population,
      ]
    };

    await this.connection.getClient().query(query);
  }

  async ensureRelation<T extends TerritoryId>(parent: number, children: T[]): Promise<void> {
    // CATCH errors if intermediate territory (ie, towngroup)
    const query = {
      text: `
        INSERT INTO ${this.territoryRelationTable} (parent_territory_id, child_territory_id)
        SELECT
          $1::int
          child
        FROM unnest($2::int[]) as child
        ON CONFLICT (territory_relation_parent_territory_id_child_territory_id_key) DO NOTHING
      `,
      values: [parent, children.map(t => t.territory_id)],
    };
    await this.connection.getClient().query(query);
  }

  async ensureCode<T extends TerritoryId&Code>(level: Level, data: T[]): Promise<void> {
    const codeType = this.getCodeType(level);
    const { territory_id, value } = data.reduce((arr, d) => {
      arr.territory_id.push(d.territory_id);
      arr.value.push(d.code);
      return arr;
    }, {territory_id: [], value: []});

    const query = {
      text: `
        INSERT INTO ${this.territoryCodeTable} (type, territory_id, value)
        SELECT
          $1::varchar
          territory_id,
          value
        FROM unnest($2::int[], $3::varchar) as u(territory_id, value)
        ON CONFLICT (territory_codes_territory_id_type_value_key) DO NOTHING
      `,
      values: [codeType, territory_id, value],
    };
    await this.connection.getClient().query(query);
  }

  async syncData<T extends Name&Code>(level: Level, data: T[], parentId?: number): Promise<(T&TerritoryId)[]> {
    const dataWithIds = await this.getTerritoriesIdByCodes(level, data);
    await this.updateTerritories(level, dataWithIds.filter(d => d.territory_id));
    const missingIds = await this.createTerritories(level, dataWithIds.filter(d => !d.territory_id));
    const mergedData = dataWithIds.map(d => {
      if (d.territory_id) { return d }
      return missingIds.find(t => t.code === d.code);
    });

    await this.ensureCode(level, mergedData);
    if (parentId) {
      await this.ensureRelation(parentId, mergedData);
    }
    return mergedData;
  }
}
