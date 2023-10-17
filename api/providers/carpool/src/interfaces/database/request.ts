import { ApiVersion, CancelCode, CancelMessage, Id, Payload, Uuid } from '../common';

export interface InsertableCarpoolCreateRequest {
  carpool_id: Id;
  operator_id: Id;
  operator_journey_id: Uuid;
  payload: Payload;
  api_version: ApiVersion;
}

export interface InsertableCarpoolCancelRequest {
  carpool_id: Id;
  operator_id: Id;
  operator_journey_id: Uuid;
  api_version: ApiVersion;
  cancel_code: CancelCode;
  cancel_message: CancelMessage;
}

export type InsertableCarpoolRequest = InsertableCarpoolCreateRequest | InsertableCarpoolCancelRequest;

export interface WrittenCarpoolRequest {
  _id: Id;
  created_at: Date;
}
