import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  CompanyRepositoryProviderInterfaceResolver,
  CompanyRepositoryProviderInterface,
} from '../interfaces/CompanyRepositoryProviderInterface';

import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

@provider({
  identifier: CompanyRepositoryProviderInterfaceResolver,
})
export class CompanyRepositoryProvider implements CompanyRepositoryProviderInterface {
  public readonly table = 'company.companies';

  constructor(protected connection: PostgresConnection) {}

  async findById(id: number): Promise<CompanyInterface> {
    const query = {
      text: `
      SELECT
        _id,
        siret,
        siren,
        nic,
        legal_name,
        company_naf_code,
        establishment_naf_code,
        legal_nature_code,
        legal_nature_label,
        intra_vat,
        headquarter,
        updated_at,
        nonprofit_code,
        address,
        address_street,
        address_postcode,
        address_cedex,
        address_city,
        ST_X(geo::geometry) as lon,
        ST_Y(geo::geometry) as lat
      FROM ${this.table}
      WHERE _id = $1::int
      LIMIT 1`,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      return undefined;
    }
    return result.rows[0];
  }

  async findBySiret(siret: string): Promise<CompanyInterface> {
    const query = {
      text: `
      SELECT
        _id,
        siret,
        siren,
        nic,
        legal_name,
        company_naf_code,
        establishment_naf_code,
        legal_nature_code,
        legal_nature_label,
        intra_vat,
        headquarter,
        updated_at,
        nonprofit_code,
        address,
        address_street,
        address_postcode,
        address_cedex,
        address_city,
        ST_X(geo::geometry) as lon,
        ST_Y(geo::geometry) as lat
      FROM ${this.table}
      WHERE siret = $1::varchar
      LIMIT 1`,
      values: [siret],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      return undefined;
    }
    return result.rows[0];
  }

  async updateOrCreate(data: CompanyInterface): Promise<void> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          siret,
          siren,
          nic,
          legal_name,
          company_naf_code,
          establishment_naf_code,
          legal_nature_code,
          legal_nature_label,
          intra_vat,
          headquarter,
          updated_at,
          nonprofit_code,
          address,
          address_street,
          address_postcode,
          address_cedex,
          address_city,
          geo
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17,
          $18
        )
        ON CONFLICT (siret)
        DO UPDATE SET
          siren = $2,
          nic = $3,
          legal_name = $4,
          company_naf_code = $5,
          establishment_naf_code = $6,
          legal_nature_code = $7,
          legal_nature_label = $8,
          intra_vat = $9,
          headquarter = $10,
          updated_at = $11,
          nonprofit_code = $12,
          address = $13,
          address_street = $14,
          address_postcode = $15,
          address_cedex = $16,
          address_city = $17,
          geo = $18
      `,
      values: [
        data.siret,
        data.siren,
        data.nic,
        data.legal_name,
        data.company_naf_code,
        data.establishment_naf_code,
        data.legal_nature_code,
        data.legal_nature_label,
        data.intra_vat,
        data.headquarter,
        new Date(),
        data.nonprofit_code,
        data.address,
        data.address_street,
        data.address_postcode,
        data.address_cedex,
        data.address_city,
        `POINT(${data.lon} ${data.lat})`,
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create or update company (${data.siret})`);
    }
    return;
  }
}
