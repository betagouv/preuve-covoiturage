import { provider, NotFoundException, KernelInterfaceResolver, ConflictException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';

import { TerritoryBaseInterface } from '../shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from '../shared/territory/common/interfaces/TerritoryDbMetaInterface';
import {
  TerritoryRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterface,
} from '../interfaces/TerritoryRepositoryProviderInterface';

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

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryPgRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = 'territory.territories';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

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

  async create(data: TerritoryBaseInterface): Promise<TerritoryDbMetaInterface> {
    // TODO: check siret collision method (or not)
    // awaeit this.hasDoubleSiretThenFail(data.siret);

    // TODO: to implement
    throw new Error('Not implemented : query to adapt');
    /*
    const query = {
      text: `
        INSERT INTO ${this.table}
        (
          siret,
          name,
          shortname,

          company,
          address,
          contacts,

          parent_id,
          cgu_accepted_at,
          cgu_accepted_by
        )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )
        RETURNING *
      `,
      
      values: [
        data.siret,
        data.name,
        data.shortname || '',
        data.company || '{}',
        data.address || '{}',
        data.contacts || '{}',
        data.parent_id,
        data.cgu_accepted_at,
        data.cgu_accepted_by,
      ],
    };
    */

    // const result = await this.connection.getClient().query(query);
    // if (result.rowCount !== 1) {
    //   throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
    // }

    // if (data.siret) {
    //   await this.kernel.notify(companyFetchSignature, data.siret, {
    //     channel: { service: 'operator' },
    //     call: { user: { permissions: ['company.fetch'] } },
    //   });
    // }

    // return result.rows[0];
    return null;
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

  // TODO
  async update(data: PatchParamsInterface): Promise<TerritoryDbMetaInterface> {
    // const { _id, ...patch } = data;
    // TODO: to implement
    throw new Error('Not implemented : query to adapt');

    /*  
    await this.hasDoubleSiretThenFail(data.siret, _id);

    if (data.siret) {
      await this.kernel.notify(companyFetchSignature, data.siret, {
        channel: { service: 'operator' },
        call: { user: { permissions: ['company.fetch'] } },
      });
    }

    return this.patch(_id, {
      parent_id: null,
      shortname: null,
      company: '{}',
      address: '{}',
      contact: '{}',
      cgu_accepted_at: null,
      cgu_accepted_by: null,
      ...patch,
    });
    */
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
