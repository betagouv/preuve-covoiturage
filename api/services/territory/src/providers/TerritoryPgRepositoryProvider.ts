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
import { TerritoryLevelEnum } from '../shared/territory/common/interfaces/TerritoryInterface';

import {
  TerritoryQueryInterface,
  SortEnum,
  ProjectionFieldsEnum,
  directFields,
  allTerritoryCodeEnum,
  allAncestorRelationFieldEnum,
  allCompanyFieldEnum,
  allTerritoryQueryCompanyFields,
  allTerritoryQueryRelationFields,
  TerritoryQueryEnum,
  allTerritoryQueryDirectFields,
  allTerritoryQueryFields,
  TerritoryListFilter,
  GeoFieldEnum,
} from '../shared/territory/common/interfaces/TerritoryQueryInterface';
import { TerritoryParentChildrenInterface } from '../shared/territory/common/interfaces/TerritoryChildrenInterface';
import { ContactsInterface } from '../shared/common/interfaces/ContactsInterface';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryPgRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = 'territory.territories';
  public readonly relationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async updateViews(): Promise<any> {
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

    function getId(selState): void {
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
    function consolidateState(selectionState, list = [], baseChildren = null): any[] {
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

  async find(
    query: TerritoryQueryInterface,
    sort: SortEnum[],
    projection: ProjectionFieldsEnum,
    pagination?: TerritoryListFilter,
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
        // joins.push('LEFT JOIN territory.territories_view tv ON(tv._id = t._id)');
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
        case field === GeoFieldEnum.Geo:
          selectsFields.push(`ST_AsGeoJSON(t.${field}) as ${field}`);
          break;

        case directFields.indexOf(field) !== -1:
          selectsFields.push(`t.${field}`);
          break;
        case allTerritoryCodeEnum.indexOf(field) !== -1:
          // case TerritoryCodeEnum.Postcode,
          const tableAliasName = `tc_${field}`;

          /* eslint-disable */
          // prettier-ignore
          selectsFields.push(`array(SELECT value from territory.territory_codes as ${tableAliasName} WHERE territory_id = t._id and type = '${field}') as ${field}`);
        /* eslint-enable */

        case allAncestorRelationFieldEnum.indexOf(field) !== -1:
          // selectsFields.push(`tv.${field}`);
          // autoBuildAncestorJoin();
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
              // whereConditions.push(`$${values.length + 1} = ANY (tv.ancestors)`);
              break;
            case TerritoryQueryEnum.HasDescendantId:
              // whereConditions.push(`$${values.length + 1} = ANY (tv.descendants)`);
              break;
            case TerritoryQueryEnum.HasChildId:
              // whereConditions.push(`$${values.length + 1} = ANY (tv.children)`);
              break;

            case TerritoryQueryEnum.HasParentId:
              // whereConditions.push(`$${values.length + 1} = tv.parent`);
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
      ${finalSort.length ? ` ORDER BY ${finalSort.join(',')}` : ''}
      ${pagination && pagination.skip ? ` OFFSET ${pagination.skip}` : ''}
      ${pagination && pagination.limit ? ` LIMIT ${pagination.skip}` : ''}
      `,
      values,
    };
    // console.log(finalQuery.text, finalQuery.values);

    const result = await this.connection.getClient().query(finalQuery);

    if (result.rowCount === 0) {
      return undefined;
    }
    const territory = result.rows[0];

    // map company to sub object
    if (territory.company_id) {
      territory.company = {};

      allCompanyFieldEnum.forEach((fieldName) => {
        territory.company[fieldName] = territory[fieldName];
        delete territory[fieldName];
      });
    }

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

  async all(
    search?: string,
    levels?: TerritoryLevelEnum[],
    limit?: number,
    skip?: number,
  ): Promise<{ rows: TerritoryDbMetaInterface[]; count: number }> {
    // build search filter
    const searchCondition = search
      ? search.split(/\_|\-|\,|\ /).map((word) => ` LOWER(name) LIKE '%${word.toLowerCase()}%'`)
      : [];

    // build level filter
    if (levels) searchCondition.push(`(${levels.map((level) => `level = '${level}'`).join('OR')})`);

    const searchConditionString = searchCondition && searchCondition.length > 0 ? searchCondition.join('AND') : null;

    const client = this.connection.getClient();

    const countQuery = `SELECT count(*) as territory_count from ${this.table} ${
      searchConditionString ? ` WHERE ${searchConditionString}` : ''
    }`;

    console.log(countQuery);

    const count = parseFloat((await client.query(countQuery)).rows[0].territory_count);

    const query = {
      text: `
        SELECT name,_id FROM ${this.table} t
        WHERE deleted_at IS NULL 
        ${searchConditionString ? ` AND ${searchConditionString}` : ''}

        
        ${limit !== undefined ? ` LIMIT ${limit}` : ''}
        ${skip !== undefined ? ` OFFSET ${skip}` : ''}
      `,
      values: [],
    };

    const result = await client.query(query);
    return { rows: result.rows, count };
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

    // if (data.density !== undefined) {
    //   fields.push('density');
    //   values.push(data.density);
    // }

    if (data.company_id) {
      fields.push('company_id');
      values.push(data.company_id);
    }

    if (data.ui_status) {
      fields.push('ui_status');
      values.push(JSON.stringify(data.ui_status));
    }

    if (data.geo) {
      //   fields.push('geo');
      values.push(`${data.geo}`);
    }

    const query = {
      text: `
        INSERT INTO ${this.table}
        (
          ${fields.join(',')}
          ${data.geo ? ',geo' : ''}
        )
        VALUES (${fields.map((data, ind) => `$${ind + 1}`).join(',')}${
        data.geo ? `,ST_GeomFromGeoJSON($${fields.length + 1})` : ''
      })
        RETURNING *
      `,

      values,
    };

    // console.log('query : ', query);

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
    }

    const resultData = result.rows[0];
    // console.log('updateRelations');
    await this.updateRelations(resultData._id, data.children);
    // console.log('updateViews');

    // await this.updateViews();

    // console.log('data.insee : ', data.insee);

    if (data.insee !== undefined && data.insee.length > 0) {
      const query = {
        text:
          `INSERT INTO territory.territory_codes(territory_id,type,value) VALUES ` +
          data.insee.map((insee) => `($1,'insee',${insee})`).join(','),
        values: [resultData._id],
      };
      // console.log('query : ', query);

      await this.connection.getClient().query(query);
    }

    // console.log('new territory', resultData._id);
    return resultData;
  }

  async updateRelations(parentId: number, children: number[], deleteOld = false): Promise<void> {
    const client = this.connection.getClient();
    if (deleteOld) {
      const deleteQuery = {
        text: `DELETE FROM ${this.relationTable} WHERE parent_territory_id = $1`,
        values: [parentId],
      };

      await client.query(deleteQuery);
    }

    if (children) {
      // console.log(children);

      const values = children.map((childId) => `(${parentId},${childId})`).join(',');

      const insertQuery = `INSERT INTO ${this.relationTable}(parent_territory_id,child_territory_id) VALUES${values}`;

      await client.query(insertQuery);
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
      // 'density',
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
      // data.density ? data.density : null,
      data.company_id ? data.company_id : null,
      data.ui_status ? data.ui_status : '{}',
      // data.geo ? data.geo : null,
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

    if (data.geo) {
      //   fields.push('geo');
      values.push(`${data.geo}`);
    }

    const client = this.connection.getClient();

    const query = {
      text: `
        UPDATE ${this.table}
        SET ${fields.map((val, ind) => `${val} = $${ind + 1}`).join(',')}
        ${data.geo ? `,geo = ST_GeomFromGeoJSON($${fields.length + 1})` : `,geo = NULL`}
        WHERE _id=${data._id}
      `,

      values,
    };

    const result = await client.query(query);
    const cleanInseeQuery = {
      text: `DELETE FROM territory.territory_codes WHERE territory_id = $1 AND type=$2`,
      values: [data._id, 'insee'],
    };

    await client.query(cleanInseeQuery);

    if (data.insee !== undefined && data.insee.length > 0) {
      const query = {
        text:
          `INSERT INTO territory.territory_codes(territory_id,type,value) VALUES ` +
          data.insee.map((insee) => `($1,'insee',${insee})`).join(','),
        values: [data._id],
      };

      await client.query(query);
    }

    if (result.rowCount !== 1) {
      throw new Error(`Unable to update territory (${JSON.stringify(data)})`);
    }

    // const resultData = result.rows[0];

    await this.updateRelations(data._id, data.children, true);

    // await this.updateViews();

    return (
      await client.query({
        text: `SELECT * from ${this.table} WHERE _id = $1`,
        values: [data._id],
      })
    ).rows[0];
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

  async patchContacts(id: number, contacts: ContactsInterface): Promise<TerritoryDbMetaInterface> {
    const query = {
      text: `UPDATE ${this.table} set contacts = $2 WHERE _id = $1`,
      values: [id, JSON.stringify(contacts)],
    };

    const client = this.connection.getClient();
    await client.query(query);

    const modifiedTerritoryRes = await client.query({
      text: `SELECT * FROM ${this.table} WHERE _id = $1`,
      values: [id],
    });
    // if (result.rowCount !== 1) {
    //   throw new NotFoundException(`territory not found (${id})`);
    // }

    // console.log('modifiedTerritoryRes ', id, modifiedTerritoryRes.rows[0]);

    return modifiedTerritoryRes.rowCount > 0 ? modifiedTerritoryRes.rows[0] : 0;
  }

  async findByInsee(insee: string): Promise<TerritoryDbMetaInterface> {
    throw new Error('This is not implemented here'); // move to normalization service
  }

  async findByPosition(lon: number, lat: number): Promise<TerritoryDbMetaInterface> {
    throw new Error('This is not implemented here'); // move to normalization servie
  }
}
