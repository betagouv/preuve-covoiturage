import { get } from 'lodash';
import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { ResultRowInterface, RowType } from '../shared/certificate/list.contract';

export function mapCertForListHelper(cert: CertificateInterface): ResultRowInterface {
  // return empty values for old format certificates
  if (!('driver' in cert.meta) || !('passenger' in cert.meta)) {
    return {
      type: RowType.EXPIRED,
      uuid: cert.uuid,
      tz: cert.meta.tz,
      operator: cert.meta.operator,
      driver: { uniq_days: null, trips: null, km: null, euros: null },
      passenger: { uniq_days: null, trips: null, km: null, euros: null },
    };
  }

  return {
    type: RowType.OK,
    uuid: cert.uuid,
    tz: cert.meta.tz,
    operator: cert.meta.operator,
    driver: {
      uniq_days: get(cert, 'meta.driver.total.uniq_days', null),
      trips: get(cert, 'meta.driver.total.trips', null),
      km: get(cert, 'meta.driver.total.km', null),
      euros: get(cert, 'meta.driver.total.euros', null),
    },
    passenger: {
      uniq_days: get(cert, 'meta.passenger.total.uniq_days', null),
      trips: get(cert, 'meta.passenger.total.trips', null),
      km: get(cert, 'meta.passenger.total.km', null),
      euros: get(cert, 'meta.passenger.total.euros', null),
    },
  };
}
