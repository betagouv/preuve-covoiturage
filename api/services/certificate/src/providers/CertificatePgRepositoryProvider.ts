import { map } from 'lodash';
import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CertificateBaseInterface } from '../shared/certificate/common/interfaces/CertificateBaseInterface';
import { CertificateMetaInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { CertificateAccessLogInterface } from '../shared/certificate/common/interfaces/CertificateAccessLogInterface';
import {
  CertificateRepositoryProviderInterface,
  CertificateRepositoryProviderInterfaceResolver,
} from '../interfaces/CertificateRepositoryProviderInterface';

@provider({
  identifier: CertificateRepositoryProviderInterfaceResolver,
})
export class CertificatePgRepositoryProvider implements CertificateRepositoryProviderInterface {
  public readonly table = 'certificate.certificates';
  public readonly accessLogTable = 'certificate.access_log';

  constructor(protected connection: PostgresConnection) {}

  async findByUuid(uuid: string, withLog = false): Promise<CertificateInterface> {
    const result = await this.connection.getClient().query({
      text: `SELECT * FROM ${this.table} WHERE uuid = $1 LIMIT 1`,
      values: [uuid],
    });

    if (!result.rowCount) throw new NotFoundException(`Certificate not found: ${uuid}`);

    return withLog ? this.withLog(result.rows[0]) : result.rows[0];
  }

  async findById(_id: string, withLog = false): Promise<CertificateInterface> {
    const result = await this.connection.getClient().query({
      text: `SELECT * FROM ${this.table} WHERE _id = $1 LIMIT 1`,
      values: [_id],
    });

    if (!result.rowCount) throw new NotFoundException(`Certificate not found: ${_id}`);

    return withLog ? this.withLog(result.rows[0]) : result.rows[0];
  }

  async findByOperatorId(operator_id: string, withLog = false): Promise<CertificateInterface[]> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT * FROM ${this.table}
        WHERE operator_id = $1
      `,
      values: [operator_id],
    });

    if (!result.rowCount) return [];

    return (withLog ? this.withLog(result.rows) : result.rows) as CertificateInterface[];
  }

  async create(params: CertificateBaseInterface): Promise<CertificateInterface> {
    const { identity_uuid, operator_uuid, territory_uuid, start_at, end_at, meta } = params;
    const result = await this.connection.getClient().query({
      text: `
        INSERT INTO ${this.table}
        ( identity_uuid, operator_uuid, territory_uuid, start_at, end_at, meta )
        VALUES ( $1, $2, $3, $4, $5, $6 )
        RETURNING *
      `,
      values: [identity_uuid, operator_uuid, territory_uuid, start_at, end_at, meta],
    });

    if (!result.rowCount) throw new Error('Failed to create certificate');

    return result.rows[0];
  }

  async patchMeta(_id: string, params: CertificateMetaInterface): Promise<CertificateInterface> {
    const result = await this.connection.getClient().query({
      text: `
        UPDATE ${this.table}
        SET meta = $2
        WHERE _id = $1
        RETURNING *
      `,
      values: [_id, params],
    });

    if (!result.rowCount) throw new Error("Failed to patch certificate's meta data");

    return result.rows[0];
  }

  /**
   * Append a record to the access_log table for the certificate _id
   */
  async logAccess(_id: string, params: CertificateAccessLogInterface): Promise<void> {
    const { ip, user_agent, user_id, content_type } = params;
    const result = await this.connection.getClient().query({
      text: `
        INSERT INTO ${this.accessLogTable}
        ( certificate_id, ip, user_agent, user_id, content_type )
        VALUES ( $1, $2, $3, $4, $5 )
      `,
      values: [_id, ip, user_agent, user_id, content_type],
    });

    if (!result.rowCount) throw new Error('Failed to append to certificate log');
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
    const result = await this.connection.getClient().query(`
        SELECT * FROM ${this.accessLogTable}
        WHERE certificate_id IN (${map(certs, '_id').join(',')})
        ORDER BY certificate_id
    `);

    // merge access_log as a table in each certificate
    const merge = certs.map((cert) => ({
      ...cert,
      access_log: result.rows
        .filter((log) => log.certificate_id === cert._id)
        .sort((a, b) => (a.created_at > b.created_at ? 1 : -1)),
    }));

    return isMany ? merge : merge[0];
  }
}
