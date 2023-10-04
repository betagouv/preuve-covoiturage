import { ApiVersion, CancelCode, CancelMessage, Id, Uuid } from './common';
import { InsertableCarpool, UpdatableCarpool } from './database/carpool';

interface IApiVersion {
  api_version: ApiVersion;
}

export type RegisterRequest = InsertableCarpool & IApiVersion;

export interface UpdateRequest extends UpdatableCarpool, IApiVersion {
  operator_id: Id;
  operator_journey_id: Uuid;
}

export interface CancelRequest extends IApiVersion {
  operator_id: Id;
  operator_journey_id: Uuid;
  cancel_code: CancelCode;
  cancel_message: CancelMessage;
}
