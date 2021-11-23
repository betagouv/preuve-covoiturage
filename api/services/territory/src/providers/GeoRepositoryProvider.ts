import { provider, KernelInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ParamsInterface as DropdownParamsInterface } from '../shared/territory/listGeo.contract';

import { TerritoryDropdownInterface } from '../shared/territory/common/interfaces/TerritoryDropdownInterface';

import { TerritoryParentChildrenInterface } from '../shared/territory/common/interfaces/TerritoryChildrenInterface';

import {
  ParamsInterface as FindByInseeParamsInterface,
  ResultInterface as FindByInseeResultInterface,
} from '../shared/territory/findByInsees.contract';
import {
  GeoRepositoryProviderInterfaceResolver,
  GeoRepositoryProviderInterface,
} from '../interfaces/GeoRepositoryProviderInterface';

@provider({
  identifier: GeoRepositoryProviderInterfaceResolver,
})
export class GeoRepositoryProvider implements GeoRepositoryProviderInterface {
  public readonly table = 'territory.territories';
  public readonly relationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async getDirectRelation(id: number | number[]): Promise<TerritoryParentChildrenInterface[]> {
    const ids = typeof id === 'number' ? [id] : id;
    const query = {
      text: `WITH 
      base AS (
        SELECT
          _id,
          territory.get_descendants(ARRAY[_id]::int[]) as descendant_ids,
          territory.get_ancestors(ARRAY[_id]::int[]) as ancestor_ids
          FROM unnest($1::int[]) as _id
        ),
      children AS (
        SELECT
          a.base_id AS _id,
          array_to_json(
            array_agg(
              json_build_object(
                'base_id', a.base_id,
                '_id', a._id,
                'name', a.name
              )
            )
          ) as children
        FROM (
          SELECT
            tr.parent_territory_id AS base_id,
            t._id as _id,
            t.name as name
          FROM base as b
          JOIN territory.territory_relation AS tr ON tr.parent_territory_id = b._id
          JOIN territory.territories AS t ON t._id = tr.child_territory_id
        ) as a
        GROUP BY a.base_id
      ),
      parent AS (
        SELECT 
          a.base_id AS _id,
          array_to_json(
            array_agg(
              json_build_object(
                'base_id', a.base_id,
                '_id', a._id,
                'name', a.name
              )
            )
          ) as parent
        FROM (
          SELECT
            tr.child_territory_id AS base_id,
            t._id,
            t.name 
          FROM base as b
          JOIN territory.territory_relation AS tr ON tr.child_territory_id = b._id
          JOIN territory.territories AS t ON t._id = tr.parent_territory_id
        ) as a
        GROUP BY a.base_id
      )
      SELECT 
          base.*,
          parent.parent AS parent,
          children.children AS children
          FROM base
          LEFT JOIN children ON TRUE
          LEFT JOIN parent ON TRUE;
      `,
      values: [ids],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows.length > 0 ? result.rows : [];
  }

  /**
   * Searchable / scopable dropdown list (_id, name)
   * Can be scoped by territories (searches for all descendants)
   * Default limit is set to 100
   */
  async dropdown(params: DropdownParamsInterface): Promise<TerritoryDropdownInterface[]> {
    const { search, on_territories, limit } = { limit: 100, ...params };

    const where = [];
    const values = [];

    if (on_territories && on_territories.length) {
      where.push(`_id = ANY($${where.length + 1})`);
      values.push(on_territories);
    }

    if (search) {
      where.push(`LOWER(name) LIKE $${where.length + 1}`);
      values.push(`%${search.toLowerCase().trim()}%`);
    }

    // always add the limit
    values.push(limit);

    const results = await this.connection.getClient().query({
      values,
      text: `
        SELECT _id, name FROM ${this.table}
        ${where.length ? ` WHERE ${where.join(' AND ')}` : ''}
        ORDER BY name ASC
        LIMIT $${where.length + 1}
      `,
    });

    return results.rowCount ? results.rows : [];
  }

  async findByInsees(params: FindByInseeParamsInterface): Promise<FindByInseeResultInterface> {
    const client = this.connection.getClient();
    const query = {
      text: `WITH territory_codes AS (
        SELECT 
          tc.territory_id,
          tc.value
        FROM territory.territory_codes tc 
        WHERE 
          tc.type = 'insee' AND 
          tc.value = ANY($1) 
        GROUP BY tc.territory_id,tc.value
        )
        SELECT 
          name,
          _id,
          value as insee
        FROM territory_codes as tc
        INNER JOIN territory.territories as t ON t._id = tc.territory_id; `,

      values: [params.insees],
    };
    const result = await client.query(query);

    return result.rows as FindByInseeResultInterface;
  }
}
