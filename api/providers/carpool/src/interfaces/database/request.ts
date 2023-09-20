import { ApiVersion, CancelCode, CancelMessage, Id, Payload, Uuid } from '../common';

export interface InsertableCarpoolRequest {
  carpool_id: Id;
  operator_id: Id;
  operator_journey_id: Uuid;
  payload: Payload;
  api_version: ApiVersion;
  cancel_code: CancelCode;
  cancel_message: CancelMessage;
}

export interface WritenCarpoolRequest {
  _id: Id;
  created_at: Date;
}
