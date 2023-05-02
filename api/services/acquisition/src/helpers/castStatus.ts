import { StatusEnum } from '../shared/acquisition/status.contract';

export function castStatus(carpoolStatus: string, acquisitionStatus: string, acquisitionError?: string): StatusEnum {
  switch (acquisitionStatus) {
    case 'canceled':
      return StatusEnum.Canceled;
    case 'pending':
      return StatusEnum.Pending;
    case 'error':
      switch (acquisitionError) {
        case 'acquisition':
          return StatusEnum.AcquisitionError;
        case 'normalization':
          return StatusEnum.NormalizationError;
        case 'validation':
          return StatusEnum.ValidationError;
        default:
          return StatusEnum.Unknown;
      }
    case 'ok':
      switch (carpoolStatus) {
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

export function fromStatus(status: StatusEnum): {
  carpool_status?: string;
  acquisition_status: string;
  acquisition_error?: string;
} {
  switch (status) {
    case StatusEnum.AcquisitionError:
      return { acquisition_status: 'error', acquisition_error: 'acquisition' };
    case StatusEnum.NormalizationError:
      return { acquisition_status: 'error', acquisition_error: 'normalization' };
    case StatusEnum.ValidationError:
      return { acquisition_status: 'error', acquisition_error: 'validation' };
    case StatusEnum.Pending:
      return { acquisition_status: 'pending' };
    case StatusEnum.Ok:
      return { acquisition_status: 'ok', carpool_status: 'ok' };
    case StatusEnum.FraudError:
      return { acquisition_status: 'ok', carpool_status: 'fraudcheck_error' };
    case StatusEnum.Canceled:
      return { acquisition_status: 'ok', carpool_status: 'canceled' };
    case StatusEnum.Expired:
      return { acquisition_status: 'ok', carpool_status: 'expired' };
    case StatusEnum.Unknown:
    default:
      throw new Error('Unkown error, impossible to cast');
  }
}
