import { PoolClient } from '@ilos/connection-postgres';

import { AcquisitionInterface } from '../../src/shared/acquisition/common/interfaces/AcquisitionInterface';
import { AcquisitionErrorInterface } from '../../src/shared/acquisition/common/interfaces/AcquisitionErrorInterface';

export function insertFactory(
  pool: PoolClient,
): { insertAcquisition: Function; insertError: Function; insertCarpool: Function } {
  return {
    async insertAcquisition(
      journey_id: string,
      application_id = 999999,
      operator_id = 999999,
    ): Promise<AcquisitionInterface> {
      const result = await pool.query({
        text: `
        INSERT INTO acquisition.acquisitions
        (application_id, operator_id, journey_id, payload)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
        values: [application_id, operator_id, journey_id, '{}'],
      });

      return result.rows[0];
    },

    async insertError(
      journey_id: string,
      operator_id = 999999,
      stage = 'acquisition',
    ): Promise<AcquisitionErrorInterface> {
      const result = await pool.query({
        text: `
        INSERT INTO acquisition.errors
        (operator_id, source, journey_id, error_stage)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
        values: [operator_id, 'test', journey_id, stage],
      });

      return result.rows[0];
    },

    async insertCarpool(
      journey_id: string,
      acquisition_id: number,
      status = 'ok',
      operator_id = 999999,
      identity_id = 999999,
    ): Promise<{ _id: number }> {
      const result = await pool.query({
        text: `
            INSERT INTO carpool.carpools
            (
              acquisition_id,
              operator_id,
              identity_id,
              operator_trip_id,
              status,
              is_driver
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING _id
          `,
        values: [acquisition_id, operator_id, identity_id, journey_id, status, true],
      });

      return result.rows[0];
    },
  };
}
