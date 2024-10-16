import { CertificateInterface } from "@/shared/certificate/common/interfaces/CertificateInterface.ts";
import {
  ResultRowInterface,
  RowType,
} from "@/shared/certificate/common/interfaces/ResultRowInterface.ts";

export function mapCertForListHelper(
  cert: CertificateInterface,
): ResultRowInterface {
  return {
    type: RowType.OK,
    uuid: cert.uuid,
    tz: cert.meta.tz,
    start_at: cert.start_at,
    end_at: cert.end_at,
    created_at: cert.created_at,
    positions: cert.meta.positions,
    identity: { uuid: cert.identity_uuid },
    operator: { _id: cert.operator_id, ...cert.meta.operator },
    driver: cert.meta.driver,
    passenger: cert.meta.passenger,
  };
}
