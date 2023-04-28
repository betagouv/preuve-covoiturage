import { StatusEnum } from '../shared/acquisition/status.contract';

export function castStatus(carpoolStatus: string, acquisitionStatus: string, acquisitionError?: string): StatusEnum {
  switch (acquisitionStatus) {
    case 'canceled':
      return StatusEnum.Canceled;
    case 'pending':
      return StatusEnum.Pending;
    case 'error':
      switch(acquisitionError) {
        case 'acquisition':
          return StatusEnum.AcquisitionError;
        case 'normalization':
          return StatusEnum.NormalizationError;
        default:
          return StatusEnum.Unknown;
      }
    case 'ok':
      switch(carpoolStatus) {
        case 'ok':
          return StatusEnum.Ok;
        case 'expired':
          return StatusEnum.Expired;
        case 'canceled':
          return StatusEnum.Canceled;
        case 'fraudcheck_error':
          return StatusEnum.FraudError;
        default:
          return StatusEnum.Unknown;
      }
    default:
      return StatusEnum.Unknown;
  }
}
