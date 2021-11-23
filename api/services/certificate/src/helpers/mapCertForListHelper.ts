import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { ResultRowInterface, RowType } from '../shared/certificate/common/interfaces/ResultRowInterface';

export function mapCertForListHelper(cert: CertificateInterface): ResultRowInterface {
  // return empty values for old format certificates
  if (!('driver' in cert.meta) || !('passenger' in cert.meta)) {
    return {
      type: RowType.EXPIRED,
      uuid: cert.uuid,
      tz: cert.meta.tz,
      positions: [],
      operator: cert.meta.operator,
      driver: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
      passenger: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
    };
  }

  return {
    type: RowType.OK,
    uuid: cert.uuid,
    tz: cert.meta.tz,
    positions: cert.meta.positions,
    operator: cert.meta.operator,
    driver: cert.meta.driver,
    passenger: cert.meta.passenger,
  };
}
