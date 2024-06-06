import { coerceDate, coerceInt } from '@/ilos/cli/index.ts';
import { CommandInterface, CommandOptionType, command } from '@/ilos/common/index.ts';
import { PostgresConnection } from '@/ilos/connection-postgres/index.ts';
import {
  CarpoolGeoRepository,
  CarpoolRepository,
  CarpoolRequestRepository,
  CarpoolStatusRepository,
} from '@/pdc/providers/carpool/index.ts';
import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum } from '@/pdc/providers/carpool/interfaces/index.ts';
import { date } from "@/deps.ts";

@command()
export class AcquisitionMigrateCommand implements CommandInterface {
  static readonly signature: string = 'acquisition:migrate';
  static readonly description: string = 'Migrate acquisition to v2';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-l, --loop',
      description: 'Process acquisition while remaining',
      default: false,
    },
    {
      signature: '-s, --size <size>',
      description: 'Batch size',
      coerce: coerceInt,
      default: 100,
    },
    {
      signature: '-a, --after <after>',
      description: 'Start date',
      coerce: coerceDate,
    },
    {
      signature: '-u, --until <until>',
      description: 'end date',
      coerce: coerceDate,
    },
  ];

  constructor(
    protected status: CarpoolStatusRepository,
    protected geo: CarpoolGeoRepository,
    protected carpool: CarpoolRepository,
    protected request: CarpoolRequestRepository,
    protected pg: PostgresConnection,
  ) {}

  public async call(options): Promise<string> {
    let shouldContinue = true;

    const batchSize = options.size;
    const timerMessage = `Migrating to v2`;
    console.time(timerMessage);

    do {
      const did = await this.migration(batchSize, options.after, options.until);
      // eslint-disable-next-line no-console
      console.timeLog(timerMessage);
      console.info(`Processed: ${did}`);
      shouldContinue = did === batchSize;
    } while (shouldContinue && options.loop);

    console.timeEnd(timerMessage);
    return 'done';
  }

  protected async migration(batchSize = 100, after?: Date, until?: Date): Promise<number> {
    const conn = await this.pg.getClient().connect();
    await conn.query<any>('BEGIN');
    try {
      const result = await conn.query<any>({
        text: `
          SELECT
            row_to_json(aa) as acquisition
          FROM acquisition.acquisitions aa
          LEFT JOIN carpool_v2.carpools cv2
            ON (aa.journey_id = cv2.operator_journey_id AND aa.operator_id = cv2.operator_id)
          WHERE
            ${after && until ? 'aa.created_at >= $2 AND aa.created_at < $3 AND' : ''}
            cv2._id IS NULL AND aa.status = 'ok'
          ORDER BY aa.created_at ASC
          LIMIT $1
        `,
        values: [batchSize, ...(after && until ? [after, until] : [])],
      });

      for (const { acquisition } of result.rows) {
        const incentiveResult = await conn.query<any>({
          text: `
            SELECT
              json_agg(row_to_json(inc)) as operator_incentives
            FROM carpool.incentives inc
            WHERE acquisition_id = $1
          `,
          values: [acquisition._id],
        });
        const incentives = incentiveResult.rows[0]?.operator_incentives || [];

        const carpoolResult = await conn.query<any>({
          text: `
            SELECT
              row_to_json(cp) as carpool,
              ST_Y(cp.start_position::geometry) as start_lat,
              ST_X(cp.start_position::geometry) as start_lon,
              ST_Y(cp.end_position::geometry) as end_lat,
              ST_X(cp.end_position::geometry) as end_lon,
              cpd.payment as driver_revenue,
              row_to_json(cpi) as passenger_identity,
              row_to_json(cdi) as driver_identity
            FROM carpool.carpools cp
            JOIN carpool.carpools cpd ON cp.acquisition_id = cpd.acquisition_id AND cpd.is_driver = true
            JOIN carpool.identities cpi ON cp.identity_id = cpi._id
            JOIN carpool.identities cdi ON cpd.identity_id = cdi._id
            WHERE cp.acquisition_id = $1 AND cp.is_driver = false
          `,
          values: [acquisition._id],
        });

        const { carpool, passenger_identity, driver_identity, driver_revenue, start_lat, start_lon, end_lat, end_lon } =
          carpoolResult.rows[0] || {};
        if (!carpool || !passenger_identity || !driver_identity) {
          continue;
        }

        const newCarpool = await this.carpool.register(
          {
            operator_id: carpool.operator_id,
            operator_journey_id: carpool.operator_journey_id,
            operator_trip_id: carpool.operator_trip_id,
            operator_class: carpool.operator_class,
            start_datetime: carpool.datetime,
            start_position: {
              lat: start_lat,
              lon: start_lon,
            },
            end_datetime: date.addSeconds(new Date(carpool.datetime), carpool.duration || carpool.meta.calc_duration || 0),
            end_position: {
              lat: end_lat,
              lon: end_lon,
            },
            distance: carpool.distance || carpool.meta.calc_distance || 0,
            licence_plate: undefined,
            driver_identity_key: driver_identity.identity_id,
            driver_operator_user_id: driver_identity.operator_user_id,
            driver_phone: driver_identity.phone,
            driver_phone_trunc: driver_identity.phone_trunc,
            driver_travelpass_name: driver_identity.travel_pass_name,
            driver_travelpass_user_id: driver_identity.travel_pass_user_id,
            driver_revenue: driver_revenue || 0,
            passenger_identity_key: passenger_identity.identity_id,
            passenger_operator_user_id: passenger_identity.operator_user_id,
            passenger_phone: passenger_identity.phone,
            passenger_phone_trunc: passenger_identity.phone_trunc,
            passenger_travelpass_name: passenger_identity.travel_pass_name,
            passenger_travelpass_user_id: passenger_identity.travel_pass_user_id,
            passenger_over_18: passenger_identity.over_18,
            passenger_seats: carpool.seats || 1,
            passenger_contribution: carpool.payment || 0,
            passenger_payments: carpool.meta?.payments || [],
            incentives: incentives.map((i) => ({ index: i.idx, siret: i.siret, amount: i.amount })),
          },
          conn,
        );

        await this.request.save(
          {
            carpool_id: newCarpool._id,
            operator_id: carpool.operator_id,
            operator_journey_id: carpool.operator_journey_id,
            payload: acquisition.payload,
            api_version: acquisition.api_version,
            created_at: acquisition.created_at,
          },
          conn,
        );

        await this.geo.upsert(
          {
            carpool_id: newCarpool._id,
            start_geo_code: carpool.start_geo_code,
            end_geo_code: carpool.end_geo_code,
          },
          conn,
        );

        let acquisitionStatus: CarpoolAcquisitionStatusEnum;
        let fraudStatus: CarpoolFraudStatusEnum = CarpoolFraudStatusEnum.Passed;

        switch (carpool.status) {
          case 'ok':
            acquisitionStatus = CarpoolAcquisitionStatusEnum.Processed;
            break;
          case 'expired':
            acquisitionStatus = CarpoolAcquisitionStatusEnum.Expired;
            break;
          case 'canceled':
            acquisitionStatus = CarpoolAcquisitionStatusEnum.Canceled;
            break;
          case 'fraudcheck_error':
            acquisitionStatus = CarpoolAcquisitionStatusEnum.Processed;
            fraudStatus = CarpoolFraudStatusEnum.Failed;
            break;
          default:
            acquisitionStatus = CarpoolAcquisitionStatusEnum.Processed;
            break;
        }

        await this.status.setStatus(newCarpool._id, 'acquisition', acquisitionStatus, conn);
        await this.status.setStatus(newCarpool._id, 'fraud', fraudStatus, conn);
      }
      await conn.query<any>('COMMIT');
      return result.rows.length;
    } catch (e) {
      console.error(e);
      await conn.query<any>('ROLLBACK');
    } finally {
      conn.release();
    }
  }
}
