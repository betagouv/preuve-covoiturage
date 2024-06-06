import { NotFoundException, provider } from '/ilos/common/index.ts';
import { PostgresConnection } from '/ilos/connection-postgres/index.ts';
import _ from 'lodash';
import {
  CertificateRepositoryProviderInterface,
  CertificateRepositoryProviderInterfaceResolver,
} from '../interfaces/CertificateRepositoryProviderInterface.ts';
import { CertificateBaseInterface } from '/shared/certificate/common/interfaces/CertificateBaseInterface.ts';
import { CertificateInterface } from '/shared/certificate/common/interfaces/CertificateInterface.ts';
import { Pagination } from '/shared/certificate/list.contract.ts';

type QueryConfig = { text: string; values: any[] };

@provider({
  identifier: CertificateRepositoryProviderInterfaceResolver,
})
export class CertificatePgRepositoryProvider implements CertificateRepositoryProviderInterface {
  public readonly table = 'certificate.certificates';
  public readonly accessLogTable = 'certificate.access_log';

  constructor(protected connection: PostgresConnection) {}

  /**
   * Set the limit and offset for a query
   */
  paginate(query: QueryConfig, pagination?: Pagination): QueryConfig {
    if (!pagination) return query;

    // limit
    query.text += ` LIMIT \$${query.values.length + 1}`;
    query.values.push(pagination.length ? Math.abs(pagination.length) : 25);

    // offset
    query.text += ` OFFSET \$${query.values.length + 1}`;
    query.values.push(pagination.start_index ? Math.abs(pagination.start_index) : 0);

    return query;
  }

  async count(operator_id?: number): Promise<number> {
    const query = operator_id
      ? {
          text: `SELECT COUNT(*) as row_count FROM ${this.table} WHERE operator_id = $1`,
          values: [operator_id],
        }
      : `SELECT COUNT(*) as row_count FROM ${this.table}`;

    const countResult = await this.connection.getClient().query<any>(query);

    return countResult.rows.length > 0 ? countResult.rows[0].row_count : 0;
  }

  async find(withLog = false, pagination?: Pagination): Promise<CertificateInterface[]> {
    const result = await this.connection.getClient().query<any>(
      this.paginate(
        {
          text: `SELECT * FROM ${this.table} ORDER BY created_at DESC`,
          values: [],
        },
        pagination,
      ),
    );

    if (!result.rowCount) return [];

    return (withLog ? this.withLog(result.rows) : result.rows) as CertificateInterface[];
  }

  async findByUuid(uuid: string, operator_id: number | null, withLog = false): Promise<CertificateInterface> {
    const values: [string, number?] = [uuid];
    if (operator_id) values.push(operator_id);

    const result = await this.connection.getClient().query<any>({
      text: `
        SELECT *
        FROM ${this.table}
        WHERE uuid = $1
        ${operator_id ? `AND operator_id = $2` : ''}
        LIMIT 1
      `,
      values,
    });

    if (!result.rowCount) throw new NotFoundException(`Certificate not found: ${operator_id} - ${uuid}`);

    return withLog ? this.withLog(result.rows[0]) : result.rows[0];
  }

  async findByOperatorId(
    operator_id: number,
    withLog = false,
    pagination?: Pagination,
  ): Promise<CertificateInterface[]> {
    const result = await this.connection.getClient().query<any>(
      this.paginate(
        {
          text: `SELECT * FROM ${this.table} WHERE operator_id = $1 ORDER BY created_at DESC`,
          values: [operator_id],
        },
        pagination,
      ),
    );

    if (!result.rowCount) return [];

    return (withLog ? this.withLog(result.rows) : result.rows) as CertificateInterface[];
  }

  async create(params: CertificateBaseInterface): Promise<CertificateInterface> {
    const { identity_uuid, operator_id, start_at, end_at, meta } = params;

    const result = await this.connection.getClient().query<any>({
      text: `
        INSERT INTO ${this.table}
        ( identity_uuid, operator_id, start_at, end_at, meta )
        VALUES ( $1, $2, $3, $4, $5 )
        RETURNING *
      `,
      values: [identity_uuid, operator_id, start_at, end_at, meta],
    });

    if (!result.rowCount) throw new Error('Failed to create certificate');

    return result.rows[0];
  }

  /**
   * merge access_log data to the list of certificates
   */
  private async withLog(
    certificates: CertificateInterface | CertificateInterface[],
  ): Promise<CertificateInterface | CertificateInterface[]> {
    const isMany: boolean = Array.isArray(certificates);
    const certs = (isMany ? certificates : [certificates]) as CertificateInterface[];

    // search for all access_log for all certificate_id
    const result = await this.connection.getClient().query<any>({
      text: `
        SELECT * FROM ${this.accessLogTable}
        WHERE certificate_id = ANY ($1::int[])
        ORDER BY certificate_id
      `,
      values: [_.map(certs, '_id')],
    });

    // merge access_log as a table in each certificate
    const merge = certs.map((cert: CertificateInterface) => ({
      ...cert,
      access_log: result.rows
        .filter((log) => log.certificate_id === cert._id)
        .sort((a, b) => (a.created_at > b.created_at ? 1 : -1)),
    }));

    return isMany ? merge : merge[0];
  }
}
