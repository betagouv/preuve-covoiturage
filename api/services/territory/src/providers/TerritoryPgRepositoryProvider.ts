import { provider, NotFoundException, KernelInterfaceResolver, ConflictException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';
import {
  ParamsInterface as CreateParams,
  ResultInterface as CreateResultInterface,
} from '../shared/territory/create.contract';

import { TerritoryDbMetaInterface } from '../shared/territory/common/interfaces/TerritoryDbMetaInterface';
import {
  TerritoryRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterface,
} from '../interfaces/TerritoryRepositoryProviderInterface';
import { UiStatusRelationDetails } from '../shared/territory/relationUiStatus.contract';

import {
  TerritoryQueryInterface,
  SortEnum,
  ProjectionFieldsEnum,
  directFields,
  allAncestorRelationFieldEnum,
  allCompanyFieldEnum,
  allTerritoryQueryCompanyFields,
  allTerritoryQueryRelationFields,
  TerritoryQueryEnum,
  allTerritoryQueryDirectFields,
  allTerritoryQueryFields,
} from '../shared/territory/common/interfaces/TerritoryQueryInterface';
import { TerritoryParentChildrenInterface } from '../shared/territory/common/interfaces/TerritoryChildrenInterface';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryPgRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = 'territory.territories';
  public readonly relationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async updateViews() {
    await this.connection
      .getClient()
      .query({ text: 'REFRESH MATERIALIZED VIEW territory.territories_view;', values: [] });
  }

  async getDirectRelation(id: number): Promise<TerritoryParentChildrenInterface> {
    const query = {
      text: `WITH 
      base_relation AS(
          SELECT 
              tv._id AS base_id,
              tv.descendants,
              tv.ancestors
          FROM territory.territories_view AS tv
          WHERE tv._id = $1
      ),
      children AS(
          SELECT 
              tr.parent_territory_id AS base_id,
              t._id,
              t.name 
          FROM territory.territory_relation AS tr
          INNER JOIN territory.territories AS t ON (t._id = tr.child_territory_id AND tr.parent_territory_id = $1)
      ),
      
      parent AS(
          SELECT
              tr.child_territory_id AS base_id,
              t._id,
              t.name
          FROM territory.territory_relation AS tr
          INNER JOIN territory.territories AS t ON (t._id = tr.parent_territory_id AND tr.child_territory_id = $1)
      )
      SELECT 
          base_relation.base_id AS _id,
          row_to_json(parent) AS parent,
          to_json(array_remove(
            array_agg(CASE WHEN children IS NOT NULL THEN children ELSE NULL END), 
            NULL)
          ) AS children,
          base_relation.descendants AS descendant_ids,
          base_relation.ancestors AS ancestor_ids
          FROM base_relation
          LEFT JOIN children ON children.base_id = base_relation.base_id
          LEFT JOIN parent ON children.base_id = base_relation.base_id
          GROUP BY parent.*,base_relation.base_id,base_relation.descendants,base_relation.ancestors;
      
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows.length > 0 ? result.rows[0] : [];
  }

  async getRelationUiStatusDetails(id: number): Promise<UiStatusRelationDetails[]> {
    const getQuery = {
      text: `SELECT ui_status from ${this.table} WHERE _id=$1`,
      values: [id],
    };

    const territoryUiStatus = await this.connection.getClient().query(getQuery);

    if (!territoryUiStatus.rowCount) {
      return null;
    }

    const status = territoryUiStatus.rows[0].ui_status;

    if (!status || !status.ui_selection_state) return null;

    const selectionState = status.ui_selection_state;
    const flatIds = [];

    function getId(selState) {
      if (selState && selState.length) {
        selState.forEach((child) => {
          flatIds.push(child.id);
          if (child.children) getId(child.children);
        });
      }
    }
    getId(selectionState);

    const getChildrenQuery = {
      text: `SELECT t._id,t.name,array_to_json(array_agg(tc.*)) children from territory.territories t
      LEFT JOIN territory.territory_relation tr ON tr.parent_territory_id = t._id
      LEFT JOIN territory.territories tc ON tr.child_territory_id = tc._id
      
      WHERE t._id = ANY ($1::int[])
      GROUP BY t._id`,
      values: [`{${flatIds.join(',')}}`],
    };

    const childrenRes = await this.connection.getClient().query(getChildrenQuery);

    const territories = childrenRes.rows;
    function consolidateState(selectionState, list = [], baseChildren = null) {
      selectionState.forEach((selState) => {
        const terr = territories.find((element) => element._id === selState.id);
        if (terr) {
          const completeState = {
            id: terr._id,
            name: terr.name,
            state: selState.state,
            children: null,
          };

          if (selState.children && selState.children.length > 0) {
            completeState.children = [];
            consolidateState(selState.children, completeState.children, terr.children);
          }

          list.push(completeState);
        }
      });

      // complete non selected children
      if (baseChildren) {
        baseChildren.forEach((baseChild) => {
          if (!selectionState.find((state) => state.id === baseChild._id)) {
            list.push({
              id: baseChild._id,
              name: baseChild.name,
              state: 0,
              children: null,
            });
          }
        });
      }

      return list;
    }

    return consolidateState(selectionState);
    // return null;
  }

  /**
   * Get childrens if all of intermediate territory
   * Intermediate territory are elements which :
   *   is ancestors of request territories
   *   with at least to relation (ancestor of at least to direct children )
   *   is not ancestor of actual requested territory
   * @param id Id of requested territory
   */
  // async getTerritoryIntermediateRelationData(id: number): Promise<TerritoryChildrenInterface[]> {
  //   const query = {
  //     text: `WITH
  //   base_relation AS (
  //       SELECT
  //           tv.*
  //       FROM territory.territories_view AS tv
  //       WHERE tv._id = $1
  //   ),
  //   ancestors_flat AS (
  //       SELECT
  //           unnest(tv.ancestors) AS ancestors
  //       FROM territory.territories_view AS tv
  //       INNER JOIN base_relation AS br ON tv._id = ANY (br.children)
  //   ),
  //   ancestors_ignore AS (
  //       SELECT
  //       unnest(base_relation.ancestors) AS ancestors_ignore

  //       FROM base_relation
  //   ),
  //   ancestors_count AS (
  //       SELECT
  //           ancestors_flat.ancestors,
  //           COUNT(*) AS ancestors_count
  //       FROM ancestors_flat

  //       LEFT JOIN ancestors_ignore AS ai ON ai.ancestors_ignore = ancestors_flat.ancestors
  //       WHERE ai.ancestors_ignore is NULL AND ancestors_flat.ancestors != $1

  //       GROUP BY ancestors_flat.ancestors
  //   )
  //   SELECT
  //       tv._id as parent_id,
  //       array_to_json(array_agg(row_to_json(t))) as children
  //       FROM ancestors_count ac
  //   INNER JOIN territory.territories_view AS tv ON ancestors_count > 1 AND tv._id = ac.ancestors
  //   INNER JOIN territory.territories AS t ON t._id = ANY(tv.children)
  //   GROUP BY tv._id`,
  //     values: [id],
  //   };

  //   const result = await this.connection.getClient().query(query);
  //   return result.rows;
  // }

  async find(
    query: TerritoryQueryInterface,
    sort: SortEnum[],
    projection: ProjectionFieldsEnum,
  ): Promise<TerritoryDbMetaInterface> {
    const selectsFields = [];
    const joins = [];
    const whereConditions = [];
    const values = [];
    let includeRelation = false;
    let includeCompany = false;
    // let includeGeo = false;
    function autoBuildAncestorJoin(): void {
      if (!includeRelation) {
        includeRelation = true;
        joins.push('LEFT JOIN territory.territories_view tv ON(tv._id = t._id)');
      }
    }

    function autoBuildCompanyJoin(): void {
      if (!includeCompany) {
        includeCompany = true;
        joins.push('LEFT JOIN company.companies c ON(t.company_id = c._id)');
      }
    }

    // build select
    projection.forEach((field) => {
      switch (true) {
        case directFields.indexOf(field) !== -1:
          selectsFields.push(`t.${field}`);
          break;
        case allAncestorRelationFieldEnum.indexOf(field) !== -1:
          selectsFields.push(`tv.${field}`);
          autoBuildAncestorJoin();
          break;

        case allCompanyFieldEnum.indexOf(field) !== -1:
          selectsFields.push(`c.${field}`);
          autoBuildCompanyJoin();
          break;
        default:
          throw new Error(`${field} not supported for territory find select builder`);
          break;
      }
    });

    // build filter
    const queryFields: { field: TerritoryQueryEnum; value: any }[] = allTerritoryQueryFields
      .filter((field) => (query as Record<string, any>).hasOwnProperty(field))
      .map((field) => ({ field, value: (query as any)[field] }));
    queryFields.forEach((hash) => {
      switch (true) {
        case allTerritoryQueryDirectFields.indexOf(hash.field) !== -1:
          whereConditions.push(`t.${hash.field} = $${values.length + 1}`);
          values.push(hash.value.toString());
          break;
        case allTerritoryQueryRelationFields.indexOf(hash.field) !== -1:
          // whereConditions.push(`tv.${hash.field} = $${values.length + 1}`);
          switch (hash.field) {
            case TerritoryQueryEnum.HasAncestorId:
              whereConditions.push(`$${values.length + 1} = ANY (tv.ancestors)`);
              break;
            case TerritoryQueryEnum.HasDescendantId:
              whereConditions.push(`$${values.length + 1} = ANY (tv.descendants)`);
              break;
            case TerritoryQueryEnum.HasChildId:
              whereConditions.push(`$${values.length + 1} = ANY (tv.children)`);
              break;

            case TerritoryQueryEnum.HasParentId:
              whereConditions.push(`$${values.length + 1} = tv.parent`);
              break;
          }
          values.push(hash.value.toString());
          autoBuildAncestorJoin();
          break;
        case allTerritoryQueryCompanyFields.indexOf(hash.field) !== -1:
          whereConditions.push(`c.${hash.field.replace('company_', '')} = $${values.length + 1}`);
          values.push(hash.value.toString());
          autoBuildCompanyJoin();
          break;
        case hash.field === TerritoryQueryEnum.Search:
          const whereOr = [];
          hash.value
            .toString()
            .split(' ')
            .forEach((word) => {
              whereOr.push(`LOWER(t.name) LIKE $${values.length + 1}`);
              values.push(`%${word.toLowerCase()}%`);
            });

          whereConditions.push(`(${whereOr.join(' OR ')})`);
          break;
        default:
          throw new Error(`${hash.field} not supported for territory find query filter`);
          break;
      }
    });

    // TODO: implement switch for edge cases
    const finalSort = sort.map((sortField) => `t.${sort}`);

    const finalQuery = {
      text: `SELECT ${selectsFields.join(',')} \n FROM ${this.table} t \n ${joins.join(`\n`)} ${
        whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
      } 
      ${finalSort.length ? ` ORDER BY ${finalSort.join(',')}` : ''}`,
      values,
    };
    console.log(finalQuery.text, finalQuery.values);

    const result = await this.connection.getClient().query(finalQuery);

    if (result.rowCount === 0) {
      return undefined;
    }
    const territory = result.rows[0];

    return territory;
  }

  async hasDoubleSiretThenFail(siret: string, id = 0): Promise<void> {
    const query = {
      text: `SELECT * from ${this.table} WHERE siret = $1 AND _id != $2 `,
      values: [siret, id],
    };

    const rowCount = (await this.connection.getClient().query(query)).rowCount;
    console.log('rowCount : ', rowCount);
    if (rowCount !== 0) throw new ConflictException('Double siret is not allowed for territory ' + id);
  }

  async all(): Promise<TerritoryDbMetaInterface[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE deleted_at IS NULL
      `,
      values: [],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  async create(data: CreateParams): Promise<CreateResultInterface> {
    const fields = ['name', 'shortname', 'level', 'contacts', 'address', 'active', 'activable'];

    const values: any[] = [
      data.name,
      data.shortname || '',
      data.level,
      data.contacts || '{}',
      data.address || '{}',
      data.active,
      data.activable,
    ];

    if (data.density !== undefined) {
      fields.push('density');
      values.push(data.density);
    }

    if (data.company_id) {
      fields.push('company_id');
      values.push(data.company_id);
    }

    if (data.ui_status) {
      fields.push('ui_status');
      values.push(JSON.stringify(data.ui_status));
    }

    const query = {
      text: `
        INSERT INTO ${this.table}
        (
          ${fields.join(',')}
        )
        VALUES (${fields.map((data, ind) => `$${ind + 1}`).join(',')} )
        RETURNING *
      `,

      values,
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
    }

    const resultData = result.rows[0];

    await this.updateRelations(resultData._id, data.children);

    await this.updateViews();

    return resultData;
  }

  async updateRelations(parentId: number, children: number[], deleteOld = false) {
    if (deleteOld) {
      const deleteQuery = {
        text: `DELETE FROM ${this.relationTable} WHERE parent_territory_id = $1`,
        values: [parentId],
      };

      await this.connection.getClient().query(deleteQuery);
    }

    if (children) {
      console.log(children);
      for (const childId of children) {
        const insertQuery = {
          text: `INSERT INTO ${this.relationTable}(parent_territory_id,child_territory_id) VALUES($1,$2)`,
          values: [parentId, childId],
        };

        await this.connection.getClient().query(insertQuery);
      }
    }
  }

  async delete(id: number): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`operator not found (${id})`);
    }

    return;
  }

  async update(data: PatchParamsInterface): Promise<CreateResultInterface> {
    const fields = [
      'name',
      'shortname',
      'level',
      'contacts',
      'address',
      'active',
      'activable',
      'density',
      'company_id',
      'ui_status',
    ];

    const values: any[] = [
      data.name,
      data.shortname || '',
      data.level,
      data.contacts || '{}',
      data.address || '{}',
      data.active,
      data.activable,
      data.density ? data.density : null,
      data.company_id ? data.company_id : null,
      data.ui_status ? data.ui_status : '{}',
    ];

    // if (data.density !== undefined) {
    //   fields.push('density');
    //   values.push(data.density);
    // }

    // if (data.company_id) {
    //   fields.push('company_id');
    //   values.push(data.company_id);
    // }

    // if (data.ui_status) {
    //   fields.push('ui_status');
    //   values.push(JSON.stringify(data.ui_status));
    // }

    const query = {
      text: `
        UPDATE ${this.table}
        SET ${fields.map((val, ind) => `${val} = $${ind + 1}`).join(',')}
        WHERE _id=${data._id}
      `,

      values,
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Unable to update territory (${JSON.stringify(data)})`);
    }

    // const resultData = result.rows[0];

    await this.updateRelations(data._id, data.children, true);

    await this.updateViews();

    return null;
  }

  async patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbMetaInterface> {
    const updatablefields = [
      'siret',
      'name',
      'shortname',
      'company',
      'address',
      'contacts',
      'parent_id',
      'cgu_accepted_at',
      'cgu_accepted_by',
    ].filter((k) => Object.keys(patch).indexOf(k) >= 0);

    const sets = {
      text: ['updated_at = NOW()'],
      values: [],
    };

    for (const fieldName of updatablefields) {
      sets.text.push(`${fieldName} = $#`);
      sets.values.push(patch[fieldName]);
    }

    const query = {
      text: `
      UPDATE ${this.table}
        SET ${sets.text.join(',')}
        WHERE _id = $#
        AND deleted_at IS NULL
        RETURNING *
      `,
      values: [...sets.values, id],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new NotFoundException(`territory not found (${id})`);
    }

    return result.rows[0];
  }

  async findByInsee(insee: string): Promise<TerritoryDbMetaInterface> {
    throw new Error('This is not implemented here'); // move to normalization service
  }

  async findByPosition(lon: number, lat: number): Promise<TerritoryDbMetaInterface> {
    throw new Error('This is not implemented here'); // move to normalization servie
  }
}
